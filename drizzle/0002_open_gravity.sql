ALTER TABLE "pollutants" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "pollutants" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "weather" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "weather" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sensors" ADD COLUMN "checked" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_gold_pollutants_created_at" ON "pollutants" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_gold_pollutants_place_id" ON "pollutants" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "idx_gold_pollutants_source_id" ON "pollutants" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_gold_weather_created_at" ON "weather" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_gold_weather_place_id" ON "weather" USING btree ("place_id");--> statement-breakpoint
ALTER TABLE "pollutants" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "weather" DROP COLUMN "updated_at";