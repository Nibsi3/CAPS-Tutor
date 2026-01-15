/**
 * Script to add the dateOfBirth attribute to the 'user' collection in Appwrite
 * 
 * This script adds a string attribute to store date of birth as ISO string.
 * 
 * Run with: node scripts/add-dateofbirth-attribute.mjs
 * 
 * Requirements:
 * - APPWRITE_ENDPOINT environment variable (or NEXT_PUBLIC_APPWRITE_ENDPOINT)
 * - APPWRITE_PROJECT_ID environment variable (or NEXT_PUBLIC_APPWRITE_PROJECT_ID)
 * - APPWRITE_API_KEY environment variable (with write permissions)
 * - NEXT_PUBLIC_APPWRITE_DATABASE_ID environment variable
 */

import { Client, Databases } from 'node-appwrite';

async function addDateOfBirthAttribute() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'capstutor';
  const collectionId = 'user';

  if (!projectId) {
    console.error('❌ Error: APPWRITE_PROJECT_ID or NEXT_PUBLIC_APPWRITE_PROJECT_ID is required');
    process.exit(1);
  }

  if (!apiKey) {
    console.error('❌ Error: APPWRITE_API_KEY is required');
    process.exit(1);
  }

  console.log('🔧 Adding dateOfBirth attribute to user collection...');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project ID: ${projectId.substring(0, 8)}...`);
  console.log(`   Database ID: ${databaseId}`);
  console.log(`   Collection ID: ${collectionId}`);

  try {
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const databases = new Databases(client);

    // Check if attribute already exists
    try {
      const attributes = await databases.listAttributes(databaseId, collectionId);
      const existingAttribute = attributes.attributes.find(
        (attr) => attr.key === 'dateOfBirth'
      );

      if (existingAttribute) {
        console.log('✅ Attribute dateOfBirth already exists');
        console.log(`   Type: ${existingAttribute.type}`);
        console.log(`   Required: ${existingAttribute.required}`);
        console.log(`   Array: ${existingAttribute.array}`);
        return;
      }
    } catch (error) {
      // If listAttributes fails, we'll try to create it anyway
      console.log('⚠️  Could not check existing attributes, proceeding to create...');
    }

    // Create the string attribute
    // Using string type since the code stores ISO strings
    // size: 255 is sufficient for ISO date strings (e.g., "2024-01-15T00:00:00.000Z")
    const attribute = await databases.createStringAttribute(
      databaseId,
      collectionId,
      'dateOfBirth',
      255, // size
      false // required - set to false to allow null/optional values
    );

    console.log('✅ Successfully created dateOfBirth attribute');
    console.log(`   Attribute ID: ${attribute.$id}`);
    console.log(`   Type: ${attribute.type}`);
    console.log(`   Required: ${attribute.required}`);
    console.log(`   Size: ${attribute.size}`);
    
    console.log('\n⏳ Waiting for attribute to be ready (this may take a few seconds)...');
    
    // Wait for attribute to be ready
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait
    
    while (!isReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;
      
      try {
        const attributes = await databases.listAttributes(databaseId, collectionId);
        const dateOfBirthAttr = attributes.attributes.find(
          (attr) => attr.key === 'dateOfBirth'
        );
        
        if (dateOfBirthAttr && dateOfBirthAttr.status === 'available') {
          isReady = true;
          console.log('✅ Attribute is now ready to use!');
        } else if (dateOfBirthAttr) {
          console.log(`   Status: ${dateOfBirthAttr.status} (attempt ${attempts}/${maxAttempts})`);
        }
      } catch (error) {
        // Continue waiting
      }
    }
    
    if (!isReady) {
      console.log('⚠️  Attribute creation is still in progress. It should be ready shortly.');
      console.log('   You can check the status in the Appwrite Console.');
    }

  } catch (error) {
    console.error('❌ Error adding dateOfBirth attribute:', error.message);
    if (error.code === 409) {
      console.log('   This usually means the attribute already exists.');
    } else if (error.code === 401) {
      console.log('   Authentication failed. Check your APPWRITE_API_KEY.');
    } else if (error.code === 404) {
      console.log('   Collection or database not found. Check your database and collection IDs.');
    }
    process.exit(1);
  }
}

// Run the script
addDateOfBirthAttribute()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });


