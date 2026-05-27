-- Make auth-triggered signup initialization resilient so Auth user creation
-- never fails because a downstream profile sync table insert throws.

CREATE OR REPLACE FUNCTION handle_uniskill_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO profiles (
      id,
      email,
      name,
      display_name,
      avatar_url,
      college,
      college_email,
      phone,
      credits,
      credits_balance,
      is_verified,
      current_status,
      metadata
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name', 'User'),
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'college',
      NEW.raw_user_meta_data->>'college_email',
      NEW.raw_user_meta_data->>'phone',
      100,
      100.00,
      FALSE,
      'unverified',
      jsonb_build_object('signup_source', 'auth_trigger', 'onboarding_step', 1)
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(profiles.name, EXCLUDED.name),
      display_name = COALESCE(profiles.display_name, EXCLUDED.display_name),
      college = COALESCE(profiles.college, EXCLUDED.college),
      college_email = COALESCE(profiles.college_email, EXCLUDED.college_email),
      phone = COALESCE(profiles.phone, EXCLUDED.phone),
      avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
      updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'handle_uniskill_user_signup profiles sync failed for user %: %', NEW.id, SQLERRM;
  END;

  BEGIN
    INSERT INTO user_verification_vault (
      id,
      full_legal_name,
      college_name,
      college_email,
      phone_number
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
      NEW.raw_user_meta_data->>'college',
      NEW.raw_user_meta_data->>'college_email',
      NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET
      full_legal_name = COALESCE(user_verification_vault.full_legal_name, EXCLUDED.full_legal_name),
      college_name = COALESCE(user_verification_vault.college_name, EXCLUDED.college_name),
      college_email = COALESCE(user_verification_vault.college_email, EXCLUDED.college_email),
      phone_number = COALESCE(user_verification_vault.phone_number, EXCLUDED.phone_number),
      updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'handle_uniskill_user_signup verification vault sync failed for user %: %', NEW.id, SQLERRM;
  END;

  BEGIN
    INSERT INTO signup_details (
      id,
      college,
      college_email,
      phone,
      personal_email_verified,
      college_email_verified,
      phone_verified,
      verification_step
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'college',
      NEW.raw_user_meta_data->>'college_email',
      NEW.raw_user_meta_data->>'phone',
      FALSE,
      FALSE,
      FALSE,
      1
    )
    ON CONFLICT (id) DO UPDATE SET
      college = COALESCE(signup_details.college, EXCLUDED.college),
      college_email = COALESCE(signup_details.college_email, EXCLUDED.college_email),
      phone = COALESCE(signup_details.phone, EXCLUDED.phone),
      updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'handle_uniskill_user_signup signup details sync failed for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
