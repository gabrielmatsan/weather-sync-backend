CREATE SCHEMA "gold";
--> statement-breakpoint
CREATE TYPE "public"."notifications" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'inactive', 'expired', 'cancelled', 'pending', 'suspended', 'refunded', 'failed', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."signature_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "gold"."air_quality" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"aqi_universal" integer NOT NULL,
	"name_display" varchar(50) NOT NULL,
	"display_value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gold"."data_source" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorite_places" (
	"user_id" varchar(36) NOT NULL,
	"place_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "favorite_places_user_id_place_id_pk" PRIMARY KEY("user_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "gold"."places" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"latitude" numeric(11, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "gold"."pollutants" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"dominant_pollutant" varchar(255) NOT NULL,
	"co_concentration" numeric(10, 6) NOT NULL,
	"co_metric_unit" varchar(30) NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "gold"."sensors" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"water_level" numeric(10, 6) NOT NULL,
	"water_level_unit" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"checked" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"days_time_duration" varchar(255) NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"plan_id" integer,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" "subscription_status" DEFAULT 'inactive',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"signature_status" "signature_status" DEFAULT 'inactive',
	"phone_number" varchar(20) NOT NULL,
	"role" "role" DEFAULT 'user',
	"notifications" "notifications" DEFAULT 'yes',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "weather" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"temperature" numeric(5, 2) NOT NULL,
	"humidity" integer NOT NULL,
	"pression" integer NOT NULL,
	"wind_speed" numeric(4, 2) NOT NULL,
	"wind_direction" integer NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "gold"."air_quality" ADD CONSTRAINT "air_quality_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "gold"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."air_quality" ADD CONSTRAINT "air_quality_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_places" ADD CONSTRAINT "favorite_places_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_places" ADD CONSTRAINT "favorite_places_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "gold"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."pollutants" ADD CONSTRAINT "pollutants_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "gold"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."pollutants" ADD CONSTRAINT "pollutants_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."sensors" ADD CONSTRAINT "sensors_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "gold"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."sensors" ADD CONSTRAINT "sensors_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather" ADD CONSTRAINT "weather_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "gold"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather" ADD CONSTRAINT "weather_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "gold"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorite_places_user_id" ON "favorite_places" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_places_place_id" ON "favorite_places" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "idx_gold_pollutants_created_at" ON "gold"."pollutants" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_gold_pollutants_place_id" ON "gold"."pollutants" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "idx_gold_pollutants_source_id" ON "gold"."pollutants" USING btree ("source_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_id_index" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_number_index" ON "users" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_gold_weather_created_at" ON "weather" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_gold_weather_place_id" ON "weather" USING btree ("place_id");