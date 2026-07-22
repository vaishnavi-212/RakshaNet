CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text,
	"step_name" text NOT NULL,
	"input_summary" text NOT NULL,
	"output_summary" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"first_seen_session_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_entities" (
	"session_id" text NOT NULL,
	"entity_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"district" text NOT NULL,
	"classification" text NOT NULL,
	"scam_type" text NOT NULL,
	"confidence" integer NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"risk_band" text DEFAULT 'green' NOT NULL,
	"risk_reasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mode" text DEFAULT 'detect' NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"escalation_confidence" double precision DEFAULT 0 NOT NULL,
	"agent_active" boolean DEFAULT false NOT NULL,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"explanation" text,
	"actionable_advice" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_first_seen_session_id_sessions_id_fk" FOREIGN KEY ("first_seen_session_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_entities" ADD CONSTRAINT "session_entities_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_entities" ADD CONSTRAINT "session_entities_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "type_value_idx" ON "entities" USING btree ("type","value");--> statement-breakpoint
CREATE UNIQUE INDEX "session_entity_pk" ON "session_entities" USING btree ("session_id","entity_id");