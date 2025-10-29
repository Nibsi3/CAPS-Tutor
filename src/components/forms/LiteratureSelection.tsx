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
    (subject) => subjectToLiteratureMap[subject] && literatureOptions[gradeKey]?.[subjectToLiteratureMap[subject]]
  );

  if (subjectsWithLiterature.length === 0 || !selectedGrade) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Literature Selection</CardTitle>
        <CardDescription>
          Choose the prescribed books and poems you are studying for your selected language subjects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {subjectsWithLiterature.map((subject) => {
          const literatureKey = subjectToLiteratureMap[subject];
          const options = literatureOptions[gradeKey]?.[literatureKey];

          if (!options) return null;

          return (
            <div key={subject} className="space-y-6 rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-primary">{subject}</h3>
                {options.novels && options.novels.length > 0 && (
                    <FormField
                        control={control}
                        name={`literature.${literatureKey}.novel`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Novel</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your novel" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {options.novels.map(novel => (
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
                                <FormLabel>Drama</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your drama" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {options.dramas.map(drama => (
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
                                <FormLabel className="text-base">Poetry</FormLabel>
                                <FormDescription>
                                    Select the poems you are studying.
                                </FormDescription>
                            </div>
                             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {options.poems.map((poem) => (
                                    <FormField
                                    key={poem}
                                    control={control}
                                    name={`literature.${literatureKey}.poems`}
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={poem}
                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(poem)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), poem])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                        (value) => value !== poem
                                                        )
                                                    );
                                                }}
                                            />
                                            </FormControl>
                                            <FormLabel className="font-normal text-sm">
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