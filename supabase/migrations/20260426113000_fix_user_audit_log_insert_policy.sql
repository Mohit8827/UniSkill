-- Allow authenticated users to create audit log entries for their own changes.
-- Without this, the profile update trigger rolls back with an RLS violation.

DROP POLICY IF EXISTS "Users can insert their own audit logs" ON user_audit_log;

CREATE POLICY "Users can insert their own audit logs" ON user_audit_log
FOR INSERT
WITH CHECK (auth.uid() = changed_by);
