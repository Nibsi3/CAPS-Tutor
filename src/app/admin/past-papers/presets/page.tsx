'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { subjects, contentSubjects, languageSubjects } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Loader2, Eye, Copy, Search, Star, X } from 'lucide-react';
import Link from 'next/link';
import { QuestionType, QUESTION_TYPES, getAllowedQuestionTypesForSubject } from '@/app/admin/past-papers/[id]/page';
import { TableCellEditor } from '@/components/admin/TableCellEditor';
import { InteractiveGraphEditor } from '@/components/admin/InteractiveGraphEditor';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useScrollRestore } from '@/hooks/use-scroll-restore';

interface CustomPreset {
  id?: string;
  userId?: string; // To distinguish system presets
  name: string;
  description: string;
  type: QuestionType;
  text: string;
  marks: number;
  subject?: string;
  instructionText?: string;
  options?: string[];
  tableData?: { headers: string[]; rows: string[][]; description?: string };
  graphData?: {
    type?: string;
    description?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    y2AxisLabel?: string;
    dataPoints?: Array<{ label: string; value: string | number; value2?: string | number; category?: string }>;
    showLegend?: boolean;
    showGrid?: boolean;
  };
  extractText?: string;
  diagramLabel?: string;
  hasDiagram?: boolean;
  answer?: string;
}

