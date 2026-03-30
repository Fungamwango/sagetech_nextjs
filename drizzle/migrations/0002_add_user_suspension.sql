ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "suspended_until" timestamp,
ADD COLUMN IF NOT EXISTS "suspend_reason" text;
