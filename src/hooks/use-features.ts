import { useState, useEffect } from 'react';

interface Features {
  aiTutor: boolean;
  pastPapers: boolean;
  practiceQuestions: boolean;
  weeklyTasks: boolean;
  achievements: boolean;
  progressTracking: boolean;
}

const defaultFeatures: Features = {
  aiTutor: true,
  pastPapers: true,
  practiceQuestions: true,
  weeklyTasks: false,
  achievements: true,
  progressTracking: true,
};

export function useFeatures() {
  const [features, setFeatures] = useState<Features>(defaultFeatures);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch('/api/features');
        const data = await response.json();
        
        if (data.success && data.features) {
          setFeatures(data.features);
        } else {
          // Use defaults if fetch fails
          setFeatures(defaultFeatures);
        }
      } catch (error) {
        console.error('Error fetching features:', error);
        // Use defaults on error
        setFeatures(defaultFeatures);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  return { features, isLoading };
}

export function useFeature(featureName: keyof Features) {
  const { features, isLoading } = useFeatures();
  return { enabled: features[featureName] ?? defaultFeatures[featureName], isLoading };
}

