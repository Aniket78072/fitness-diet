// Test script to check environment variables on Render
import dotenv from 'dotenv';

dotenv.config();

console.log('Environment Variables Check:');
console.log('===========================');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Set' : '❌ Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '5000');

if (!process.env.DEEPSEEK_API_KEY) {
  console.log('\n❌ CRITICAL: DEEPSEEK_API_KEY is missing!');
  console.log('This is why AI suggestions are failing with 500 error.');
  console.log('\nTo fix this:');
  console.log('1. Go to your Render dashboard');
  console.log('2. Select your fitness-diet-app service');
  console.log('3. Go to Environment');
  console.log('4. Add environment variable: DEEPSEEK_API_KEY');
  console.log('5. Get the key from: https://platform.deepseek.com/');
  console.log('6. Redeploy the service');
}

if (!process.env.MONGO_URI) {
  console.log('\n❌ CRITICAL: MONGO_URI is missing!');
  console.log('Database connection will fail.');
}

if (!process.env.JWT_SECRET) {
  console.log('\n❌ CRITICAL: JWT_SECRET is missing!');
  console.log('Authentication will fail.');
}
