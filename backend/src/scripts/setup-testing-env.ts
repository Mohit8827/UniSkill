
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_A_EMAIL = 'mohitprajapati8827@gmail.com';
const BUDDY_EMAIL = 'buddy.test@uniskill.com';
const BUDDY_PASSWORD = 'Testing123!';

async function setup() {
  console.log('🚀 Starting Testing Environment Setup...');

  // 1. Get User A
  const { data: userA, error: userAError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', USER_A_EMAIL)
    .single();

  if (userAError || !userA) {
    console.error('❌ Could not find User A:', userAError?.message);
    return;
  }
  console.log('✅ Found User A:', userA.id);

  // 2. Update User A Profile for Matching
  await supabase.from('profiles').update({
    skills: ['React', 'TypeScript'],
    learning_goals: ['Python'],
    is_mentor: true,
    is_verified: true,
    current_status: 'verified'
  }).eq('id', userA.id);
  console.log('✅ Updated User A Profile');

  // 3. Create/Get Buddy User
  let buddyId: string;
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const existingBuddy = authUsers.users.find(u => u.email === BUDDY_EMAIL);

  if (existingBuddy) {
    buddyId = existingBuddy.id;
    console.log('✅ Buddy Auth already exists');
  } else {
    const { data: newBuddy, error: createError } = await supabase.auth.admin.createUser({
      email: BUDDY_EMAIL,
      password: BUDDY_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Buddy Tester', college: 'UniSkill Lab' }
    });
    if (createError) throw createError;
    buddyId = newBuddy.user.id;
    console.log('✅ Created Buddy Auth');
  }

  // 4. Update Buddy Profile
  await supabase.from('profiles').update({
    name: 'Buddy Tester',
    display_name: 'Buddy Tester',
    skills: ['Python'],
    learning_goals: ['React', 'TypeScript'],
    is_mentor: true,
    is_verified: true,
    current_status: 'verified',
    credits: 500,
    credits_balance: 500
  }).eq('id', buddyId);
  console.log('✅ Updated Buddy Profile');

  // 5. Clear old test sessions to avoid clutter
  await supabase.from('sessions').delete().or(`mentor_id.eq.${userA.id},student_id.eq.${userA.id}`);

  // 6. Create Session 1: You (Mentor) -> Buddy (Student)
  const { error: s1Error } = await supabase.from('sessions').insert({
    mentor_id: userA.id,
    student_id: buddyId,
    title: 'React & TS Masterclass',
    description: 'Testing video session where you are the Mentor.',
    status: 'confirmed',
    price: 50,
    duration: 60,
    room_id: `test-room-mentor-${Date.now()}`
  });
  if (s1Error) console.error('Error Session 1:', s1Error);

  // 7. Create Session 2: Buddy (Mentor) -> You (Student)
  const { error: s2Error } = await supabase.from('sessions').insert({
    mentor_id: buddyId,
    student_id: userA.id,
    title: 'Python for Beginners',
    description: 'Testing video session where Buddy is the Mentor.',
    status: 'confirmed',
    price: 50,
    duration: 60,
    room_id: `test-room-student-${Date.now()}`
  });
  if (s2Error) console.error('Error Session 2:', s2Error);

  console.log('\n✨ SETUP COMPLETE ✨');
  console.log('-----------------------------------');
  console.log(`Buddy Email: ${BUDDY_EMAIL}`);
  console.log(`Buddy Password: ${BUDDY_PASSWORD}`);
  console.log('-----------------------------------');
  console.log('Action: Refresh your dashboard to see the active sessions.');
}

setup().catch(console.error);
