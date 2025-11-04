'use client';

import { Control } from 'react-hook-form';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { literatureOptions } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';

export const literatureSchema = z.object({
  'english-hl': z.object({
    novel: z.string().optional(),
    drama: z.string().optional(),
    poems: z.array(z.string()).optional(),
  }).optional(),
  'english-fal': z.object({
    novel: z.string().optional(),
    drama: z.string().optional(),
    poems: z.array(z.string()).optional(),
  }).optional(),
  'afrikaans-ht': z.object({
    novel: z.string().optional(),
    drama: z.string().optional(),
    poems: z.array(z.string()).optional(),
  }).optional(),
  'afrikaans-eat': z.object({
    novel: z.string().optional(),
    drama: z.string().optional(),
    poems: z.array(z.string()).optional(),
  }).optional(),
});

interface LiteratureSelectionProps {
  control: Control<any>;
  selectedSubjects: string[];
  selectedGrade: string;
}

const subjectToLiteratureMap: Record<string, keyof z.infer<typeof literatureSchema>> = {
    "English Home Language": "english-hl",
    "English First Additional Language": "english-fal",
    "Afrikaans Huistaal": "afrikaans-ht",
    "Afrikaans Eerste Addisionele Taal": "afrikaans-eat",
};


export function LiteratureSelection({ control, selectedSubjects, selectedGrade }: LiteratureSelectionProps) {
  const gradeKey = `grade${selectedGrade}` as keyof typeof literatureOptions;
  
  const subjectsWithLiterature = selectedSubjects.filter(
    (subject) => {
      const litKey = subjectToLiteratureMap[subject];
      if (!litKey) return false;
      const gradeData = literatureOptions[gradeKey];
      if (!gradeData) return false;
      return litKey in gradeData;
    }
  );

  if (subjectsWithLiterature.length === 0 || !selectedGrade) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Literature Selection</CardTitle>
        <CardDescription className="text-sm">
          Choose the prescribed books and poems you are studying for your selected language subjects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subjectsWithLiterature.map((subject) => {
          const literatureKey = subjectToLiteratureMap[subject];
          if (!literatureKey) return null;
          const gradeData = literatureOptions[gradeKey];
          if (!gradeData) return null;
          const options = gradeData[literatureKey as keyof typeof gradeData];

          if (!options) return null;

          return (
            <div key={subject} className="space-y-4 rounded-lg border-2 border-primary/10 bg-primary/5 p-5">
              <h3 className="text-base font-semibold text-primary">{subject}</h3>
              
              {options.novels && options.novels.length > 0 && (
                <FormField
                  control={control}
                  name={`literature.${literatureKey}.novel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Novel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select your novel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.novels.map((novel: string) => (
                            <SelectItem key={novel} value={novel}>{novel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {options.dramas && options.dramas.length > 0 && (
                <FormField
                  control={control}
                  name={`literature.${literatureKey}.drama`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Drama</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select your drama" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {options.dramas.map((drama: string) => (
                            <SelectItem key={drama} value={drama}>{drama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {options.poems && options.poems.length > 0 && (
                <FormField
                  control={control}
                  name={`literature.${literatureKey}.poems`}
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-sm font-semibold">Poetry</FormLabel>
                        <FormDescription className="text-xs">
                          Select the poems you are studying.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {options.poems.map((poem: string) => (
                          <FormField
                            key={poem}
                            control={control}
                            name={`literature.${literatureKey}.poems`}
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={poem}
                                  className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:border-primary/50 hover:bg-white/50 transition-all duration-200"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(poem)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), poem])
                                          : field.onChange(
                                            field.value?.filter((value: string) => value !== poem)
                                          );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm cursor-pointer leading-tight">
                                    {poem}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}