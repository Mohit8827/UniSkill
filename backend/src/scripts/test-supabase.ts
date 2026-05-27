import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = (process.env.SUPABASE_URL || '').replace(/['"]+/g, '');
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/['"]+/g, '');

console.log('Testing Supabase connection...');
console.log('URL:', url);

const supabase = createClient(url, serviceKey);

async function test() {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Connection failed:', error.message);
      process.exit(1);
    }
    console.log('Connection successful! Profiles count:', data);
  } catch (err) {
    console.error('An unexpected error occurred:', err);
    process.exit(1);
  }
}

test();