export default function CustomPresetsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [presets, setPresets] = useState<CustomPreset[]>([]);
  const [allPresets, setAllPresets] = useState<CustomPreset[]>([]); // Store all presets when fetched
  const [totalPresets, setTotalPresets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  // Use refs to track latest values without causing dependency array issues
  const allPresetsRef = useRef<CustomPreset[]>([]);
  const totalPresetsRef = useRef(0);
  const presetsRef = useRef<CustomPreset[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CustomPreset | null>(null);
  const [previewPreset, setPreviewPreset] = useState<CustomPreset | null>(null);
  const [searchQuery, setSearchQuery] = useLocalStorage<string>('presets-search-query', '');
  
  // Persist active tab across reloads
  const [activeTab, setActiveTab] = useLocalStorage<string>('presets-active-tab', 'create');
  const [selectedSubject, setSelectedSubject] = useLocalStorage<string>('presets-selected-subject', 'all');
  
  // Restore scroll position on reload
  useScrollRestore('presets-page');
  const [favoritePresetIds, setFavoritePresetIds] = useState<Set<string>>(new Set());
  const [visibleSubjectFilters, setVisibleSubjectFilters] = useState<string[]>([]);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [tempSelectedFilters, setTempSelectedFilters] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<CustomPreset>({
    name: '',
    description: '',
    type: 'short-answer',
    text: '',
    marks: 2,
    subject: '',
    instructionText: '',
    answer: '',
  });

  // Get all subjects for dropdown
  const allSubjects = subjects.map(s => ({ value: s.value, label: s.label }));

  // Load favorites and visible subject filters from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedFavorites = localStorage.getItem(`preset-favorites-${user.$id}`);
      if (savedFavorites) {
        try {
          setFavoritePresetIds(new Set(JSON.parse(savedFavorites)));
        } catch (e) {
          console.error('Error loading favorites:', e);
        }
      }
      
      const savedVisibleFilters = localStorage.getItem(`preset-visible-filters-${user.$id}`);
      if (savedVisibleFilters) {
        try {
          setVisibleSubjectFilters(JSON.parse(savedVisibleFilters));
        } catch (e) {
          console.error('Error loading visible filters:', e);
        }
      } else {
        // Default to first 5 subjects if nothing saved
        const defaultSubjects = allSubjects.slice(0, 5).map(s => s.value);
        setVisibleSubjectFilters(defaultSubjects);
        localStorage.setItem(`preset-visible-filters-${user.$id}`, JSON.stringify(defaultSubjects));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Always fetch all presets on initial load (no limit)
      fetchPresets(true);
    }
  }, [user]);

  // Handle search - do client-side filtering first, only fetch all if needed
  useEffect(() => {
    if (!user) return;

    // Get latest values from refs to avoid stale closures
    const currentAllPresets = allPresetsRef.current;
    const currentTotalPresets = totalPresetsRef.current;
    const currentPresets = presetsRef.current;

    // If no search query, show only first 50 presets
    if (!searchQuery.trim()) {
      // Show first 50 from what we have loaded
      if (currentAllPresets.length > 0) {
        const first50 = currentAllPresets.slice(0, 50);
        setPresets(first50);
        presetsRef.current = first50;
      } else if (currentPresets.length > 0 && currentPresets.length <= 50) {
        // If we already have presets displayed (from initial load), keep them
        // Don't clear them if allPresets isn't ready yet
        return;
      }
      // If we have nothing, don't do anything - let initial fetch handle it
      return;
    }

    // We have a search query - filter instantly from what we have
    const query = searchQuery.toLowerCase().trim();
    
    // Use allPresets if available and we have all of them, otherwise use current presets as fallback
    const presetsToFilter = (currentTotalPresets > 0 && currentAllPresets.length >= currentTotalPresets) 
      ? currentAllPresets 
      : (currentAllPresets.length > 0 ? currentAllPresets : currentPresets);
    
    // Filter from available presets
    const filteredFromLoaded = presetsToFilter.filter((preset) => {
      return (
        preset.name.toLowerCase().includes(query) ||
        preset.type.toLowerCase().includes(query) ||
        (preset.subject && preset.subject.toLowerCase().includes(query)) ||
        (preset.description && preset.description.toLowerCase().includes(query)) ||
        preset.text.toLowerCase().includes(query)
      );
    });

    // Always show filtered results (even if empty, user will see results after fetch completes)
    setPresets(filteredFromLoaded);
    presetsRef.current = filteredFromLoaded;

    // If we have all presets loaded, we're done (client-side filtering only)
    if (currentTotalPresets > 0 && currentAllPresets.length >= currentTotalPresets) {
      return;
    }

    // Otherwise, we need to fetch all presets to search properly
    // But debounce it significantly so we don't fetch on every keystroke
    setSearchLoading(true);
    const timeoutId = setTimeout(() => {
      fetchPresets(true);
    }, 800); // Only fetch after user stops typing for 800ms

    return () => {
      clearTimeout(timeoutId);
      // Don't clear searchLoading here - let fetchPresets handle it
    };
  }, [searchQuery, user]); // Only depend on searchQuery and user

  const fetchPresets = async (fetchAll: boolean = false) => {
    if (!user) return;
    
    try {
      // Use searchLoading for search operations, regular loading for initial load
      if (fetchAll) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      
      // Always fetch all presets (no limit) - there are thousands of questions in the database
      const limit = 0; // 0 means no limit - fetch all presets
      const response = await fetch(`/api/admin/custom-presets?userId=${user.$id}&limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        const fetchedPresets = data.presets;
        const total = data.total || 0;
        
        // Update state and refs
        setAllPresets(fetchedPresets); // Always store all fetched presets
        setTotalPresets(total);
        allPresetsRef.current = fetchedPresets;
        totalPresetsRef.current = total;
        
        // If searching, filter the fetched presets
        if (fetchAll && searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const filtered = fetchedPresets.filter((preset: CustomPreset) => {
            return (
              preset.name.toLowerCase().includes(query) ||
              preset.type.toLowerCase().includes(query) ||
              (preset.subject && preset.subject.toLowerCase().includes(query)) ||
              (preset.description && preset.description.toLowerCase().includes(query)) ||
              preset.text.toLowerCase().includes(query)
            );
          });
          setPresets(filtered);
          presetsRef.current = filtered;
        } else if (!fetchAll) {
          // Initial load - show only first 50, but store all
          const first50 = fetchedPresets.slice(0, 50);
          setPresets(first50);
          presetsRef.current = first50;
        } else {
          // Fetch all but no search - show all
          setPresets(fetchedPresets);
          presetsRef.current = fetchedPresets;
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to load presets',
        });
      }
    } catch (error: any) {
      console.error('Error fetching presets:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load presets',
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please log in to save presets',
      });
      return;
    }

    if (!formData.name || !formData.text) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in name and question text',
      });
      return;
    }

    try {
      setSaving(true);
      
      const presetData = {
        ...formData,
        userId: user.$id,
      };

      if (selectedPreset?.id) {
        // Update existing
        const response = await fetch('/api/admin/custom-presets', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            presetId: selectedPreset.id,
            ...presetData,
          }),
        });

        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Success',
            description: 'Preset updated successfully',
          });
          await fetchPresets(searchQuery.trim().length > 0);
          resetForm();
          setActiveTab('manage'); // Switch to manage tab after updating
        } else {
          // Check if it's a collection not found error
          if (data.code === 'COLLECTION_NOT_FOUND' || data.error?.includes('collection does not exist')) {
            throw new Error(
              'The custom presets collection has not been created yet. Please contact an administrator to create the "customPresets" collection in Appwrite.'
            );
          }
          throw new Error(data.error || 'Failed to update preset');
        }
      } else {
        // Create new
        const response = await fetch('/api/admin/custom-presets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(presetData),
        });

        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Success',
            description: 'Preset created successfully',
          });
          await fetchPresets(searchQuery.trim().length > 0);
          resetForm();
          setActiveTab('manage'); // Switch to manage tab after creating
        } else {
          // Check if it's a collection not found error
          if (data.code === 'COLLECTION_NOT_FOUND' || data.error?.includes('collection does not exist')) {
            throw new Error(
              'The custom presets collection has not been created yet. Please contact an administrator to create the "customPresets" collection in Appwrite.'
            );
          }
          throw new Error(data.error || 'Failed to create preset');
        }
      }
    } catch (error: any) {
      console.error('Error saving preset:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save preset',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (presetId: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      const response = await fetch(`/api/admin/custom-presets?presetId=${presetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Preset deleted successfully',
        });
        await fetchPresets(searchQuery.trim().length > 0);
        if (selectedPreset?.id === presetId) {
          resetForm();
        }
      } else {
        // Check if it's a collection not found error
        if (data.code === 'COLLECTION_NOT_FOUND' || data.error?.includes('collection does not exist')) {
          throw new Error(
            'The custom presets collection has not been created yet. Please contact an administrator to create the "customPresets" collection in Appwrite.'
          );
        }
        throw new Error(data.error || 'Failed to delete preset');
      }
    } catch (error: any) {
      console.error('Error deleting preset:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete preset',
      });
    }
  };

  const handleEdit = (preset: CustomPreset) => {
    setSelectedPreset(preset);
    setFormData({
      name: preset.name || '',
      description: preset.description || '',
      type: preset.type || 'short-answer',
      text: preset.text || '',
      marks: preset.marks || 2,
      subject: preset.subject || '',
      instructionText: preset.instructionText || '',
      options: preset.options || [],
      tableData: preset.tableData,
      graphData: preset.graphData,
      extractText: preset.extractText || '',
      diagramLabel: preset.diagramLabel || '',
      hasDiagram: preset.hasDiagram || false,
      answer: preset.answer || '',
    });
    setActiveTab('create'); // Switch to create tab when editing
  };

  const handleDuplicate = async (preset: CustomPreset) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please log in to duplicate presets',
      });
      return;
    }

    try {
      setSaving(true);
      
      // Create a duplicate with "Copy" appended to the name
      const duplicateData = {
        ...preset,
        userId: user.$id,
        name: `${preset.name} (Copy)`,
        // Remove the id so it creates a new preset
        id: undefined,
      };

      const response = await fetch('/api/admin/custom-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Preset duplicated successfully',
        });
        await fetchPresets(searchQuery.trim().length > 0);
      } else {
        // Check if it's a collection not found error
        if (data.code === 'COLLECTION_NOT_FOUND' || data.error?.includes('collection does not exist')) {
          throw new Error(
            'The custom presets collection has not been created yet. Please contact an administrator to create the "customPresets" collection in Appwrite.'
          );
        }
        throw new Error(data.error || 'Failed to duplicate preset');
      }
    } catch (error: any) {
      console.error('Error duplicating preset:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to duplicate preset',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (preset: CustomPreset) => {
    setPreviewPreset(preset);
  };

  const toggleFavorite = (presetId: string) => {
    if (!user) return;
    
    const newFavorites = new Set(favoritePresetIds);
    if (newFavorites.has(presetId)) {
      newFavorites.delete(presetId);
    } else {
      newFavorites.add(presetId);
    }
    
    setFavoritePresetIds(newFavorites);
    // Save to localStorage
    localStorage.setItem(`preset-favorites-${user.$id}`, JSON.stringify(Array.from(newFavorites)));
    
    toast({
      title: newFavorites.has(presetId) ? 'Added to favorites' : 'Removed from favorites',
      description: newFavorites.has(presetId) 
        ? 'This preset will always be visible when you filter by favorites'
        : 'This preset is no longer in your favorites',
    });
  };

  const handleOpenDialog = () => {
    setTempSelectedFilters([...visibleSubjectFilters]);
    setShowAddSubjectDialog(true);
  };

  const handleToggleSubject = (subjectValue: string, checked: boolean) => {
    setTempSelectedFilters(prev => {
      if (checked) {
        return [...prev, subjectValue];
      } else {
        return prev.filter(s => s !== subjectValue);
      }
    });
  };

  const handleApplySubjects = () => {
    if (!user) return;
    
    setVisibleSubjectFilters([...tempSelectedFilters]);
    localStorage.setItem(`preset-visible-filters-${user.$id}`, JSON.stringify(tempSelectedFilters));
    setShowAddSubjectDialog(false);
    
    toast({
      title: 'Filters updated',
      description: `${tempSelectedFilters.length} subject filter${tempSelectedFilters.length !== 1 ? 's' : ''} active`,
    });
  };

  const removeSubjectFilter = (subjectValue: string) => {
    if (!user) return;
    
    const newFilters = visibleSubjectFilters.filter(s => s !== subjectValue);
    setVisibleSubjectFilters(newFilters);
    localStorage.setItem(`preset-visible-filters-${user.$id}`, JSON.stringify(newFilters));
    
    // If the removed subject was selected, reset to 'all'
    if (selectedSubject === subjectValue) {
      setSelectedSubject('all');
    }
  };

  const resetForm = () => {
    setSelectedPreset(null);
    setFormData({
      name: '',
      description: '',
      type: 'short-answer',
      text: '',
      marks: 2,
      subject: '',
      instructionText: '',
      answer: '',
    });
  };

  // Get allowed question types based on selected subject
  const allowedTypes = getAllowedQuestionTypesForSubject(formData.subject);
  const availableTypes = Object.values(QUESTION_TYPES).flat().filter(type => 
    allowedTypes.includes(type)
  );

  // Memoize filtered presets to ensure they update when filters change
  const filteredPresets = useMemo(() => {
    return presets.filter((preset) => {
      // Subject filter - normalize comparison to handle whitespace and case
      if (selectedSubject !== 'all') {
        const presetSubject = preset.subject?.trim() || '';
        const selectedSubjectTrimmed = selectedSubject.trim();
        if (presetSubject !== selectedSubjectTrimmed) {
          return false;
        }
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          preset.name.toLowerCase().includes(query) ||
          preset.type.toLowerCase().includes(query) ||
          (preset.subject && preset.subject.toLowerCase().includes(query)) ||
          (preset.description && preset.description.toLowerCase().includes(query)) ||
          preset.text.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [presets, selectedSubject, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/past-papers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Custom Presets</h1>
            <p className="text-muted-foreground">
              Create and manage your own question presets with diagrams, graphs, tables, and answers
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab || 'create'} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Preset</TabsTrigger>
          <TabsTrigger value="manage">Manage Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Preset</CardTitle>
              <CardDescription>
                Build your own question preset with all features: text, diagrams, graphs, tables, and optional answers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Preset Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Photosynthesis Diagram Question"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Combobox
                    options={allSubjects}
                    value={formData.subject || ''}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    placeholder="Select subject..."
                    searchPlaceholder="Search subjects..."
                    emptyText="No subjects found."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this preset"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Question Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: QuestionType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(QUESTION_TYPES).map(([category, types]) => {
                        const categoryTypes = types.filter(type => availableTypes.includes(type));
                        if (categoryTypes.length === 0) return null;
                        return (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                              {category}
                            </div>
                            {categoryTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marks">Marks *</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 2 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text">Question Text *</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter the question text..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="instructionText">Instruction Text (Optional)</Label>
                <Input
                  id="instructionText"
                  value={formData.instructionText || ''}
                  onChange={(e) => setFormData({ ...formData, instructionText: e.target.value })}
                  placeholder="e.g., Show all your calculations"
                />
              </div>

              {/* Question Type Specific Fields */}
              {formData.type === 'multiple-choice' && (
                <div>
                  <Label>Multiple Choice Options *</Label>
                  <div className="space-y-2 mt-2">
                    {(formData.options || ['', '', '', '']).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(formData.options || ['', '', '', ''])];
                            newOptions[index] = e.target.value;
                            setFormData({ ...formData, options: newOptions });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                        {(formData.options || []).length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOptions = [...(formData.options || [])];
                              newOptions.splice(index, 1);
                              setFormData({ ...formData, options: newOptions });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          options: [...(formData.options || []), ''],
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {(formData.type === 'table-interpretation' || formData.type === 'table' || 
                formData.type === 'data-set-analysis' || formData.type === 'matching-pairing') && (
                <div>
                  <Label>Table Data</Label>
                  <div className="mt-2 border rounded-lg p-4">
                    <TableCellEditor
                      tableData={formData.tableData || { headers: ['Column 1', 'Column 2'], rows: [['', '']] }}
                      onUpdate={(updated) => setFormData({ ...formData, tableData: updated })}
                    />
                  </div>
                </div>
              )}

              {(formData.type === 'graph-interpretation' || formData.type === 'graph') && (
                <div>
                  <Label>Graph Data</Label>
                  <div className="mt-2 border rounded-lg p-4">
                    <InteractiveGraphEditor
                      graphData={formData.graphData || {
                        type: 'bar',
                        description: '',
                        dataPoints: [],
                      }}
                      onUpdate={(updated) => setFormData({ ...formData, graphData: updated })}
                    />
                  </div>
                </div>
              )}

              {(formData.type === 'extract-source' || formData.type === 'extract' || formData.type === 'case-study') && (
                <div>
                  <Label>Extract Text</Label>
                  <Textarea
                    value={formData.extractText || ''}
                    onChange={(e) => setFormData({ ...formData, extractText: e.target.value })}
                    placeholder="Enter the extract or source text..."
                    rows={6}
                  />
                </div>
              )}

              {(formData.type === 'diagram-interpretation' || formData.type === 'diagram-labeling' || formData.type === 'diagram' || formData.type === 'map-cartoon') && (
                <div>
                  <Label>
                    <input
                      type="checkbox"
                      checked={formData.hasDiagram || false}
                      onChange={(e) => setFormData({ ...formData, hasDiagram: e.target.checked })}
                      className="mr-2"
                    />
                    Include Diagram
                  </Label>
                  {formData.hasDiagram && (
                    <div className="mt-2">
                      <Input
                        value={formData.diagramLabel || ''}
                        onChange={(e) => setFormData({ ...formData, diagramLabel: e.target.value })}
                        placeholder="Diagram label/description (e.g., Figure 1: Heart Structure)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: You can upload the actual diagram image when using this preset in the paper editor.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="answer">Answer (Optional)</Label>
                <Textarea
                  id="answer"
                  value={formData.answer || ''}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer or solution (optional)..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {selectedPreset ? 'Update Preset' : 'Save Preset'}
                    </>
                  )}
                </Button>
                {selectedPreset && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Preview Preset</DialogTitle>
                      <DialogDescription>
                        This is how your preset will appear when applied
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-4 p-4">
                        <div>
                          <h3 className="font-semibold mb-2">{formData.name}</h3>
                          <p className="text-sm text-muted-foreground">{formData.description}</p>
                        </div>
                        <div>
                          <p className="mb-2">{formData.text}</p>
                          {formData.instructionText && (
                            <p className="text-sm text-muted-foreground italic">{formData.instructionText}</p>
                          )}
                        </div>
                        {formData.options && formData.options.length > 0 && (
                          <div>
                            <p className="font-medium mb-2">Options:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {formData.options.map((opt, idx) => (
                                <li key={idx}>{String.fromCharCode(65 + idx)}. {opt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {formData.tableData && (
                          <div>
                            <p className="font-medium mb-2">Table:</p>
                            <div className="border rounded p-2">
                              {/* Table preview */}
                            </div>
                          </div>
                        )}
                        {formData.hasDiagram && (
                          <div>
                            <Badge variant="secondary">Diagram: {formData.diagramLabel || 'Untitled'}</Badge>
                          </div>
                        )}
                        {formData.answer && (
                          <div className="border-t pt-4">
                            <p className="font-medium mb-2">Answer:</p>
                            <p className="text-sm">{formData.answer}</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Custom Presets</CardTitle>
                  <CardDescription>
                    View, edit, duplicate, and delete your custom presets
                  </CardDescription>
                </div>
                {totalPresets > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{totalPresets}</div>
                    <div className="text-sm text-muted-foreground">
                      {totalPresets === 1 ? 'preset' : 'presets'} total
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Always show search bar if we have presets or are searching */}
                  {(totalPresets > 0 || searchQuery.trim().length > 0) && (
                    <div className="mb-4 space-y-3">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search presets by name, type, or subject..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        {searchLoading && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Subject Filter Buttons - always show if we have presets */}
                      {totalPresets > 0 && (
                        <>
                          {!searchQuery && selectedSubject === 'all' && totalPresets > 50 && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                              Showing {presets.length} of {totalPresets} presets. Use the search bar above to find specific presets.
                            </div>
                          )}
                          {(searchQuery || selectedSubject !== 'all') && presets.length > 0 && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                              {searchQuery 
                                ? `Found ${filteredPresets.length} preset${filteredPresets.length !== 1 ? 's' : ''} matching your search${selectedSubject !== 'all' ? ` and ${allSubjects.find(s => s.value === selectedSubject)?.label || selectedSubject} filter` : ''}.`
                                : `Showing ${filteredPresets.length} preset${filteredPresets.length !== 1 ? 's' : ''} for ${allSubjects.find(s => s.value === selectedSubject)?.label || selectedSubject}.`}
                            </div>
                          )}
                          
                          {/* Subject Filter Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant={selectedSubject === 'all' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSubject('all')}
                        className="h-8 text-xs"
                      >
                        All
                      </Button>
                      
                      {/* Add Subject Filters Button */}
                      <Dialog 
                        open={showAddSubjectDialog} 
                        onOpenChange={(open) => {
                          if (!open) {
                            // Reset temp selections when dialog closes without applying
                            setTempSelectedFilters([...visibleSubjectFilters]);
                          }
                          setShowAddSubjectDialog(open);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="gap-2"
                            onClick={handleOpenDialog}
                          >
                            <Plus className="h-4 w-4" />
                            Add Subject Filters
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Select Subjects</DialogTitle>
                            <DialogDescription>
                              Choose one or more subjects to show as filter buttons. These will appear below the search bar.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto py-4">
                            {allSubjects.length > 0 ? (
                              allSubjects.map((subject) => (
                                <div
                                  key={subject.value}
                                  className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all duration-200"
                                >
                                  <Checkbox
                                    id={subject.value}
                                    checked={tempSelectedFilters.includes(subject.value)}
                                    onCheckedChange={(checked) => handleToggleSubject(subject.value, checked as boolean)}
                                  />
                                  <label
                                    htmlFor={subject.value}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                  >
                                    {subject.label}
                                  </label>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>No subjects available</p>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setTempSelectedFilters([...visibleSubjectFilters]);
                                setShowAddSubjectDialog(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleApplySubjects}
                            >
                              Apply ({tempSelectedFilters.length})
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Selected Subjects as Buttons */}
                      {visibleSubjectFilters.length > 0 && (
                        <>
                          {visibleSubjectFilters.map((subjectValue) => {
                            const subject = allSubjects.find(s => s.value === subjectValue);
                            if (!subject) return null;
                            return (
                              <Button
                                key={subjectValue}
                                type="button"
                                variant={selectedSubject === subjectValue ? "default" : "secondary"}
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  if (selectedSubject === subjectValue) {
                                    setSelectedSubject('all');
                                  } else {
                                    setSelectedSubject(subjectValue);
                                  }
                                }}
                                onMouseDown={(e) => {
                                  // Allow clicking X to remove without triggering filter
                                  if ((e.target as HTMLElement).closest('.remove-btn')) {
                                    e.preventDefault();
                                    removeSubjectFilter(subjectValue);
                                  }
                                }}
                              >
                                <span>{subject.label}</span>
                                <X 
                                  className="h-3 w-3 remove-btn cursor-pointer hover:text-destructive" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSubjectFilter(subjectValue);
                                  }}
                                />
                              </Button>
                            );
                          })}
                        </>
                      )}
                    </div>
                      </>
                      )}
                    </div>
                  )}

                  {presets.length === 0 && totalPresets === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No custom presets yet. Create your first preset in the "Create Preset" tab.
                    </div>
                  ) : presets.length === 0 && totalPresets > 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery.trim() 
                        ? `No presets found matching "${searchQuery}". Try a different search term.`
                        : `Loading presets... (${totalPresets} total)`}
                    </div>
                  ) : (
                    <>
                      {/* Presets List */}
                      <div className="space-y-4">
                    {filteredPresets
                      .map((preset) => (
                        <Card key={preset.id} className="p-4 hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold">{preset.name}</h3>
                                {preset.userId === 'system-generator' && (
                                  <Badge variant="default" className="text-xs bg-blue-600">System</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {preset.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                            {preset.subject && (
                                  <Badge variant="secondary" className="text-xs">
                                    {preset.subject}
                                  </Badge>
                            )}
                            {preset.answer && (
                                  <Badge variant="default" className="text-xs">Has Answer</Badge>
                            )}
                          </div>
                          {preset.description && (
                            <p className="text-sm text-muted-foreground mb-2">{preset.description}</p>
                          )}
                              <p className="text-sm mb-2 line-clamp-2">
                                {preset.text.length > 150 ? `${preset.text.substring(0, 150)}...` : preset.text}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                <span className="font-medium">{preset.marks} marks</span>
                                {preset.hasDiagram && <Badge variant="outline" className="text-xs">Diagram</Badge>}
                                {preset.tableData && <Badge variant="outline" className="text-xs">Table</Badge>}
                                {preset.graphData && <Badge variant="outline" className="text-xs">Graph</Badge>}
                                {preset.extractText && <Badge variant="outline" className="text-xs">Extract</Badge>}
                                {preset.options && preset.options.length > 0 && (
                                  <Badge variant="outline" className="text-xs">MCQ ({preset.options.length} options)</Badge>
                                )}
                          </div>
                        </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Favorite Button */}
                              {preset.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleFavorite(preset.id!)}
                                  title={favoritePresetIds.has(preset.id) ? 'Remove from favorites' : 'Add to favorites'}
                                  className="p-1 h-8 w-8"
                                >
                                  <Star 
                                    className={`h-4 w-4 ${
                                      favoritePresetIds.has(preset.id) 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground'
                                    }`} 
                                  />
                                </Button>
                              )}
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreview(preset)}
                                title="Preview preset"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {preset.userId === 'system-generator' ? (
                                // System presets can only be duplicated, not edited or deleted
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDuplicate(preset)}
                                  disabled={saving}
                                  title="Duplicate system preset"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              ) : (
                                // User presets can be edited, duplicated, and deleted
                                <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(preset)}
                                    title="Edit preset"
                          >
                            Edit
                          </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDuplicate(preset)}
                                    disabled={saving}
                                    title="Duplicate preset"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => preset.id && handleDelete(preset.id)}
                                    title="Delete preset"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                                </>
                              )}
                        </div>
                      </div>
                    </Card>
                  ))}
                        {filteredPresets.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            {selectedSubject !== 'all'
                              ? `No presets found for ${allSubjects.find(s => s.value === selectedSubject)?.label || selectedSubject}.`
                              : searchQuery
                              ? 'No presets match your search query.'
                              : 'No presets found.'}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Preview Dialog */}
          <Dialog open={!!previewPreset} onOpenChange={() => setPreviewPreset(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Preview: {previewPreset?.name}</DialogTitle>
                <DialogDescription>
                  This is how the preset appears when applied
                </DialogDescription>
              </DialogHeader>
              {previewPreset && (
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 p-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{previewPreset.type}</Badge>
                        {previewPreset.subject && (
                          <Badge variant="secondary">{previewPreset.subject}</Badge>
                        )}
                        <Badge variant="default">{previewPreset.marks} marks</Badge>
                      </div>
                      {previewPreset.description && (
                        <p className="text-sm text-muted-foreground mb-2">{previewPreset.description}</p>
                      )}
                    </div>
                    <div>
                      <p className="mb-2 whitespace-pre-wrap">{previewPreset.text}</p>
                      {previewPreset.instructionText && (
                        <p className="text-sm text-muted-foreground italic">{previewPreset.instructionText}</p>
                      )}
                    </div>
                    {previewPreset.options && previewPreset.options.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Options:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {previewPreset.options.map((opt, idx) => (
                            <li key={idx}>{String.fromCharCode(65 + idx)}. {opt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {previewPreset.tableData && (
                      <div>
                        <p className="font-medium mb-2">Table:</p>
                        <div className="border rounded p-2">
                          <table className="w-full text-sm">
                            <thead>
                              <tr>
                                {previewPreset.tableData.headers.map((header, idx) => (
                                  <th key={idx} className="border px-2 py-1 text-left">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewPreset.tableData.rows.slice(0, 3).map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="border px-2 py-1">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {previewPreset.tableData.rows.length > 3 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              ... and {previewPreset.tableData.rows.length - 3} more rows
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {previewPreset.hasDiagram && (
                      <div>
                        <Badge variant="secondary">Diagram: {previewPreset.diagramLabel || 'Untitled'}</Badge>
                      </div>
                    )}
                    {previewPreset.graphData && (
                      <div>
                        <p className="font-medium mb-2">Graph:</p>
                        <Badge variant="secondary">
                          {previewPreset.graphData.type || 'bar'} chart
                          {previewPreset.graphData.dataPoints && 
                            ` (${previewPreset.graphData.dataPoints.length} data points)`}
                        </Badge>
                      </div>
                    )}
                    {previewPreset.extractText && (
                      <div>
                        <p className="font-medium mb-2">Extract:</p>
                        <p className="text-sm whitespace-pre-wrap line-clamp-4">
                          {previewPreset.extractText}
                        </p>
                      </div>
                    )}
                    {previewPreset.answer && (
                      <div className="border-t pt-4">
                        <p className="font-medium mb-2">Answer:</p>
                        <p className="text-sm whitespace-pre-wrap">{previewPreset.answer}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

