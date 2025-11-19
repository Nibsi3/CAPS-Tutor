'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Settings,
  FileText,
  BookOpen,
  Calendar,
  School,
  Bot,
  ToggleLeft,
  MessageSquare,
  Shield,
  Sliders,
  UserX,
  Key,
  Monitor,
  Trash2,
  Download,
  Users,
  Bell,
  Wrench,
  RefreshCw,
  FileDown,
  HardDrive,
  Clock,
  FileCheck,
  Mail,
  Smartphone,
  KeyRound,
  TrendingUp,
  Save,
  Plus,
  Edit,
  X,
  AlertTriangle,
  Loader,
  MoreHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/appwrite';
import * as adminAPI from '@/lib/admin-api';
import { getSubjectsForGrade } from '@/components/home/AllSubjectsSection';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useScrollRestore } from '@/hooks/use-scroll-restore';

export default function ContentControlPage() {
  const { toast } = useToast();
  const { user } = useUser();

  // Persist active tab across reloads
  const [activeTab, setActiveTab] = useLocalStorage<string>('admin-content-control-tab', 'content');
  
  // Active child section per parent tab
  const [activeChildSection, setActiveChildSection] = useLocalStorage<Record<string, string>>(
    'admin-content-control-child-sections',
    {
      content: 'weekly-tasks',
      users: 'user-accounts',
      system: 'announcements',
      compliance: 'audit-logs',
      integrations: 'email-sms',
    }
  );

  // Ensure current tab has a default child section if not set
  useEffect(() => {
    const currentTab = activeTab || 'content';
    if (!activeChildSection[currentTab]) {
      const defaultSections: Record<string, string> = {
        content: 'weekly-tasks',
        users: 'user-accounts',
        system: 'announcements',
        compliance: 'audit-logs',
        integrations: 'email-sms',
      };
      setActiveChildSection((prev) => ({
        ...prev,
        [currentTab]: defaultSections[currentTab] || 'weekly-tasks',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  // Restore scroll position on reload
  useScrollRestore('admin-content-control');

  // State for various settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceDuration, setMaintenanceDuration] = useState('');
  const [responseLimit, setResponseLimit] = useState(100);
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [safetyFilters, setSafetyFilters] = useState(true);
  const [features, setFeatures] = useState({
    aiTutor: true,
    pastPapers: true,
    practiceQuestions: true,
    weeklyTasks: false,
    achievements: true,
    progressTracking: true,
  });
  const [loading, setLoading] = useState(false);


  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useLocalStorage<string>('admin-content-control-user-search', '');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [changingRole, setChangingRole] = useState<string | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<Set<string>>(new Set());
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState('medium');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementTargetAudience, setAnnouncementTargetAudience] = useState<'students' | 'admins' | 'both'>('both');
  const [announcementScheduledStart, setAnnouncementScheduledStart] = useState('');
  const [announcementScheduledEnd, setAnnouncementScheduledEnd] = useState('');
  const [announcementUseScheduling, setAnnouncementUseScheduling] = useState(false);

  // Subject Availability state
  const [subjectAvailability, setSubjectAvailability] = useState<Record<string, string[]>>({});
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const [addSubjectDialogOpen, setAddSubjectDialogOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  // Storage stats state
  const [storageStats, setStorageStats] = useState<any>(null);
  const [loadingStorage, setLoadingStorage] = useState(false);

  // Audit logs state
  const [auditLogStartDate, setAuditLogStartDate] = useState('');
  const [auditLogEndDate, setAuditLogEndDate] = useState('');
  const [auditLogType, setAuditLogType] = useState('all');
  const [downloadingLogs, setDownloadingLogs] = useState(false);

  // POPIA requests state
  const [popiaRequests, setPopiaRequests] = useState<any[]>([]);
  const [loadingPOPIA, setLoadingPOPIA] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loadingAPIKeys, setLoadingAPIKeys] = useState(false);
  const [newAPIKey, setNewAPIKey] = useState({ serviceName: '', apiKey: '', description: '', active: true });


  // User Restrictions state
  const [restrictionDialogOpen, setRestrictionDialogOpen] = useState(false);
  const [selectedRestrictionUser, setSelectedRestrictionUser] = useState<any>(null);
  const [restrictionType, setRestrictionType] = useState('ban');
  const [restrictionReason, setRestrictionReason] = useState('');

  // Password Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Device/Activity state
  const [activityEmail, setActivityEmail] = useState('');

  // Retention Policies state
  const handlePasswordReset = async () => {
    if (!resetEmail || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setResettingPassword(true);
    try {
      const response = await adminAPI.resetPassword(resetEmail, newPassword);
      if (response.success) {
        toast({
          title: "Success",
          description: "Password reset email sent successfully.",
        });
        setResetEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordResetDialogOpen(false);
      } else {
        toast({
          title: "Note",
          description:
            response.message ||
            response.error ||
            "Password reset requires user-initiated flow. Please use Appwrite Console or password reset email flow.",
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Note",
        description:
          error.message ||
          "Password reset requires user-initiated flow. Please use Appwrite Console or password reset email flow.",
        variant: "default",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const renderPasswordResetForm = () => (
    <div className="space-y-4">
      <div>
        <Label>User Email</Label>
        <Input
          placeholder="user@example.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
        />
      </div>
      <div>
        <Label>New Password</Label>
        <Input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div>
        <Label>Confirm Password</Label>
        <Input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <Button onClick={handlePasswordReset} disabled={resettingPassword}>
        {resettingPassword ? (
          <Loader className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Key className="h-4 w-4 mr-2" />
        )}
        Reset Password
      </Button>
    </div>
  );

  const [userDataRetention, setUserDataRetention] = useState('7years');
  const [activityLogsRetention, setActivityLogsRetention] = useState('2years');

  // Load initial data
  useEffect(() => {
    if (user) {
      loadSystemSettings();
      loadUsers();
      loadAnnouncements();
      loadSubjectAvailability();
      loadStorageStats();
      loadPOPIARequests();
      loadAPIKeys();
    }
  }, [user]);

  // Debounce user search
  useEffect(() => {
    if (!user) return;
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [userSearch]);

  // Load functions
  const loadSystemSettings = async (force = false) => {
    try {
      const response = await adminAPI.getSystemSettings({ force });
      if (response.success) {
        const settings = response.settings;
        setMaintenanceMode(settings.maintenanceMode || false);
        setMaintenanceMessage(settings.maintenanceMessage || '');
        setMaintenanceDuration(settings.maintenanceDuration || '');
        setResponseLimit(settings.aiConfig?.responseLimit || 100);
        setDifficultyLevel(settings.aiConfig?.difficultyLevel || 'medium');
        setSafetyFilters(settings.aiConfig?.safetyFilters !== false);
        setFeatures(settings.features || features);
        setUserDataRetention(settings.retentionPolicies?.userData || '7years');
        setActivityLogsRetention(settings.retentionPolicies?.activityLogs || '2years');
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };


  const loadUsers = async (force = false) => {
    setLoadingUsers(true);
    try {
      const [response, rolesResponse] = await Promise.all([
        adminAPI.getUsers(
          { limit: 50, search: userSearch || undefined },
          { force }
        ),
        adminAPI.getAccessRoles({ force }),
      ]);

      if (response.success) {
        setUsers(response.users || []);
      }

      if (rolesResponse.success) {
        const rolesMap: Record<string, string> = {};
        rolesResponse.users?.forEach((userRole: any) => {
          rolesMap[userRole.id] = userRole.currentRole || 'user';
          rolesMap[userRole.email] = userRole.currentRole || 'user';
        });
        setUserRoles(rolesMap);
      }
    } catch (error) {
      console.error('Error loading users or roles:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAnnouncements = async (force = false) => {
    setLoadingAnnouncements(true);
    try {
      // Load ALL announcements (not just active ones) for the admin view
      const response = await adminAPI.getAnnouncements(undefined, { force });
      console.log('Loaded announcements response:', response);
      console.log('Announcements array:', response?.announcements);
      console.log('Announcements count:', response?.announcements?.length || 0);
      
      if (response && response.success) {
        const announcementsList = response.announcements || [];
        console.log('Setting announcements state with', announcementsList.length, 'items');
        setAnnouncements(announcementsList);
      } else {
        console.warn('Failed to load announcements - response not successful:', response);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const toggleAnnouncementSelection = (announcementId: string) => {
    setSelectedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedAnnouncements.size === announcements.length) {
      setSelectedAnnouncements(new Set());
    } else {
      setSelectedAnnouncements(new Set(announcements.map(a => a.$id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAnnouncements.size === 0) {
      toast({
        title: "No selection",
        description: "Please select at least one announcement to delete.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedAnnouncements.size} announcement(s)?`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteAnnouncements(Array.from(selectedAnnouncements));
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || `Successfully deleted ${response.deleted || selectedAnnouncements.size} announcement(s).`,
        });
        setSelectedAnnouncements(new Set());
        loadAnnouncements(true);
      } else {
        throw new Error(response.error || 'Failed to delete announcements');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcements.",
        variant: "destructive",
      });
    }
  };

  const openRestrictionForUser = (userItem: any) => {
    setSelectedRestrictionUser(userItem);
    setRestrictionType('ban');
    setRestrictionReason('');
    setRestrictionDialogOpen(true);
  };

  const closeRestrictionDialog = () => {
    setRestrictionDialogOpen(false);
    setSelectedRestrictionUser(null);
    setRestrictionReason('');
    setRestrictionType('ban');
  };

  const handleApplyRestriction = async () => {
    if (!user || !selectedRestrictionUser) return;
    if (!restrictionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Reason required',
        description: 'Please provide a reason for this restriction.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.applyRestriction({
        email: selectedRestrictionUser.email,
        restrictionType,
        reason: restrictionReason,
        adminId: user.$id,
      });
      if (response.success) {
        toast({
          title: 'Restriction applied',
          description: `Updated access for ${selectedRestrictionUser.email}.`,
        });
        closeRestrictionDialog();
        loadUsers(true);
      } else {
        throw new Error(response.error || 'Failed to apply restriction');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply restriction.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectAvailability = async (force = false) => {
    try {
      const response = await adminAPI.getSubjectAvailability({ force });
      if (response.success) {
        setSubjectAvailability(response.availability || {});
        // Load custom subjects from system settings
        const settingsResponse = await adminAPI.getSystemSettings({ force });
        if (settingsResponse.success && settingsResponse.settings?.customSubjects) {
          setCustomSubjects(settingsResponse.settings.customSubjects || []);
        }
      }
    } catch (error) {
      console.error('Error loading subject availability:', error);
    }
  };

  const handleAddCustomSubject = async () => {
    if (!newSubjectName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a subject name',
      });
      return;
    }

    // Check if subject already exists
    const allDefaultSubjects = [10, 11, 12].flatMap(grade => getSubjectsForGrade(grade.toString()));
    if (allDefaultSubjects.includes(newSubjectName.trim()) || customSubjects.includes(newSubjectName.trim())) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'This subject already exists',
      });
      return;
    }

    setAddingSubject(true);
    try {
      // Add to custom subjects list
      const updatedCustomSubjects = [...customSubjects, newSubjectName.trim()];
      setCustomSubjects(updatedCustomSubjects);

      // Save custom subjects to system settings
      const settingsResponse = await adminAPI.updateSystemSettings('customSubjects', {
        customSubjects: updatedCustomSubjects,
      });

      if (settingsResponse.success) {
        toast({
          title: 'Success',
          description: `Subject "${newSubjectName.trim()}" added globally to all grades`,
        });
        setNewSubjectName('');
        setAddSubjectDialogOpen(false);
        
        // Automatically add the new subject to all grades
        const newAvailability = { ...subjectAvailability };
        [10, 11, 12].forEach(grade => {
          const gradeKey = grade.toString();
          if (!newAvailability[gradeKey]) {
            newAvailability[gradeKey] = [];
          }
          if (!newAvailability[gradeKey].includes(newSubjectName.trim())) {
            newAvailability[gradeKey] = [...newAvailability[gradeKey], newSubjectName.trim()];
          }
        });
        setSubjectAvailability(newAvailability);
        loadSubjectAvailability(true);
      } else {
        throw new Error(settingsResponse.error || 'Failed to save custom subject');
      }
    } catch (error: any) {
      console.error('Error adding custom subject:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to add custom subject',
      });
      // Revert custom subjects on error
      setCustomSubjects(customSubjects);
    } finally {
      setAddingSubject(false);
    }
  };

  const loadStorageStats = async (force = false) => {
    setLoadingStorage(true);
    try {
      const response = await adminAPI.getStorageStats({ force });
      if (response.success) {
        setStorageStats(response.storage);
      }
    } catch (error) {
      console.error('Error loading storage stats:', error);
    } finally {
      setLoadingStorage(false);
    }
  };

  const loadPOPIARequests = async (force = false) => {
    setLoadingPOPIA(true);
    try {
      const response = await adminAPI.getPOPIARequests({ force });
      if (response.success) {
        setPopiaRequests(response.requests || []);
      }
    } catch (error) {
      console.error('Error loading POPIA requests:', error);
    } finally {
      setLoadingPOPIA(false);
    }
  };

  const loadAPIKeys = async (force = false) => {
    setLoadingAPIKeys(true);
    try {
      const response = await adminAPI.getAPIKeys({ force });
      if (response.success) {
        setApiKeys(response.apiKeys || []);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoadingAPIKeys(false);
    }
  };


  const loadUserActivity = async () => {
    if (!activityEmail) return;
    setLoadingActivity(true);
    try {
      const response = await adminAPI.getUserActivity(undefined, activityEmail);
      if (response.success) {
        setUserActivity(response);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load user activity.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load user activity.",
        variant: "destructive",
      });
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleSave = async (section: string, data?: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (section) {
        case 'Maintenance Mode':
          response = await adminAPI.updateSystemSettings('maintenance', {
            maintenanceMode,
            maintenanceMessage,
            maintenanceDuration,
          });
          break;
        case 'AI Configuration':
          response = await adminAPI.updateSystemSettings('aiConfig', {
            responseLimit,
            safetyFilters,
            difficultyLevel,
          });
          break;
        case 'Features':
          response = await adminAPI.updateSystemSettings('features', features);
          break;
        case 'Retention Policies':
          response = await adminAPI.updateSystemSettings('retentionPolicies', data);
          break;
        case 'Subject Availability':
          response = await adminAPI.updateSubjectAvailability(subjectAvailability);
          break;
        default:
          toast({
            title: "Error",
            description: `Unknown section: ${section}`,
            variant: "destructive",
          });
          return;
      }

      if (response?.success) {
        if (section === 'Subject Availability') {
          loadSubjectAvailability(true);
        } else {
          loadSystemSettings(true);
        }
        toast({
          title: "Settings Saved",
          description: `${section} settings have been saved successfully.`,
        });
      } else {
        throw new Error(response?.error || 'Failed to save settings');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to save ${section} settings.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get current active child section
  const getCurrentChildSection = () => {
    return activeChildSection[activeTab || 'content'] || 'weekly-tasks';
  };

  // Helper to set active child section
  const setCurrentChildSection = (section: string) => {
    setActiveChildSection({
      ...activeChildSection,
      [activeTab || 'content']: section,
    });
  };

  // Child sections configuration
  const childSections: Record<string, Array<{ id: string; label: string; icon: any }>> = {
    content: [
      { id: 'weekly-tasks', label: 'ATP-Aligned Weekly Tasks', icon: Calendar },
      { id: 'subject-availability', label: 'Subject Availability per Grade', icon: School },
      { id: 'ai-config', label: 'AI Configuration', icon: Bot },
      { id: 'feature-management', label: 'Feature Management', icon: ToggleLeft },
    ],
    users: [
      { id: 'user-accounts', label: 'User Account Management', icon: Users },
      { id: 'device-activity', label: 'Device & Activity Information', icon: Monitor },
    ],
    system: [
      { id: 'announcements', label: 'App-Wide Announcements', icon: Bell },
      { id: 'maintenance', label: 'Maintenance Mode', icon: Wrench },
    ],
    compliance: [
      { id: 'audit-logs', label: 'Audit Logs', icon: FileDown },
      { id: 'storage-usage', label: 'Data Storage Usage', icon: HardDrive },
      { id: 'retention-policies', label: 'Retention Policies', icon: Clock },
      { id: 'privacy-policy', label: 'Privacy Policy & Consent', icon: FileCheck },
      { id: 'popia-requests', label: 'POPIA Data Erasure Requests', icon: Trash2 },
    ],
    integrations: [
      { id: 'email-sms', label: 'Email & SMS Configuration', icon: Mail },
      { id: 'api-keys', label: 'API Keys Management', icon: KeyRound },
    ],
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3 font-headline text-3xl font-bold">
          <Settings className="h-8 w-8 text-primary" />
          Content Control
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage all content, users, system settings, and integrations
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs 
        value={activeTab || 'content'} 
        onValueChange={(value) => {
          setActiveTab(value);
          // Initialize child section if not set for this tab
          if (!activeChildSection[value]) {
            const defaultSections: Record<string, string> = {
              content: 'weekly-tasks',
              users: 'user-accounts',
              system: 'announcements',
              compliance: 'audit-logs',
              integrations: 'email-sms',
            };
            setActiveChildSection({
              ...activeChildSection,
              [value]: defaultSections[value] || 'weekly-tasks',
            });
          }
        }} 
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="content" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Content
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Users
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            System
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Compliance
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Content Control Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Child Section Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {childSections.content.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={getCurrentChildSection() === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentChildSection(section.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>

          <div className="grid gap-6">
            {/* ATP-Aligned Weekly Tasks */}
            {getCurrentChildSection() === 'weekly-tasks' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  ATP-Aligned Weekly Tasks
                </CardTitle>
                <CardDescription>
                  Push ATP (Annual Teaching Plan) aligned weekly tasks to students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Weekly Tasks Schedule</Label>
                    <p className="text-sm text-muted-foreground">
                      Manage and push weekly tasks aligned with CAPS ATP
                    </p>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-push weekly tasks</Label>
                    <Switch />
                  </div>
                  <div>
                    <Label>Default Push Day</Label>
                    <Select defaultValue="monday">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Subject Availability */}
            {getCurrentChildSection() === 'subject-availability' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Subject Availability per Grade
                </CardTitle>
                <CardDescription>
                  Control which subjects are available for each grade level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[10, 11, 12].map((grade) => {
                    const gradeKey = grade.toString();
                    const defaultSubjects = getSubjectsForGrade(gradeKey);
                    // Merge default subjects with custom subjects
                    const allSubjects = [...defaultSubjects, ...customSubjects];
                    const availableSubjects = subjectAvailability[gradeKey] || [];
                    
                    return (
                      <div key={grade} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>Grade {grade}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setAddSubjectDialogOpen(true)}
                            title="Add custom subject globally"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {allSubjects.map((subject) => {
                            const isAvailable = availableSubjects.includes(subject);
                            const isCustom = customSubjects.includes(subject);
                            return (
                              <Badge 
                                key={subject} 
                                variant={isAvailable ? "default" : "outline"} 
                                className={`cursor-pointer hover:bg-primary hover:text-primary-foreground ${isCustom ? 'border-2 border-dashed' : ''}`}
                                title={isCustom ? 'Custom subject (added globally)' : ''}
                                onClick={() => {
                                  const newAvailability = { ...subjectAvailability };
                                  if (!newAvailability[gradeKey]) {
                                    newAvailability[gradeKey] = [];
                                  }
                                  if (isAvailable) {
                                    newAvailability[gradeKey] = newAvailability[gradeKey].filter((s: string) => s !== subject);
                                  } else {
                                    newAvailability[gradeKey] = [...newAvailability[gradeKey], subject];
                                  }
                                  setSubjectAvailability(newAvailability);
                                }}
                              >
                                {subject}
                                {isCustom && <span className="ml-1 text-xs">★</span>}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Add Custom Subject Dialog */}
                <Dialog open={addSubjectDialogOpen} onOpenChange={setAddSubjectDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom Subject</DialogTitle>
                      <DialogDescription>
                        Add a new subject that will be available globally for all grades (10, 11, and 12). 
                        The subject will be automatically enabled for all grades.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="subjectName">Subject Name</Label>
                        <Input
                          id="subjectName"
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          placeholder="e.g., Agricultural Sciences"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !addingSubject) {
                              handleAddCustomSubject();
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAddSubjectDialogOpen(false);
                            setNewSubjectName('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddCustomSubject} disabled={addingSubject || !newSubjectName.trim()}>
                          {addingSubject ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Subject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={() => handleSave('Subject Availability')} disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
            )}

            {/* AI Configuration */}
            {getCurrentChildSection() === 'ai-config' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI behavior, limits, and safety settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Response Limits</Label>
                      <p className="text-sm text-muted-foreground">
                        Maximum number of AI responses per user per day
                      </p>
                    </div>
                    <Input
                      type="number"
                      value={responseLimit}
                      onChange={(e) => setResponseLimit(parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Safety Filters</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable content filtering for inappropriate responses
                      </p>
                    </div>
                    <Switch
                      checked={safetyFilters}
                      onCheckedChange={setSafetyFilters}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Difficulty Level for Generated Questions</Label>
                    <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Default difficulty for AI-generated practice questions
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleSave('AI Configuration')} disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save AI Settings
                </Button>
              </CardContent>
            </Card>
            )}

            {/* Feature Toggles */}
            {getCurrentChildSection() === 'feature-management' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ToggleLeft className="h-5 w-5" />
                  Feature Management
                </CardTitle>
                <CardDescription>
                  Enable or disable features across the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { key: 'aiTutor', name: 'AI Tutor', description: 'Enable AI tutoring features' },
                    { key: 'pastPapers', name: 'Past Papers', description: 'Enable past paper access' },
                    { key: 'practiceQuestions', name: 'Practice Questions', description: 'Enable practice question bank' },
                    { key: 'weeklyTasks', name: 'Weekly Tasks', description: 'Enable ATP-aligned weekly tasks' },
                    { key: 'achievements', name: 'Achievements', description: 'Enable achievement system' },
                    { key: 'progressTracking', name: 'Progress Tracking', description: 'Enable progress tracking' },
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>{feature.name}</Label>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Switch 
                        checked={features[feature.key as keyof typeof features]} 
                        onCheckedChange={(checked) => {
                          setFeatures({ ...features, [feature.key]: checked });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={() => handleSave('Features')} disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Feature Settings
                </Button>
              </CardContent>
            </Card>
            )}
          </div>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Child Section Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {childSections.users.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={getCurrentChildSection() === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentChildSection(section.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>

          <div className="grid gap-6">
            {/* User Accounts Management */}
            {getCurrentChildSection() === 'user-accounts' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Account Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts, restrictions, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Input 
                    placeholder="Search users by email or name..." 
                    className="max-w-sm" 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadUsers(true);
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      if (!user) return;
                      try {
                        const response = await adminAPI.exportUsers(user.$id, 'csv');
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `users-export-${new Date().toISOString()}.csv`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        toast({
                          title: "Success",
                          description: "Users exported successfully.",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to export users.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Users
                  </Button>
                </div>
                <Separator />
                {loadingUsers ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((userItem: any) => (
                          <TableRow key={userItem.id}>
                            <TableCell>{userItem.email}</TableCell>
                            <TableCell>{userItem.name}</TableCell>
                            <TableCell>{userItem.grade || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={userItem.status === 'active' ? 'default' : 'secondary'}>
                                {userItem.status || 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>{userItem.lastActive ? new Date(userItem.lastActive).toLocaleString() : 'Never'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      setLoadingActivity(true);
                                      try {
                                        const response = await adminAPI.getUserActivity(undefined, userItem.email);
                                        if (response.success) {
                                          setUserActivity(response);
                                        }
                                      } catch (error) {
                                        console.error('Error loading user activity:', error);
                                      } finally {
                                        setLoadingActivity(false);
                                      }
                                    }}
                                  >
                                    <Monitor className="mr-2 h-4 w-4" />
                                    View activity
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Role Management</DropdownMenuLabel>
                                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                    Current: <Badge variant="secondary" className="ml-1 text-xs">
                                      {userRoles[userItem.id] || userRoles[userItem.email] || 'user'}
                                    </Badge>
                                  </div>
                                  <DropdownMenuRadioGroup
                                    value={userRoles[userItem.id] || userRoles[userItem.email] || 'user'}
                                    onValueChange={async (newRole) => {
                                      if (!user) return;
                                      setChangingRole(userItem.id);
                                      try {
                                        const response = await adminAPI.updateAccessRole({
                                          userId: userItem.id,
                                          email: userItem.email,
                                          role: newRole,
                                          adminId: user.$id,
                                        });
                                        if (response.success) {
                                          toast({
                                            title: "Success",
                                            description: `User role updated to ${newRole}.`,
                                          });
                                          // Update local state
                                          setUserRoles({
                                            ...userRoles,
                                            [userItem.id]: newRole,
                                            [userItem.email]: newRole,
                                          });
                                          loadUsers(true);
                                        } else {
                                          throw new Error(response.error || 'Failed to update role');
                                        }
                                      } catch (error: any) {
                                        toast({
                                          title: "Error",
                                          description: error.message || "Failed to update user role.",
                                          variant: "destructive",
                                        });
                                      } finally {
                                        setChangingRole(null);
                                      }
                                    }}
                                  >
                                    <DropdownMenuRadioItem value="user" disabled={changingRole === userItem.id}>
                                      User
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="admin" disabled={changingRole === userItem.id}>
                                      Admin
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="analyst" disabled={changingRole === userItem.id}>
                                      Analyst
                                    </DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="content-editor" disabled={changingRole === userItem.id}>
                                      Content Editor
                                    </DropdownMenuRadioItem>
                                  </DropdownMenuRadioGroup>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Account Access</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => openRestrictionForUser(userItem)}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Restrict / Ban
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setResetEmail(userItem.email);
                                      setPasswordResetDialogOpen(true);
                                    }}
                                  >
                                    <Key className="mr-2 h-4 w-4" />
                                    Reset password
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            )}

            {/* Dialogs - Always accessible regardless of active child section */}
            <Dialog open={restrictionDialogOpen} onOpenChange={(open) => (open ? setRestrictionDialogOpen(true) : closeRestrictionDialog())}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage account access</DialogTitle>
                  <DialogDescription>
                    Ban, temporarily restrict, or limit a learner directly from the user manager.
                  </DialogDescription>
                </DialogHeader>
                {selectedRestrictionUser ? (
                  <div className="space-y-4">
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">{selectedRestrictionUser.name || 'Unnamed user'}</p>
                      <p className="text-muted-foreground">{selectedRestrictionUser.email}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Current status: {selectedRestrictionUser.status || 'active'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Restriction Type</Label>
                      <Select value={restrictionType} onValueChange={setRestrictionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select restriction type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ban">Permanent Ban</SelectItem>
                          <SelectItem value="temporary">Temporary Restriction</SelectItem>
                          <SelectItem value="limited">Limited Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Textarea
                        placeholder="Explain why access is being limited..."
                        value={restrictionReason}
                        onChange={(e) => setRestrictionReason(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={closeRestrictionDialog} disabled={loading}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleApplyRestriction}
                        disabled={loading || !restrictionReason.trim()}
                      >
                        {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <UserX className="mr-2 h-4 w-4" />}
                        Apply Restriction
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a user to manage access.</p>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset learner password</DialogTitle>
                  <DialogDescription>
                    Send a manual password update for the selected account.
                  </DialogDescription>
                </DialogHeader>
                {renderPasswordResetForm()}
              </DialogContent>
            </Dialog>

            {getCurrentChildSection() === 'device-activity' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device & Activity Information
                </CardTitle>
                <CardDescription>
                  View user activity, device information, and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>User Email</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="user@example.com" 
                      value={activityEmail}
                      onChange={(e) => setActivityEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && activityEmail) {
                          loadUserActivity();
                        }
                      }}
                    />
                    <Button onClick={loadUserActivity} disabled={!activityEmail || loadingActivity}>
                      {loadingActivity ? <Loader className="h-4 w-4 animate-spin" /> : <Monitor className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Separator />
                {userActivity ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm font-medium">{userActivity.user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label>Grade</Label>
                        <p className="text-sm font-medium">{userActivity.user?.grade || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Device Type</Label>
                        <p className="text-sm font-medium">{userActivity.user?.deviceType || userActivity.user?.deviceInfo || 'Unknown'}</p>
                      </div>
                      <div>
                        <Label>Last Active</Label>
                        <p className="text-sm font-medium">
                          {userActivity.user?.lastLogin 
                            ? new Date(userActivity.user.lastLogin).toLocaleString() 
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-base font-semibold">Activity Statistics</Label>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Total Study Time</p>
                          <p className="text-lg font-semibold">
                            {userActivity.stats?.totalStudyTimeHours || 0} hours
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            ({userActivity.stats?.totalStudyTimeMinutes || 0} minutes)
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Questions Answered</p>
                          <p className="text-lg font-semibold">{userActivity.stats?.questionsAnswered || 0}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Lessons Completed</p>
                          <p className="text-lg font-semibold">{userActivity.stats?.completedLessons || 0}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Past Papers Attempted</p>
                          <p className="text-lg font-semibold">{userActivity.stats?.pastPapersAttempted || 0}</p>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Average Score</p>
                          <p className="text-lg font-semibold">
                            {userActivity.stats?.averageScore 
                              ? `${Math.round(userActivity.stats.averageScore)}%` 
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
                          <p className="text-lg font-semibold">{userActivity.stats?.totalSessions || 0}</p>
                        </div>
                      </div>
                    </div>
                    {userActivity.activityLogs && userActivity.activityLogs.length > 0 && (
                      <div>
                        <Label className="text-base font-semibold">Recent Activity ({userActivity.activityLogs.length} logs)</Label>
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto border rounded-lg p-3 bg-muted/20">
                          {userActivity.activityLogs.slice(0, 10).map((log: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0">
                              <span className="text-muted-foreground">
                                {new Date(log.timestamp || log.$createdAt || log.createdAt).toLocaleString()}
                              </span>
                              <span className="font-medium">{log.action || log.type || 'Activity'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : activityEmail ? (
                  <p className="text-sm text-muted-foreground">Enter an email and click search to view activity</p>
                ) : null}
              </CardContent>
            </Card>
            )}
          </div>
        </TabsContent>


        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          {/* Child Section Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {childSections.system.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={getCurrentChildSection() === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentChildSection(section.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>

          <div className="grid gap-6">
            {/* Announcements */}
            {getCurrentChildSection() === 'announcements' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  App-Wide Announcements
                </CardTitle>
                <CardDescription>
                  Manage announcements and app-wide notices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Announcement Title</Label>
                    <Input 
                      placeholder="Enter announcement title" 
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea 
                      placeholder="Enter announcement message" 
                      rows={4} 
                      value={announcementMessage}
                      onChange={(e) => setAnnouncementMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch 
                      checked={announcementActive}
                      onCheckedChange={setAnnouncementActive}
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={announcementPriority} onValueChange={setAnnouncementPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <Select value={announcementTargetAudience} onValueChange={(value: 'students' | 'admins' | 'both') => setAnnouncementTargetAudience(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both Students and Admins</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Schedule for Later</Label>
                      <p className="text-sm text-muted-foreground">
                        Set start and end times for this announcement
                      </p>
                    </div>
                    <Switch 
                      checked={announcementUseScheduling}
                      onCheckedChange={setAnnouncementUseScheduling}
                    />
                  </div>
                  {announcementUseScheduling && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <div>
                        <Label>Start Date & Time</Label>
                        <Input 
                          type="datetime-local" 
                          value={announcementScheduledStart}
                          onChange={(e) => setAnnouncementScheduledStart(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to start immediately
                        </p>
                      </div>
                      <div>
                        <Label>End Date & Time</Label>
                        <Input 
                          type="datetime-local" 
                          value={announcementScheduledEnd}
                          onChange={(e) => setAnnouncementScheduledEnd(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty for no end date
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={async () => {
                      if (!user || !announcementTitle || !announcementMessage) {
                        toast({
                          title: "Error",
                          description: "Please fill in title and message.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setLoading(true);
                      try {
                        // Only include optional fields if they're actually set
                        const announcementData: any = {
                          title: announcementTitle,
                          message: announcementMessage,
                          priority: announcementPriority,
                          active: announcementActive,
                          userId: user.$id,
                        };

                        // Only add targetAudience if it's not 'both' (to avoid issues if attribute doesn't exist)
                        // Users can add the attribute later if needed
                        if (announcementTargetAudience && announcementTargetAudience !== 'both') {
                          announcementData.targetAudience = announcementTargetAudience;
                        }

                        // Only add scheduling if explicitly enabled and dates are provided
                        if (announcementUseScheduling) {
                          if (announcementScheduledStart) {
                            announcementData.scheduledStart = new Date(announcementScheduledStart).toISOString();
                          }
                          if (announcementScheduledEnd) {
                            announcementData.scheduledEnd = new Date(announcementScheduledEnd).toISOString();
                          }
                        }

                        const response = await adminAPI.createAnnouncement(announcementData);
                        console.log('Announcement creation response:', response);
                        
                        if (response && response.success) {
                          toast({
                            title: "Success",
                            description: "Announcement created successfully.",
                          });
                          setAnnouncementTitle('');
                          setAnnouncementMessage('');
                          setAnnouncementPriority('medium');
                          setAnnouncementActive(true);
                          setAnnouncementTargetAudience('both');
                          setAnnouncementScheduledStart('');
                          setAnnouncementScheduledEnd('');
                          setAnnouncementUseScheduling(false);
                          // Reload announcements to show the new one
                          await loadAnnouncements(true);
                        } else {
                          const errorMessage = response?.error || response?.message || 'Failed to create announcement';
                          console.error('Announcement creation failed:', response);
                          throw new Error(errorMessage);
                        }
                      } catch (error: any) {
                        console.error('Error creating announcement:', error);
                        toast({
                          title: "Error",
                          description: error.message || "Failed to create announcement.",
                          variant: "destructive",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Announcement
                  </Button>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Existing Announcements</Label>
                      {announcements.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedAnnouncements.size === announcements.length && announcements.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                            <Label className="text-sm font-normal cursor-pointer" onClick={toggleSelectAll}>
                              Select All
                            </Label>
                          </div>
                          {selectedAnnouncements.size > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleBulkDelete}
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete Selected ({selectedAnnouncements.size})
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {loadingAnnouncements ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {announcements.length === 0 ? (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            No announcements yet. Create one above to get started.
                          </div>
                        ) : (
                          announcements.map((announcement: any) => {
                          const now = new Date();
                          const scheduledStart = announcement.scheduledStart ? new Date(announcement.scheduledStart) : null;
                          const scheduledEnd = announcement.scheduledEnd ? new Date(announcement.scheduledEnd) : null;
                          const isScheduled = scheduledStart || scheduledEnd;
                          const isPending = scheduledStart && now < scheduledStart;
                          const isExpired = scheduledEnd && now > scheduledEnd;
                          const isSelected = selectedAnnouncements.has(announcement.$id);
                          
                          return (
                          <div key={announcement.$id} className={`flex items-start gap-3 p-3 border rounded-lg ${isSelected ? 'bg-muted/50' : ''}`}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleAnnouncementSelection(announcement.$id)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{announcement.title}</p>
                                <Badge variant={announcement.priority === 'critical' ? 'destructive' : announcement.priority === 'high' ? 'default' : 'secondary'}>
                                  {announcement.priority}
                                </Badge>
                                <Badge variant={announcement.targetAudience === 'students' ? 'default' : announcement.targetAudience === 'admins' ? 'secondary' : 'outline'}>
                                  {announcement.targetAudience || 'both'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{announcement.message.substring(0, 80)}...</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <Badge variant={announcement.active && !isPending && !isExpired ? 'default' : 'secondary'}>
                                  {isPending ? 'Scheduled' : isExpired ? 'Expired' : announcement.active ? 'Active' : 'Inactive'}
                                </Badge>
                                {isScheduled && (
                                  <>
                                    {scheduledStart && (
                                      <span>Starts: {scheduledStart.toLocaleString()}</span>
                                    )}
                                    {scheduledEnd && (
                                      <span>Ends: {scheduledEnd.toLocaleString()}</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (confirm('Are you sure you want to delete this announcement?')) {
                                    try {
                                      const response = await adminAPI.deleteAnnouncement(announcement.$id);
                                      if (response.success) {
                                        toast({
                                          title: "Success",
                                          description: "Announcement deleted successfully.",
                                        });
                                        loadAnnouncements(true);
                                      }
                                    } catch (error: any) {
                                      toast({
                                        title: "Error",
                                        description: error.message || "Failed to delete announcement.",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                          </div>
                          );
                        }))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Maintenance Mode */}
            {getCurrentChildSection() === 'maintenance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Mode
                </CardTitle>
                <CardDescription>
                  Toggle maintenance mode to restrict access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable to put the application in maintenance mode
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                {maintenanceMode && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label>Maintenance Message</Label>
                      <Textarea
                        placeholder="Enter message to show during maintenance"
                        rows={3}
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Expected Duration</Label>
                      <Input 
                        type="text" 
                        placeholder="e.g., 2 hours" 
                        value={maintenanceDuration}
                        onChange={(e) => setMaintenanceDuration(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <Button onClick={() => handleSave('Maintenance Mode')} disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Settings
                </Button>
              </CardContent>
            </Card>
            )}
          </div>
        </TabsContent>

        {/* Data & Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          {/* Child Section Navigation */}
          <div className="flex flex-wrap gap-2 border-b pb-4">
            {childSections.compliance.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={getCurrentChildSection() === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentChildSection(section.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>

          <div className="grid gap-6">
            {/* Audit Logs */}
            {getCurrentChildSection() === 'audit-logs' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Audit Logs
                </CardTitle>
                <CardDescription>
                  Download and view system audit logs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Date Range</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="date" 
                        value={auditLogStartDate}
                        onChange={(e) => setAuditLogStartDate(e.target.value)}
                      />
                      <Input 
                        type="date" 
                        value={auditLogEndDate}
                        onChange={(e) => setAuditLogEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Log Type</Label>
                    <Select value={auditLogType} onValueChange={setAuditLogType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select log type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Logs</SelectItem>
                        <SelectItem value="user">User Actions</SelectItem>
                        <SelectItem value="admin">Admin Actions</SelectItem>
                        <SelectItem value="system">System Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={async () => {
                      setDownloadingLogs(true);
                      try {
                        const params = new URLSearchParams();
                        if (auditLogStartDate) params.append('startDate', auditLogStartDate);
                        if (auditLogEndDate) params.append('endDate', auditLogEndDate);
                        if (auditLogType) params.append('logType', auditLogType);
                        params.append('format', 'csv');
                        
                        const response = await fetch(`/api/admin/compliance/audit-logs?${params.toString()}`);
                        if (!response.ok) {
                          throw new Error('Failed to download logs');
                        }
                        
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `audit-logs-${auditLogStartDate || 'all'}-${auditLogEndDate || 'all'}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        
                        toast({
                          title: "Success",
                          description: "Audit logs downloaded successfully.",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to download audit logs.",
                          variant: "destructive",
                        });
                      } finally {
                        setDownloadingLogs(false);
                      }
                    }}
                    disabled={downloadingLogs}
                  >
                    {downloadingLogs ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Data Storage Usage */}
            {getCurrentChildSection() === 'storage-usage' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Data Storage Usage
                </CardTitle>
                <CardDescription>
                  Monitor data storage usage and capacity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {loadingStorage ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader className="h-6 w-6 animate-spin" />
                    </div>
                  ) : storageStats ? (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Total Storage</Label>
                          <p className="text-2xl font-bold">{storageStats.total || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Used</Label>
                          <p className="text-2xl font-bold">{storageStats.used || 'N/A'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Available</Label>
                          <p className="text-2xl font-bold">{storageStats.available || 'N/A'}</p>
                        </div>
                      </div>
                      {storageStats.percentage > 0 && (
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${storageStats.percentage}%` }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">Storage stats not available</p>
                  )}
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Detailed Usage
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Retention Policies */}
            {getCurrentChildSection() === 'retention-policies' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Retention Policies
                </CardTitle>
                <CardDescription>
                  Manage data retention policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>User Data Retention</Label>
                    <Select value={userDataRetention} onValueChange={setUserDataRetention}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="3years">3 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="7years">7 Years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Activity Logs Retention</Label>
                    <Select value={activityLogsRetention} onValueChange={setActivityLogsRetention}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => handleSave('Retention Policies', {
                      userData: userDataRetention,
                      activityLogs: activityLogsRetention,
                    })} 
                    disabled={loading}
                  >
                    {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Policies
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Privacy Policy & Consent */}
            {getCurrentChildSection() === 'privacy-policy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Privacy Policy & Consent Text
                </CardTitle>
                <CardDescription>
                  Manage consent text and privacy policy versions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Privacy Policy Version</Label>
                    <Input placeholder="e.g., 2.1.0" />
                  </div>
                  <div>
                    <Label>Privacy Policy Content</Label>
                    <Textarea placeholder="Enter privacy policy text" rows={8} />
                  </div>
                  <div>
                    <Label>Consent Text</Label>
                    <Textarea placeholder="Enter consent text" rows={4} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require New Consent</Label>
                    <Switch />
                  </div>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}

            {/* POPIA Data Erasure Requests */}
            {getCurrentChildSection() === 'popia-requests' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  POPIA Data Erasure Requests
                </CardTitle>
                <CardDescription>
                  Manage and process data erasure requests under POPIA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingPOPIA ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {popiaRequests.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No POPIA data erasure requests found.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request Date</TableHead>
                            <TableHead>User Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Processed By</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {popiaRequests.map((request: any) => (
                            <TableRow key={request.$id}>
                              <TableCell>
                                {request.$createdAt 
                                  ? new Date(request.$createdAt).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>{request.email || request.userId || 'N/A'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    request.status === 'completed' 
                                      ? 'default' 
                                      : request.status === 'rejected'
                                      ? 'destructive'
                                      : 'secondary'
                                  }
                                >
                                  {request.status || 'pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {request.processedBy || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {request.status !== 'completed' && request.status !== 'rejected' ? (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={async () => {
                                        if (!user) return;
                                        if (!confirm('Are you sure you want to approve this data erasure request? This action cannot be undone.')) {
                                          return;
                                        }
                                        setLoadingPOPIA(true);
                                        try {
                                          const response = await adminAPI.processPOPIARequest(
                                            request.$id,
                                            'approve',
                                            user.$id
                                          );
                                          if (response.success) {
                                            toast({
                                              title: "Success",
                                              description: "Data erasure request approved and processed.",
                                            });
                                            loadPOPIARequests(true);
                                          } else {
                                            throw new Error(response.error || 'Failed to process request');
                                          }
                                        } catch (error: any) {
                                          toast({
                                            title: "Error",
                                            description: error.message || "Failed to process request.",
                                            variant: "destructive",
                                          });
                                        } finally {
                                          setLoadingPOPIA(false);
                                        }
                                      }}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        if (!user) return;
                                        const reason = prompt('Please provide a reason for rejection:');
                                        if (!reason) return;
                                        setLoadingPOPIA(true);
                                        try {
                                          const response = await adminAPI.processPOPIARequest(
                                            request.$id,
                                            'reject',
                                            user.$id,
                                            reason
                                          );
                                          if (response.success) {
                                            toast({
                                              title: "Success",
                                              description: "Data erasure request rejected.",
                                            });
                                            loadPOPIARequests(true);
                                          } else {
                                            throw new Error(response.error || 'Failed to process request');
                                          }
                                        } catch (error: any) {
                                          toast({
                                            title: "Error",
                                            description: error.message || "Failed to process request.",
                                            variant: "destructive",
                                          });
                                        } finally {
                                          setLoadingPOPIA(false);
                                        }
                                      }}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    {request.status === 'completed' ? 'Completed' : 'Rejected'}
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => loadPOPIARequests(true)}
                      disabled={loadingPOPIA}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingPOPIA ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            {/* Email/SMS Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email & SMS Configuration
                </CardTitle>
                <CardDescription>
                  Configure email and SMS systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Email Service Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="ses">AWS SES</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                        <SelectItem value="custom">Custom SMTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>SMTP Server</Label>
                    <Input placeholder="smtp.example.com" />
                  </div>
                  <div>
                    <Label>SMTP Port</Label>
                    <Input type="number" placeholder="587" />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input type="email" placeholder="noreply@capstutor.co.za" />
                  </div>
                  <Separator />
                  <div>
                    <Label>SMS Service Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="africastalking">Africa's Talking</SelectItem>
                        <SelectItem value="clickatell">Clickatell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>SMS API Key</Label>
                    <Input type="password" placeholder="Enter API key" />
                  </div>
                  <Button onClick={() => handleSave('Email/SMS')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            {getCurrentChildSection() === 'api-keys' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  API Keys Management
                </CardTitle>
                <CardDescription>
                  Set up and manage API keys for integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Service Name</Label>
                    <Input 
                      placeholder="e.g., OpenAI, Groq" 
                      value={newAPIKey.serviceName}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, serviceName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>API Key</Label>
                    <Input 
                      type="password" 
                      placeholder="Enter API key" 
                      value={newAPIKey.apiKey}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, apiKey: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      placeholder="Enter description" 
                      rows={2} 
                      value={newAPIKey.description}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch 
                      checked={newAPIKey.active}
                      onCheckedChange={(checked) => setNewAPIKey({ ...newAPIKey, active: checked })}
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!user || !newAPIKey.serviceName || !newAPIKey.apiKey) {
                        toast({
                          title: "Error",
                          description: "Please fill in service name and API key.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setLoading(true);
                      try {
                        const response = await adminAPI.createAPIKey({
                          ...newAPIKey,
                          userId: user.$id,
                        });
                        if (response.success) {
                          toast({
                            title: "Success",
                            description: "API key saved successfully.",
                          });
                          setNewAPIKey({ serviceName: '', apiKey: '', description: '', active: true });
                          loadAPIKeys(true);
                        } else {
                          throw new Error(response.error || 'Failed to save API key');
                        }
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description: error.message || "Failed to save API key.",
                          variant: "destructive",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save API Key
                  </Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Existing API Keys</Label>
                  {loadingAPIKeys ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No API keys found
                            </TableCell>
                          </TableRow>
                        ) : (
                          apiKeys.map((key: any) => (
                            <TableRow key={key.id}>
                              <TableCell>{key.serviceName}</TableCell>
                              <TableCell>
                                <Badge variant={key.active ? 'default' : 'secondary'}>
                                  {key.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this API key?')) {
                                      try {
                                        const response = await adminAPI.deleteAPIKey(key.id);
                                        if (response.success) {
                                          toast({
                                            title: "Success",
                                            description: "API key deleted successfully.",
                                          });
                                          loadAPIKeys(true);
                                        }
                                      } catch (error: any) {
                                        toast({
                                          title: "Error",
                                          description: error.message || "Failed to delete API key.",
                                          variant: "destructive",
                                        });
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

