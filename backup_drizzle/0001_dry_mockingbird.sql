ALTER TABLE "users" ADD COLUMN "avatar" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" text DEFAULT '';