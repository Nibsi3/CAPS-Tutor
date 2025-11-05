export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
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

