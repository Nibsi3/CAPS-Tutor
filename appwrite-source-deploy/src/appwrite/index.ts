'use client';

import { Client, Account, Databases } from 'appwrite';
import { appwriteConfig } from './config';

let clientInstance: Client | null = null;
let accountInstance: Account | null = null;
let databasesInstance: Databases | null = null;

export function getClient(): Client {
  if (!clientInstance) {
    clientInstance = new Client()
      .setEndpoint(appwriteConfig.endpoint)
      .setProject(appwriteConfig.projectId);
  }
  return clientInstance;
}

export function getAccount(): Account {
  const client = getClient();
  if (!accountInstance) {
    accountInstance = new Account(client);
  }
  return accountInstance;
}

export function getDatabases(): Databases {
  const client = getClient();
  if (!databasesInstance) {
    databasesInstance = new Databases(client);
  }
  return databasesInstance;
}

export * from './provider';
export * from './client-provider';
export * from './database/use-doc';
export * from './database/use-collection';
export * from './auth/use-user';
export * from './auth/social-auth';
export * from './auth/email-auth';

