
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

async function testAnonKey() {
  if (!supabaseUrl || !anonKey) {
    console.log('Missing URL or Anon Key');
    return;
  }

  const supabase = createClient(supabaseUrl, anonKey);
  
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  
  if (error) {
    console.log('Anon Key is INVALID:', error.message);
  } else {
    console.log('Anon Key is VALID. Fetched', data?.length, 'rows');
  }
}

testAnonKey();
