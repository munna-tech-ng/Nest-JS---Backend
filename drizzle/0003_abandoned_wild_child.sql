CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"lat" text DEFAULT '',
	"lng" text DEFAULT '',
	"flag" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_name_unique" UNIQUE("name"),
	CONSTRAINT "locations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "os" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text DEFAULT '',
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "os_name_unique" UNIQUE("name"),
	CONSTRAINT "os_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"ip" text NOT NULL,
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
	"description" text DEFAULT '',
	CONSTRAINT "servers_name_unique" UNIQUE("name"),
	CONSTRAINT "servers_ip_unique" UNIQUE("ip")
);
--> statement-breakpoint
CREATE TABLE "server_categories" (
	"server_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "server_categories_server_id_category_id_pk" PRIMARY KEY("server_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "server_tags" (
	"server_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "server_tags_server_id_tag_id_pk" PRIMARY KEY("server_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "special_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer NOT NULL,
	"type" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "fk_server_location" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_categories" ADD CONSTRAINT "server_categories_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_categories" ADD CONSTRAINT "server_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_tags" ADD CONSTRAINT "server_tags_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_tags" ADD CONSTRAINT "server_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_locations" ADD CONSTRAINT "special_locations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "special_locations" ADD CONSTRAINT "fk_special_location_location" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_category_name" ON "categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_location_code" ON "locations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_os_code" ON "os" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_server_location_id" ON "servers" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "idx_tag_name" ON "tags" USING btree ("name");