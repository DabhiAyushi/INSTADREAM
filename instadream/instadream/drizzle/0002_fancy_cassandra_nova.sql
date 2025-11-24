CREATE TABLE "generated_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"caption" text,
	"image_url" text,
	"storage_key" text,
	"model_used" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
