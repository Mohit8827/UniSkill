
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testKey() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('Missing URL or Key');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.log('Key is INVALID:', error.message);
  } else {
    console.log('Key is VALID. Found', data.users.length, 'users');
  }
}

testKey();
