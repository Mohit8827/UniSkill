import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

type Args = {
  email: string;
  password: string;
  apply: boolean;
};

const args = process.argv.slice(2);

function readArg(flag: string) {
  const index = args.indexOf(flag);
  if (index === -1) return '';
  return args[index + 1] || '';
}

function parseArgs(): Args {
  const email = readArg('--email').trim().toLowerCase();
  const password = readArg('--password');
  const apply = args.includes('--apply');

  if (!email || !password) {
    console.error('Usage: npm run auth:resync -- --email user@example.com --password "TempPassword123!" [--apply]');
    process.exit(1);
  }

  return { email, password, apply };
}

function createAdminClient() {
  const url = (process.env.SUPABASE_URL || '').replace(/['"]+/g, '');
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').replace(/['"]+/g, '');

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function findAuthUserByEmail(client: ReturnType<typeof createAdminClient>, email: string) {
  let page = 1;

  while (page <= 20) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw error;
    }

    const matchedUser = data.users.find((user) => user.email?.toLowerCase() === email);
    if (matchedUser) {
      return matchedUser;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function countReferences(
  client: ReturnType<typeof createAdminClient>,
  profileId: string
) {
  const checks = [
    { table: 'sessions', column: 'mentor_id' },
    { table: 'sessions', column: 'student_id' },
    { table: 'transactions', column: 'user_id' },
    { table: 'reviews', column: 'reviewer_id' },
    { table: 'reviews', column: 'reviewee_id' },
    { table: 'skills', column: 'user_id' },
    { table: 'user_skills', column: 'user_id' },
    { table: 'messages', column: 'sender_id' },
    { table: 'messages', column: 'receiver_id' },
    { table: 'notifications', column: 'user_id' },
    { table: 'favorites', column: 'user_id' },
    { table: 'favorites', column: 'favorite_id' },
    { table: 'otp_verifications', column: 'user_id' },
  ] as const;

  const results = await Promise.all(
    checks.map(async ({ table, column }) => {
      const query = client
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(column, profileId);

      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return { table, column, count: count || 0 };
    })
  );

  return results.filter((entry) => entry.count > 0);
}

async function main() {
  const { email, password, apply } = parseArgs();
  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, name, display_name, college, college_email, phone')
    .eq('email', email)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error(`No profile found for ${email}`);
  }

  const existingAuthUser = await findAuthUserByEmail(supabase, email);

  if (existingAuthUser && existingAuthUser.id === profile.id) {
    console.log(`Profile ${email} is already synced with auth user ${existingAuthUser.id}.`);
    return;
  }

  if (existingAuthUser && existingAuthUser.id !== profile.id) {
    console.error(`Auth user exists for ${email}, but profile id ${profile.id} does not match auth id ${existingAuthUser.id}.`);
    console.error('Manual migration is required because dependent records may need to move to the auth user id.');
    process.exit(1);
  }

  const references = await countReferences(supabase, profile.id);
  if (references.length > 0) {
    console.error(`Profile ${profile.id} has dependent rows, so it cannot be safely re-keyed automatically:`);
    references.forEach((reference) => {
      console.error(`- ${reference.table}.${reference.column}: ${reference.count}`);
    });
    console.error('Resolve or migrate those rows first, then rerun the script.');
    process.exit(1);
  }

  console.log(`Profile ${email} has no matching auth user.`);
  console.log(`Dry run: ${apply ? 'off' : 'on'}`);

  if (!apply) {
    console.log('Run again with --apply to create a Supabase Auth user and re-key the profile row.');
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: profile.name || profile.display_name || 'User',
      college: profile.college,
      college_email: profile.college_email,
      phone: profile.phone,
    },
  });

  if (authError || !authData.user) {
    throw authError || new Error('Auth user creation failed.');
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ id: authData.user.id })
    .eq('id', profile.id);

  if (updateError) {
    throw updateError;
  }

  console.log(`Created auth user ${authData.user.id} and re-keyed profile ${profile.id} -> ${authData.user.id}.`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
