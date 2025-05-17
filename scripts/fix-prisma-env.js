// This script helps fix Prisma environment variables for Vercel deployment
const fs = require('fs');
const path = require('path');

// Function to ensure the DATABASE_URL starts with postgres://
function fixDatabaseUrl() {
  // Check if we're in a Vercel environment
  if (process.env.VERCEL) {
    console.log('Running in Vercel environment, checking DATABASE_URL format...');
    
    // Get the current DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    
    // If it doesn't start with postgres://, fix it
    if (dbUrl && !dbUrl.startsWith('postgres://')) {
      console.log('Fixing DATABASE_URL format...');
      
      // If it starts with postgresql://, replace it
      if (dbUrl.startsWith('postgresql://')) {
        process.env.DATABASE_URL = dbUrl.replace('postgresql://', 'postgres://');
        console.log('DATABASE_URL format fixed.');
      } else {
        console.log('DATABASE_URL format is unexpected, please check manually.');
      }
    } else {
      console.log('DATABASE_URL format is correct or not set.');
    }
    
    // Do the same for DIRECT_URL if it exists
    const directUrl = process.env.DIRECT_URL;
    if (directUrl && !directUrl.startsWith('postgres://')) {
      console.log('Fixing DIRECT_URL format...');
      
      if (directUrl.startsWith('postgresql://')) {
        process.env.DIRECT_URL = directUrl.replace('postgresql://', 'postgres://');
        console.log('DIRECT_URL format fixed.');
      } else {
        console.log('DIRECT_URL format is unexpected, please check manually.');
      }
    } else {
      console.log('DIRECT_URL format is correct or not set.');
    }
  } else {
    console.log('Not running in Vercel environment, skipping DATABASE_URL check.');
  }
}

// Run the function
fixDatabaseUrl();

// Export the function for use in other scripts
module.exports = { fixDatabaseUrl };
