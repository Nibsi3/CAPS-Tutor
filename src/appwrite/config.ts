// Guard environment variables - never assume they exist during SSR/preview mode
// In preview mode, missing vars become `false` instead of strings
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  if (typeof process === 'undefined') return defaultValue;
  const value = (process as any).env?.[key];
  // If value is false or undefined, return default
  if (value === false || value === undefined || value === null) return defaultValue;
  // Ensure it's a string
  return String(value) || defaultValue;
};

export const appwriteConfig = {
  endpoint: getEnvVar("NEXT_PUBLIC_APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1"),
  projectId: getEnvVar("NEXT_PUBLIC_APPWRITE_PROJECT_ID", ""),
  databaseId: getEnvVar("NEXT_PUBLIC_APPWRITE_DATABASE_ID", ""),
};

// Validate configuration (only in browser/client)
if (typeof window !== 'undefined') {
  if (!appwriteConfig.projectId) {
    console.error(
      'NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. ' +
      'Please configure it in Appwrite Function environment variables.'
    );
  }
  if (!appwriteConfig.databaseId) {
    console.warn(
      'NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set. ' +
      'Some database features may not work.'
    );
  }
}

