// Guard environment variables - never assume they exist during SSR/preview mode
// In preview mode, missing vars become `false` instead of strings
// For Next.js, NEXT_PUBLIC_* vars are embedded at build time, so we access them directly
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  // Try multiple ways to access the env var (Next.js can expose it differently)
  let value: any = undefined;
  
  // Method 1: Standard process.env (works in Node.js and browser if embedded)
  // In Next.js, process.env is available in both server and client contexts
  if (typeof process !== 'undefined') {
    // Try direct access first
    value = (process as any).env?.[key];
    
    // If that doesn't work, try accessing via process.env directly (some Next.js setups)
    if ((value === undefined || value === null || value === '') && (process as any).env) {
      try {
        value = (process as any).env[key];
      } catch (e) {
        // Ignore errors
      }
    }
  }
  
  // Method 2: Check window.__ENV__ or window.process.env (some Next.js setups)
  if ((value === undefined || value === null || value === '') && typeof window !== 'undefined') {
    const windowEnv = (window as any).__ENV__ || (window as any).process?.env || (window as any).__NEXT_DATA__?.env;
    if (windowEnv && windowEnv[key]) {
      value = windowEnv[key];
    }
  }
  
  // If value is false, undefined, null, or empty string, return default
  if (value === false || value === undefined || value === null || value === '') {
    return defaultValue;
  }
  
  // Ensure it's a string and trim whitespace
  const stringValue = String(value).trim();
  return stringValue || defaultValue;
};

// Helper to get env var directly (for debugging) - reads at call time
const getEnvVarDirect = (key: string): string | undefined => {
  if (typeof process === 'undefined') return undefined;
  const value = (process as any).env?.[key];
  if (value === false || value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed || undefined;
};

// Helper to detect if we're running on Appwrite Cloud
const isAppwriteCloud = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname.includes('appwrite.network') || hostname.includes('appwrite.cloud');
};

// Create config object that reads values at access time (not initialization time)
// This ensures Next.js has embedded the variables before we try to read them
const createConfig = () => {
  // Use getters to read values at runtime, not at module initialization
  return {
    get endpoint() {
      // For Appwrite Cloud, default to fra.cloud.appwrite.io/v1
      // Users can override with environment variable
      const defaultEndpoint = isAppwriteCloud() 
        ? "https://fra.cloud.appwrite.io/v1"
        : "https://fra.cloud.appwrite.io/v1";
      return getEnvVar("NEXT_PUBLIC_APPWRITE_ENDPOINT", defaultEndpoint);
    },
    get projectId() {
      let value = getEnvVar("NEXT_PUBLIC_APPWRITE_PROJECT_ID", "");
      
      // Fallback: Try to read from window.__ENV__ or other sources
      if (!value && typeof window !== 'undefined') {
        const windowEnv = (window as any).__ENV__ || (window as any).process?.env || (window as any).__NEXT_DATA__?.env;
        if (windowEnv?.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
          value = String(windowEnv.NEXT_PUBLIC_APPWRITE_PROJECT_ID).trim();
        }
      }
      
      // Development fallback - use hardcoded value if env var not found
      // This ensures the app works even if Next.js hasn't embedded the vars yet
      if (!value) {
        const isDev = (typeof process !== 'undefined' && (process as any).env?.NODE_ENV === 'development') ||
                     (typeof window !== 'undefined' && window.location.hostname === 'localhost');
        if (isDev) {
          const fallbackValue = "690a39bf0011810ee554"; // Your actual project ID
          if (fallbackValue) {
            console.warn('⚠️ Using fallback Project ID - env vars not embedded. Please restart dev server.');
            value = fallbackValue;
          }
        }
      }
      
      return value;
    },
    get databaseId() {
      let value = getEnvVar("NEXT_PUBLIC_APPWRITE_DATABASE_ID", "");
      
      // Fallback: Try to read from window.__ENV__ or other sources
      if (!value && typeof window !== 'undefined') {
        const windowEnv = (window as any).__ENV__ || (window as any).process?.env || (window as any).__NEXT_DATA__?.env;
        if (windowEnv?.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
          value = String(windowEnv.NEXT_PUBLIC_APPWRITE_DATABASE_ID).trim();
        }
      }
      
      // Development fallback - use hardcoded value if env var not found
      // This ensures the app works even if Next.js hasn't embedded the vars yet
      if (!value) {
        const isDev = (typeof process !== 'undefined' && (process as any).env?.NODE_ENV === 'development') ||
                     (typeof window !== 'undefined' && window.location.hostname === 'localhost');
        if (isDev) {
          const fallbackValue = "capstutor"; // Your actual database ID
          if (fallbackValue) {
            console.warn('⚠️ Using fallback Database ID - env vars not embedded. Please restart dev server.');
            value = fallbackValue;
          }
        }
      }
      
      return value;
    },
  };
};

