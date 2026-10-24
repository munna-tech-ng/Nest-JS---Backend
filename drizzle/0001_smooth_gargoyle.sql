CREATE TABLE "logger" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" text DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"context" jsonb,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
