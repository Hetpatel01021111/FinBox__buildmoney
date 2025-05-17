// This script prepares the environment for Vercel deployment
const fs = require('fs');
const path = require('path');

// Function to prepare the Prisma environment for Vercel
function prepareForVercel() {
  console.log('Preparing for deployment...');
  
  const prismaDir = path.join(process.cwd(), 'prisma');
  const mainSchemaPath = path.join(prismaDir, 'schema.prisma');
  const vercelSchemaPath = path.join(prismaDir, 'schema.vercel.prisma');
  const backupSchemaPath = path.join(prismaDir, 'schema.original.prisma');
  
  // If the Vercel-specific schema exists
  if (fs.existsSync(vercelSchemaPath)) {
    console.log('Found Vercel-specific Prisma schema, using it for deployment...');
    
    // Backup the original schema if not already done
    if (!fs.existsSync(backupSchemaPath) && fs.existsSync(mainSchemaPath)) {
      fs.copyFileSync(mainSchemaPath, backupSchemaPath);
      console.log('Original schema backed up.');
    }
    
    // Replace the main schema with the Vercel-specific one
    fs.copyFileSync(vercelSchemaPath, mainSchemaPath);
    console.log('Replaced main schema with Vercel-specific schema.');
  } else {
    console.log('No Vercel-specific schema found, using the default schema.');
  }
  
  // Create a dummy .env file if it doesn't exist
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, 'DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"\nDIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"');
    console.log('Created dummy .env file for build process.');
  }
}

// Run the function
prepareForVercel();

// Export the function for use in other scripts
module.exports = { prepareForVercel };