export const appwriteConfig = createConfig();

// Debug: Log environment variables to verify they're being read (only once, not in production)
// This runs on both server and client to help debug env var issues
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only log once using a flag
  if (!(globalThis as any).__appwriteConfigLogged) {
    // Read direct from process.env at call time
    const rawProjectId = (process as any).env?.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const rawDatabaseId = (process as any).env?.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const rawEndpoint = (process as any).env?.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    
    // Get from config (which uses getEnvVar)
    const configProjectId = appwriteConfig.projectId;
    const configDatabaseId = appwriteConfig.databaseId;
    const configEndpoint = appwriteConfig.endpoint;
    
    console.log('Appwrite Config - Environment Variables Check:');
    console.log('Raw process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID:', rawProjectId || 'not set');
    console.log('Config appwriteConfig.projectId:', configProjectId || 'not set');
    console.log('Raw process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID:', rawDatabaseId || 'not set');
    console.log('Config appwriteConfig.databaseId:', configDatabaseId || 'not set');
    console.log('Raw process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT:', rawEndpoint || 'not set');
    console.log('Config appwriteConfig.endpoint:', configEndpoint);
    
    // If raw values exist but config doesn't, there's a problem
    if (rawProjectId && !configProjectId) {
      console.error('⚠️ ERROR: Project ID exists in process.env but not in config!');
    }
    if (rawDatabaseId && !configDatabaseId) {
      console.error('⚠️ ERROR: Database ID exists in process.env but not in config!');
    }
    
    (globalThis as any).__appwriteConfigLogged = true;
  }
}

// Validate configuration (only in browser/client, only log once)
if (typeof window !== 'undefined' && !(window as any).__appwriteConfigValidated) {
  // Check both raw env vars and config values
  const rawProjectId = typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_APPWRITE_PROJECT_ID : undefined;
  const rawDatabaseId = typeof process !== 'undefined' ? (process as any).env?.NEXT_PUBLIC_APPWRITE_DATABASE_ID : undefined;
  
  const hasProjectId = (rawProjectId && rawProjectId.trim()) || (appwriteConfig.projectId && appwriteConfig.projectId.length > 0);
  const hasDatabaseId = (rawDatabaseId && rawDatabaseId.trim()) || (appwriteConfig.databaseId && appwriteConfig.databaseId.length > 0);
  
  // Use the value that exists (prefer raw if config is missing)
  const effectiveProjectId = rawProjectId?.trim() || appwriteConfig.projectId;
  const effectiveDatabaseId = rawDatabaseId?.trim() || appwriteConfig.databaseId;
  
  if (!hasProjectId) {
    console.warn(
      '⚠️ NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set. ' +
      'Appwrite features will not work. Set it in your .env.local file.'
    );
  } else {
    // Log success quietly in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Appwrite Config: Project ID is set (${effectiveProjectId.substring(0, 8)}...)`);
    }
    // Note: Cannot set properties on config object with getters
    // The getter will read from process.env at runtime, so no need to set it
  }

  if (!hasDatabaseId) {
    console.warn(
      '⚠️ NEXT_PUBLIC_APPWRITE_DATABASE_ID is not set. ' +
      'Database features will not work. Set it in your .env.local file.'
    );
  } else {
    // Log success quietly in dev mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Appwrite Config: Database ID is set (${effectiveDatabaseId})`);
    }
    // Note: Cannot set properties on config object with getters
    // The getter will read from process.env at runtime, so no need to set it
  }
  
  (window as any).__appwriteConfigValidated = true;
}

