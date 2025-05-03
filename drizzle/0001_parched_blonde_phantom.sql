CREATE TABLE "air_quality" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"aqi_universal" integer NOT NULL,
	"name_display" varchar(50) NOT NULL,
	"display_value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_source" (
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
CREATE TABLE "places" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"latitude" numeric(11, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pollutants" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"dominant_pollutant" varchar(255) NOT NULL,
	"co_concentration" numeric(10, 6) NOT NULL,
	"co_metric_unit" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sensors" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	"water_level" numeric(10, 6) NOT NULL,
	"water_level_unit" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
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
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "air_quality" ADD CONSTRAINT "air_quality_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "air_quality" ADD CONSTRAINT "air_quality_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_places" ADD CONSTRAINT "favorite_places_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_places" ADD CONSTRAINT "favorite_places_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pollutants" ADD CONSTRAINT "pollutants_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pollutants" ADD CONSTRAINT "pollutants_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather" ADD CONSTRAINT "weather_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather" ADD CONSTRAINT "weather_source_id_data_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_source"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "favorite_places_user_id" ON "favorite_places" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "favorite_places_place_id" ON "favorite_places" USING btree ("place_id");