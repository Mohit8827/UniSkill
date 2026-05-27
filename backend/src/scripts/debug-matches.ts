import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = (process.env.SUPABASE_URL || '').replace(/['"]+/g, '');
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/['"]+/g, '');

const supabase = createClient(url, serviceKey);

async function checkProfiles() {
  console.log('--- Checking Profiles Data ---');
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, display_name, skills, learning_goals');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No profiles found in the database.');
    return;
  }

  console.log(`Found ${data.length} profiles:`);
  data.forEach(p => {
    console.log(`- ID: ${p.id}`);
    console.log(`  Name: ${p.display_name || p.name}`);
    console.log(`  Skills: ${JSON.stringify(p.skills)}`);
    console.log(`  Goals: ${JSON.stringify(p.learning_goals)}`);
    console.log('---');
  });
}

checkProfiles();
