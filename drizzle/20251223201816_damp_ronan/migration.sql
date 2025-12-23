CREATE TABLE "categories" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"description" text DEFAULT '',
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health" (
	"id" serial PRIMARY KEY,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"code" text NOT NULL UNIQUE,
	"lat" text DEFAULT '',
	"lng" text DEFAULT '',
	"flag" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "os" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"code" text NOT NULL UNIQUE,
	"description" text DEFAULT '',
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"ip" text NOT NULL UNIQUE,
	"port" integer DEFAULT 3500,
	"status" text DEFAULT 'offline',
	"is_premium" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	"ccu" integer DEFAULT 0,
	"max_ccu" integer DEFAULT 100,
	"bandwidth" integer DEFAULT 0,
	"speed" integer DEFAULT 0,
	"priority" integer DEFAULT 0,
	"flag" text DEFAULT '',
	"location_id" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"description" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "server_categories" (
	"server_id" integer,
	"category_id" integer,
	CONSTRAINT "server_categories_pkey" PRIMARY KEY("server_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "server_tags" (
	"server_id" integer,
	"tag_id" integer,
	CONSTRAINT "server_tags_pkey" PRIMARY KEY("server_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "special_locations" (
	"id" serial PRIMARY KEY,
	"location_id" integer NOT NULL,
	"type" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"description" text DEFAULT '',
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"is_guest" boolean DEFAULT false,
	"phone" text UNIQUE,
	"code" text DEFAULT '',
	"password" text NOT NULL,
	"avatar" text DEFAULT '',
	"provider" text NOT NULL,
	"provider_id" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_category_name" ON "categories" ("name");--> statement-breakpoint
CREATE INDEX "idx_location_code" ON "locations" ("code");--> statement-breakpoint
CREATE INDEX "idx_os_code" ON "os" ("code");--> statement-breakpoint
CREATE INDEX "idx_server_location_id" ON "servers" ("location_id");--> statement-breakpoint
CREATE INDEX "idx_tag_name" ON "tags" ("name");--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "fk_server_location" FOREIGN KEY ("location_id") REFERENCES "locations"("id");--> statement-breakpoint
ALTER TABLE "server_categories" ADD CONSTRAINT "server_categories_server_id_servers_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id");--> statement-breakpoint
ALTER TABLE "server_categories" ADD CONSTRAINT "server_categories_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id");--> statement-breakpoint
ALTER TABLE "server_tags" ADD CONSTRAINT "server_tags_server_id_servers_id_fkey" FOREIGN KEY ("server_id") REFERENCES "servers"("id");--> statement-breakpoint
ALTER TABLE "server_tags" ADD CONSTRAINT "server_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id");--> statement-breakpoint
ALTER TABLE "special_locations" ADD CONSTRAINT "special_locations_location_id_locations_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id");--> statement-breakpoint
ALTER TABLE "special_locations" ADD CONSTRAINT "fk_special_location_location" FOREIGN KEY ("location_id") REFERENCES "locations"("id");