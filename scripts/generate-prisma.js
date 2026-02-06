import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('Generating Prisma Client...');

try {
    execSync('npx prisma generate', {
        stdio: 'inherit',
        env: process.env
    });
    console.log('✅ Prisma Client generated successfully!');
} catch (error) {
    console.error('❌ Error generating Prisma Client:', error.message);
    process.exit(1);
}
