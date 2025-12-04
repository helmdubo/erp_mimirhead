


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "auth";


ALTER SCHEMA "auth" OWNER TO "supabase_admin";


CREATE SCHEMA IF NOT EXISTS "hr";


ALTER SCHEMA "hr" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "kaiten";


ALTER SCHEMA "kaiten" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "ops";


ALTER SCHEMA "ops" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "ref";


ALTER SCHEMA "ref" OWNER TO "postgres";


CREATE TYPE "auth"."aal_level" AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE "auth"."aal_level" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."code_challenge_method" AS ENUM (
    's256',
    'plain'
);


ALTER TYPE "auth"."code_challenge_method" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_status" AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE "auth"."factor_status" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."factor_type" AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE "auth"."factor_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_authorization_status" AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE "auth"."oauth_authorization_status" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_client_type" AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE "auth"."oauth_client_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_registration_type" AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE "auth"."oauth_registration_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."oauth_response_type" AS ENUM (
    'code'
);


ALTER TYPE "auth"."oauth_response_type" OWNER TO "supabase_auth_admin";


CREATE TYPE "auth"."one_time_token_type" AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE "auth"."one_time_token_type" OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."email"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION "auth"."email"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."email"() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';



CREATE OR REPLACE FUNCTION "auth"."jwt"() RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION "auth"."jwt"() OWNER TO "supabase_auth_admin";


CREATE OR REPLACE FUNCTION "auth"."role"() RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION "auth"."role"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."role"() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';



CREATE OR REPLACE FUNCTION "auth"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION "auth"."uid"() OWNER TO "supabase_auth_admin";


COMMENT ON FUNCTION "auth"."uid"() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';



CREATE OR REPLACE FUNCTION "kaiten"."fill_card_space_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'kaiten', 'public'
    AS $$
BEGIN
    IF NEW.space_id IS NULL AND NEW.board_id IS NOT NULL THEN
        SELECT space_id INTO NEW.space_id
        FROM kaiten.boards
        WHERE id = NEW.board_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "kaiten"."fill_card_space_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "ops"."sync_task_from_kaiten_card"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'ops', 'kaiten', 'public'
    AS $$
DECLARE
    target_project_id bigint;
    found_owner_id bigint;
    found_assignee_id bigint;
    found_members_ids bigint[];
    found_parent_id bigint;
    found_children_ids bigint[];
BEGIN
    -- 1. Проект (старая логика)
    SELECT m.project_id INTO target_project_id
    FROM jsonb_to_recordset(COALESCE(NEW.tags_cache, '[]'::jsonb)) AS t(id bigint) 
    JOIN ops.project_tag_mapping m ON m.kaiten_tag_id = t.id
    LIMIT 1;

    -- 2. Люди (старая логика)
    SELECT id INTO found_owner_id FROM ops.employees WHERE kaiten_user_id = NEW.creator_id; 
    IF found_owner_id IS NULL THEN
        SELECT id INTO found_owner_id FROM ops.employees WHERE kaiten_user_id = NEW.owner_id;
    END IF;

    SELECT e.id INTO found_assignee_id
    FROM jsonb_to_recordset(COALESCE(NEW.members_data, '[]'::jsonb)) AS m(id bigint, type int)
    JOIN ops.employees e ON e.kaiten_user_id = m.id
    WHERE m.type = 2 LIMIT 1;

    SELECT ARRAY_AGG(e.id) INTO found_members_ids
    FROM jsonb_to_recordset(COALESCE(NEW.members_data, '[]'::jsonb)) AS m(id bigint)
    JOIN ops.employees e ON e.kaiten_user_id = m.id;

    -- 3. Иерархия (старая логика)
    found_parent_id := (NEW.parents_ids)[1];
    found_children_ids := NEW.children_ids;

    -- 4. Upsert ops.tasks (ОБНОВЛЕНО: external_id, tags)
    INSERT INTO ops.tasks (
        id, kaiten_card_id, project_id, 
        owner_id, assignee_id, all_members_ids,
        parent_task_id, children_task_ids,
        status, title, estimate_hours, time_spent_sum, completed_at, raw_synced_at,
        
        -- Новые поля
        external_id,
        tags
    )
    VALUES (
        NEW.id, NEW.id, target_project_id,
        found_owner_id, found_assignee_id, COALESCE(found_members_ids, '{}'),
        found_parent_id, COALESCE(found_children_ids, '{}'),
        CASE WHEN NEW.state = 2 THEN 'in_progress' WHEN NEW.state = 3 THEN 'done' ELSE 'todo' END,
        NEW.title, COALESCE(NEW.estimate_workload, 0), COALESCE(NEW.time_spent_sum, 0),
        NEW.completed_at, now(),
        
        -- Новые значения
        NEW.external_id,
        COALESCE(NEW.tags_cache, '[]'::jsonb) -- Кладем весь массив тегов
    )
    ON CONFLICT (id) DO UPDATE SET
        project_id = EXCLUDED.project_id,
        owner_id = EXCLUDED.owner_id,
        assignee_id = EXCLUDED.assignee_id,
        all_members_ids = EXCLUDED.all_members_ids,
        parent_task_id = EXCLUDED.parent_task_id,
        children_task_ids = EXCLUDED.children_task_ids,
        status = EXCLUDED.status,
        title = EXCLUDED.title,
        estimate_hours = EXCLUDED.estimate_hours,
        time_spent_sum = EXCLUDED.time_spent_sum,
        completed_at = EXCLUDED.completed_at,
        raw_synced_at = now(),
        
        -- Обновляем новые поля
        external_id = EXCLUDED.external_id,
        tags = EXCLUDED.tags;

    -- 5. Детальные назначения (старая логика)
    DELETE FROM ops.task_assignments WHERE task_id = NEW.id;
    INSERT INTO ops.task_assignments (task_id, employee_id, role_type)
    SELECT NEW.id, e.id, (m->>'type')::int
    FROM jsonb_array_elements(COALESCE(NEW.members_data, '[]'::jsonb)) AS m
    JOIN ops.employees e ON e.kaiten_user_id = (m->>'id')::bigint
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "ops"."sync_task_from_kaiten_card"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_tables"() RETURNS TABLE("schemaname" "text", "tablename" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    t.table_schema::text AS schemaname,
    t.table_name::text AS tablename
  FROM information_schema.tables t
  WHERE t.table_schema IN ('public', 'kaiten')
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_schema, t.table_name;
$$;


ALTER FUNCTION "public"."list_tables"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."list_tables"() IS 'Returns list of tables from public and kaiten schemas';



CREATE OR REPLACE FUNCTION "public"."sync_employee_kaiten_roles"() RETURNS TABLE("updated_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'ops', 'kaiten'
    AS $$
DECLARE
  updated_rows integer;
BEGIN
  -- Ensure every referenced kaiten.users.role has a corresponding kaiten.roles row
  INSERT INTO kaiten.roles (id, name, company_id, created_at, updated_at, synced_at, raw_payload)
  SELECT DISTINCT ku.role,
         CONCAT('Unknown Kaiten Role #', ku.role),
         NULL,
         now(),
         now(),
         now(),
         jsonb_build_object('source', 'kaiten.users', 'note', 'Backfilled to satisfy FK for employees')
  FROM kaiten.users ku
  WHERE ku.role IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM kaiten.roles r WHERE r.id = ku.role
    );

  -- Update employee references only when the Kaiten role exists (or null it when absent)
  UPDATE ops.employees e
  SET kaiten_role_id = kr.id
  FROM kaiten.users ku
  LEFT JOIN kaiten.roles kr ON ku.role = kr.id
  WHERE e.kaiten_user_id = ku.id
    AND (e.kaiten_role_id IS DISTINCT FROM kr.id);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN QUERY SELECT updated_rows;
END;
$$;


ALTER FUNCTION "public"."sync_employee_kaiten_roles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sync_metadata_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_sync_metadata_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "auth"."audit_log_entries" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "payload" json,
    "created_at" timestamp with time zone,
    "ip_address" character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE "auth"."audit_log_entries" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."audit_log_entries" IS 'Auth: Audit trail for user actions.';



CREATE TABLE IF NOT EXISTS "auth"."flow_state" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "auth_code" "text" NOT NULL,
    "code_challenge_method" "auth"."code_challenge_method" NOT NULL,
    "code_challenge" "text" NOT NULL,
    "provider_type" "text" NOT NULL,
    "provider_access_token" "text",
    "provider_refresh_token" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "authentication_method" "text" NOT NULL,
    "auth_code_issued_at" timestamp with time zone
);


ALTER TABLE "auth"."flow_state" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."flow_state" IS 'stores metadata for pkce logins';



CREATE TABLE IF NOT EXISTS "auth"."identities" (
    "provider_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "identity_data" "jsonb" NOT NULL,
    "provider" "text" NOT NULL,
    "last_sign_in_at" timestamp with time zone,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "email" "text" GENERATED ALWAYS AS ("lower"(("identity_data" ->> 'email'::"text"))) STORED,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "auth"."identities" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."identities" IS 'Auth: Stores identities associated to a user.';



COMMENT ON COLUMN "auth"."identities"."email" IS 'Auth: Email is a generated column that references the optional email property in the identity_data';



CREATE TABLE IF NOT EXISTS "auth"."instances" (
    "id" "uuid" NOT NULL,
    "uuid" "uuid",
    "raw_base_config" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "auth"."instances" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."instances" IS 'Auth: Manages users across multiple sites.';



CREATE TABLE IF NOT EXISTS "auth"."mfa_amr_claims" (
    "session_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "authentication_method" "text" NOT NULL,
    "id" "uuid" NOT NULL
);


ALTER TABLE "auth"."mfa_amr_claims" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_amr_claims" IS 'auth: stores authenticator method reference claims for multi factor authentication';



CREATE TABLE IF NOT EXISTS "auth"."mfa_challenges" (
    "id" "uuid" NOT NULL,
    "factor_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "verified_at" timestamp with time zone,
    "ip_address" "inet" NOT NULL,
    "otp_code" "text",
    "web_authn_session_data" "jsonb"
);


ALTER TABLE "auth"."mfa_challenges" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_challenges" IS 'auth: stores metadata about challenge requests made';



CREATE TABLE IF NOT EXISTS "auth"."mfa_factors" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "friendly_name" "text",
    "factor_type" "auth"."factor_type" NOT NULL,
    "status" "auth"."factor_status" NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "secret" "text",
    "phone" "text",
    "last_challenged_at" timestamp with time zone,
    "web_authn_credential" "jsonb",
    "web_authn_aaguid" "uuid",
    "last_webauthn_challenge_data" "jsonb"
);


ALTER TABLE "auth"."mfa_factors" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."mfa_factors" IS 'auth: stores metadata about factors';



COMMENT ON COLUMN "auth"."mfa_factors"."last_webauthn_challenge_data" IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';



CREATE TABLE IF NOT EXISTS "auth"."oauth_authorizations" (
    "id" "uuid" NOT NULL,
    "authorization_id" "text" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "redirect_uri" "text" NOT NULL,
    "scope" "text" NOT NULL,
    "state" "text",
    "resource" "text",
    "code_challenge" "text",
    "code_challenge_method" "auth"."code_challenge_method",
    "response_type" "auth"."oauth_response_type" DEFAULT 'code'::"auth"."oauth_response_type" NOT NULL,
    "status" "auth"."oauth_authorization_status" DEFAULT 'pending'::"auth"."oauth_authorization_status" NOT NULL,
    "authorization_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '00:03:00'::interval) NOT NULL,
    "approved_at" timestamp with time zone,
    "nonce" "text",
    CONSTRAINT "oauth_authorizations_authorization_code_length" CHECK (("char_length"("authorization_code") <= 255)),
    CONSTRAINT "oauth_authorizations_code_challenge_length" CHECK (("char_length"("code_challenge") <= 128)),
    CONSTRAINT "oauth_authorizations_expires_at_future" CHECK (("expires_at" > "created_at")),
    CONSTRAINT "oauth_authorizations_nonce_length" CHECK (("char_length"("nonce") <= 255)),
    CONSTRAINT "oauth_authorizations_redirect_uri_length" CHECK (("char_length"("redirect_uri") <= 2048)),
    CONSTRAINT "oauth_authorizations_resource_length" CHECK (("char_length"("resource") <= 2048)),
    CONSTRAINT "oauth_authorizations_scope_length" CHECK (("char_length"("scope") <= 4096)),
    CONSTRAINT "oauth_authorizations_state_length" CHECK (("char_length"("state") <= 4096))
);


ALTER TABLE "auth"."oauth_authorizations" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."oauth_clients" (
    "id" "uuid" NOT NULL,
    "client_secret_hash" "text",
    "registration_type" "auth"."oauth_registration_type" NOT NULL,
    "redirect_uris" "text" NOT NULL,
    "grant_types" "text" NOT NULL,
    "client_name" "text",
    "client_uri" "text",
    "logo_uri" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "client_type" "auth"."oauth_client_type" DEFAULT 'confidential'::"auth"."oauth_client_type" NOT NULL,
    CONSTRAINT "oauth_clients_client_name_length" CHECK (("char_length"("client_name") <= 1024)),
    CONSTRAINT "oauth_clients_client_uri_length" CHECK (("char_length"("client_uri") <= 2048)),
    CONSTRAINT "oauth_clients_logo_uri_length" CHECK (("char_length"("logo_uri") <= 2048))
);


ALTER TABLE "auth"."oauth_clients" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."oauth_consents" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "client_id" "uuid" NOT NULL,
    "scopes" "text" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_at" timestamp with time zone,
    CONSTRAINT "oauth_consents_revoked_after_granted" CHECK ((("revoked_at" IS NULL) OR ("revoked_at" >= "granted_at"))),
    CONSTRAINT "oauth_consents_scopes_length" CHECK (("char_length"("scopes") <= 2048)),
    CONSTRAINT "oauth_consents_scopes_not_empty" CHECK (("char_length"(TRIM(BOTH FROM "scopes")) > 0))
);


ALTER TABLE "auth"."oauth_consents" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."one_time_tokens" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_type" "auth"."one_time_token_type" NOT NULL,
    "token_hash" "text" NOT NULL,
    "relates_to" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "one_time_tokens_token_hash_check" CHECK (("char_length"("token_hash") > 0))
);


ALTER TABLE "auth"."one_time_tokens" OWNER TO "supabase_auth_admin";


CREATE TABLE IF NOT EXISTS "auth"."refresh_tokens" (
    "instance_id" "uuid",
    "id" bigint NOT NULL,
    "token" character varying(255),
    "user_id" character varying(255),
    "revoked" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "parent" character varying(255),
    "session_id" "uuid"
);


ALTER TABLE "auth"."refresh_tokens" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."refresh_tokens" IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';



CREATE SEQUENCE IF NOT EXISTS "auth"."refresh_tokens_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNER TO "supabase_auth_admin";


ALTER SEQUENCE "auth"."refresh_tokens_id_seq" OWNED BY "auth"."refresh_tokens"."id";



CREATE TABLE IF NOT EXISTS "auth"."saml_providers" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "entity_id" "text" NOT NULL,
    "metadata_xml" "text" NOT NULL,
    "metadata_url" "text",
    "attribute_mapping" "jsonb",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "name_id_format" "text",
    CONSTRAINT "entity_id not empty" CHECK (("char_length"("entity_id") > 0)),
    CONSTRAINT "metadata_url not empty" CHECK ((("metadata_url" = NULL::"text") OR ("char_length"("metadata_url") > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK (("char_length"("metadata_xml") > 0))
);


ALTER TABLE "auth"."saml_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_providers" IS 'Auth: Manages SAML Identity Provider connections.';



CREATE TABLE IF NOT EXISTS "auth"."saml_relay_states" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "request_id" "text" NOT NULL,
    "for_email" "text",
    "redirect_to" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "flow_state_id" "uuid",
    CONSTRAINT "request_id not empty" CHECK (("char_length"("request_id") > 0))
);


ALTER TABLE "auth"."saml_relay_states" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."saml_relay_states" IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';



CREATE TABLE IF NOT EXISTS "auth"."schema_migrations" (
    "version" character varying(255) NOT NULL
);


ALTER TABLE "auth"."schema_migrations" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."schema_migrations" IS 'Auth: Manages updates to the auth system.';



CREATE TABLE IF NOT EXISTS "auth"."sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "factor_id" "uuid",
    "aal" "auth"."aal_level",
    "not_after" timestamp with time zone,
    "refreshed_at" timestamp without time zone,
    "user_agent" "text",
    "ip" "inet",
    "tag" "text",
    "oauth_client_id" "uuid",
    "refresh_token_hmac_key" "text",
    "refresh_token_counter" bigint,
    "scopes" "text",
    CONSTRAINT "sessions_scopes_length" CHECK (("char_length"("scopes") <= 4096))
);


ALTER TABLE "auth"."sessions" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sessions" IS 'Auth: Stores session data associated to a user.';



COMMENT ON COLUMN "auth"."sessions"."not_after" IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';



COMMENT ON COLUMN "auth"."sessions"."refresh_token_hmac_key" IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';



COMMENT ON COLUMN "auth"."sessions"."refresh_token_counter" IS 'Holds the ID (counter) of the last issued refresh token.';



CREATE TABLE IF NOT EXISTS "auth"."sso_domains" (
    "id" "uuid" NOT NULL,
    "sso_provider_id" "uuid" NOT NULL,
    "domain" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK (("char_length"("domain") > 0))
);


ALTER TABLE "auth"."sso_domains" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_domains" IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';



CREATE TABLE IF NOT EXISTS "auth"."sso_providers" (
    "id" "uuid" NOT NULL,
    "resource_id" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "disabled" boolean,
    CONSTRAINT "resource_id not empty" CHECK ((("resource_id" = NULL::"text") OR ("char_length"("resource_id") > 0)))
);


ALTER TABLE "auth"."sso_providers" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."sso_providers" IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';



COMMENT ON COLUMN "auth"."sso_providers"."resource_id" IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';



CREATE TABLE IF NOT EXISTS "auth"."users" (
    "instance_id" "uuid",
    "id" "uuid" NOT NULL,
    "aud" character varying(255),
    "role" character varying(255),
    "email" character varying(255),
    "encrypted_password" character varying(255),
    "email_confirmed_at" timestamp with time zone,
    "invited_at" timestamp with time zone,
    "confirmation_token" character varying(255),
    "confirmation_sent_at" timestamp with time zone,
    "recovery_token" character varying(255),
    "recovery_sent_at" timestamp with time zone,
    "email_change_token_new" character varying(255),
    "email_change" character varying(255),
    "email_change_sent_at" timestamp with time zone,
    "last_sign_in_at" timestamp with time zone,
    "raw_app_meta_data" "jsonb",
    "raw_user_meta_data" "jsonb",
    "is_super_admin" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "phone" "text" DEFAULT NULL::character varying,
    "phone_confirmed_at" timestamp with time zone,
    "phone_change" "text" DEFAULT ''::character varying,
    "phone_change_token" character varying(255) DEFAULT ''::character varying,
    "phone_change_sent_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone GENERATED ALWAYS AS (LEAST("email_confirmed_at", "phone_confirmed_at")) STORED,
    "email_change_token_current" character varying(255) DEFAULT ''::character varying,
    "email_change_confirm_status" smallint DEFAULT 0,
    "banned_until" timestamp with time zone,
    "reauthentication_token" character varying(255) DEFAULT ''::character varying,
    "reauthentication_sent_at" timestamp with time zone,
    "is_sso_user" boolean DEFAULT false NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_anonymous" boolean DEFAULT false NOT NULL,
    CONSTRAINT "users_email_change_confirm_status_check" CHECK ((("email_change_confirm_status" >= 0) AND ("email_change_confirm_status" <= 2)))
);


ALTER TABLE "auth"."users" OWNER TO "supabase_auth_admin";


COMMENT ON TABLE "auth"."users" IS 'Auth: Stores user login data within a secure schema.';



COMMENT ON COLUMN "auth"."users"."is_sso_user" IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';



CREATE TABLE IF NOT EXISTS "hr"."employee_history" (
    "id" bigint NOT NULL,
    "employee_id" bigint NOT NULL,
    "valid_from" "date" NOT NULL,
    "valid_to" "date",
    "job_role_id" bigint,
    "grade_id" bigint,
    "hourly_cost" numeric,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hr"."employee_history" OWNER TO "postgres";


ALTER TABLE "hr"."employee_history" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "hr"."employee_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "kaiten"."boards" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "space_id" bigint,
    "title" "text" NOT NULL,
    "description" "text",
    "board_type" "text",
    "archived" boolean DEFAULT false,
    "sort_order" double precision,
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "kaiten"."boards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."card_members" (
    "card_id" bigint NOT NULL,
    "user_id" bigint NOT NULL
);


ALTER TABLE "kaiten"."card_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."card_tags" (
    "card_id" bigint NOT NULL,
    "tag_id" bigint NOT NULL
);


ALTER TABLE "kaiten"."card_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."card_types" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "name" "text" NOT NULL,
    "icon_url" "text",
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb",
    "payload_hash" "text"
);


ALTER TABLE "kaiten"."card_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."cards" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "space_id" bigint,
    "board_id" bigint,
    "column_id" bigint,
    "lane_id" bigint,
    "type_id" bigint,
    "owner_id" bigint,
    "creator_id" bigint,
    "state" integer,
    "archived" boolean DEFAULT false,
    "blocked" boolean DEFAULT false,
    "size_text" "text",
    "due_date" timestamp with time zone,
    "time_spent_sum" double precision DEFAULT 0,
    "time_blocked_sum" double precision DEFAULT 0,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "properties" "jsonb" DEFAULT '{}'::"jsonb",
    "tags_cache" "jsonb" DEFAULT '[]'::"jsonb",
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb",
    "estimate_workload" double precision DEFAULT 0,
    "parents_ids" bigint[] DEFAULT '{}'::bigint[],
    "children_ids" bigint[] DEFAULT '{}'::bigint[],
    "members_ids" bigint[] DEFAULT '{}'::bigint[],
    "members_data" "jsonb" DEFAULT '[]'::"jsonb",
    "external_id" "text"
);


ALTER TABLE "kaiten"."cards" OWNER TO "postgres";


COMMENT ON COLUMN "kaiten"."cards"."estimate_workload" IS 'Оценка трудозатрат в часах (может быть дробным числом)';



CREATE TABLE IF NOT EXISTS "kaiten"."columns" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "board_id" bigint,
    "title" "text",
    "column_type" integer,
    "sort_order" double precision,
    "wip_limit" integer,
    "archived" boolean DEFAULT false,
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "kaiten"."columns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."lanes" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "board_id" bigint,
    "title" "text",
    "sort_order" double precision,
    "archived" boolean DEFAULT false,
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "kaiten"."lanes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."property_definitions" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "name" "text" NOT NULL,
    "field_type" "text",
    "select_options" "jsonb",
    "kaiten_created_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb",
    "kaiten_updated_at" timestamp with time zone,
    "payload_hash" "text"
);


ALTER TABLE "kaiten"."property_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."roles" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "name" "text" NOT NULL,
    "company_id" bigint,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb",
    "payload_hash" "text"
);


ALTER TABLE "kaiten"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."space_members" (
    "id" bigint NOT NULL,
    "space_id" bigint NOT NULL,
    "user_id" bigint NOT NULL,
    "role_id" "uuid",
    "is_from_group" boolean DEFAULT false,
    "group_id" bigint,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_inactive" boolean DEFAULT false
);


ALTER TABLE "kaiten"."space_members" OWNER TO "postgres";


COMMENT ON TABLE "kaiten"."space_members" IS 'Участники spaces с их ролями. Один пользователь может иметь несколько ролей в одном space.';



COMMENT ON COLUMN "kaiten"."space_members"."role_id" IS 'UUID роли доступа. NULL для деактивированных пользователей.';



COMMENT ON COLUMN "kaiten"."space_members"."is_inactive" IS 'true если пользователь деактивирован в компании, но был участником space.';



ALTER TABLE "kaiten"."space_members" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "kaiten"."space_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "kaiten"."spaces" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "title" "text" NOT NULL,
    "company_id" bigint,
    "owner_user_id" bigint,
    "archived" boolean DEFAULT false,
    "sort_order" double precision,
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "kaiten"."spaces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."tags" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "name" "text" NOT NULL,
    "color" "text",
    "group_name" "text",
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb",
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "payload_hash" "text"
);


ALTER TABLE "kaiten"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."time_logs" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "card_id" bigint,
    "user_id" bigint,
    "time_spent_minutes" integer DEFAULT 0 NOT NULL,
    "date" "date",
    "comment" "text",
    "role_id" bigint,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "kaiten"."time_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "kaiten"."tree_entity_roles" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "permissions" "jsonb" DEFAULT '{}'::"jsonb",
    "sort_order" double precision,
    "company_uid" "uuid",
    "is_locked" boolean DEFAULT false,
    "new_permissions_default_value" boolean,
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "kaiten"."tree_entity_roles" OWNER TO "postgres";


COMMENT ON TABLE "kaiten"."tree_entity_roles" IS 'Каталог ролей доступа из Kaiten (tree-entity-roles). Определяет права участников в spaces.';



CREATE TABLE IF NOT EXISTS "kaiten"."users" (
    "id" bigint NOT NULL,
    "uid" "uuid",
    "full_name" "text",
    "email" "text",
    "username" "text",
    "timezone" "text",
    "role" integer,
    "is_admin" boolean DEFAULT false,
    "take_licence" boolean,
    "apps_permissions" integer,
    "locked" boolean,
    "last_request_date" timestamp with time zone,
    "kaiten_created_at" timestamp with time zone,
    "kaiten_updated_at" timestamp with time zone,
    "synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payload_hash" "text",
    "raw_payload" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "kaiten"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "kaiten"."v_space_members_detailed" AS
 SELECT "sm"."id",
    "sm"."space_id",
    "s"."title" AS "space_title",
    "sm"."user_id",
    "u"."full_name" AS "user_name",
    "u"."email" AS "user_email",
    "sm"."role_id",
    COALESCE("r"."name", 'Неактивен'::"text") AS "role_name",
    "sm"."is_from_group",
    "sm"."group_id",
    "sm"."is_inactive",
        CASE
            WHEN ("r"."company_uid" IS NOT NULL) THEN true
            WHEN ("sm"."role_id" IS NULL) THEN false
            ELSE false
        END AS "is_custom_role",
    "sm"."synced_at"
   FROM ((("kaiten"."space_members" "sm"
     LEFT JOIN "kaiten"."spaces" "s" ON (("s"."id" = "sm"."space_id")))
     LEFT JOIN "kaiten"."users" "u" ON (("u"."id" = "sm"."user_id")))
     LEFT JOIN "kaiten"."tree_entity_roles" "r" ON (("r"."id" = "sm"."role_id")));


ALTER VIEW "kaiten"."v_space_members_detailed" OWNER TO "postgres";


CREATE OR REPLACE VIEW "kaiten"."v_user_roles_summary" AS
 SELECT "u"."id" AS "user_id",
    "u"."full_name",
    "u"."email",
    "count"(DISTINCT "sm"."space_id") AS "spaces_count",
    "count"(DISTINCT "sm"."role_id") FILTER (WHERE ("sm"."role_id" IS NOT NULL)) AS "unique_roles_count",
    "array_agg"(DISTINCT COALESCE("r"."name", 'Неактивен'::"text")) AS "role_names",
    "array_agg"(DISTINCT "s"."title") AS "space_titles",
    "bool_or"("sm"."is_inactive") AS "has_inactive_membership"
   FROM ((("kaiten"."users" "u"
     LEFT JOIN "kaiten"."space_members" "sm" ON (("sm"."user_id" = "u"."id")))
     LEFT JOIN "kaiten"."tree_entity_roles" "r" ON (("r"."id" = "sm"."role_id")))
     LEFT JOIN "kaiten"."spaces" "s" ON (("s"."id" = "sm"."space_id")))
  GROUP BY "u"."id", "u"."full_name", "u"."email";


ALTER VIEW "kaiten"."v_user_roles_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ops"."clients" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "contact_info" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "ops"."clients" OWNER TO "postgres";


ALTER TABLE "ops"."clients" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "ops"."clients_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "ops"."employees" (
    "id" bigint NOT NULL,
    "kaiten_user_id" bigint,
    "full_name" "text" NOT NULL,
    "role" "text",
    "hourly_cost" numeric DEFAULT 0,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "job_role_id" bigint,
    "grade_id" bigint,
    "kaiten_role_id" bigint
);


ALTER TABLE "ops"."employees" OWNER TO "postgres";


ALTER TABLE "ops"."employees" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "ops"."employees_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "ops"."project_tag_mapping" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "kaiten_tag_id" bigint NOT NULL,
    "kaiten_tag_name" "text"
);


ALTER TABLE "ops"."project_tag_mapping" OWNER TO "postgres";


ALTER TABLE "ops"."project_tag_mapping" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "ops"."project_tag_mapping_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "ops"."projects" (
    "id" bigint NOT NULL,
    "client_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "default_rate" numeric DEFAULT 0 NOT NULL,
    "kaiten_space_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "ops"."projects" OWNER TO "postgres";


ALTER TABLE "ops"."projects" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "ops"."projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "ops"."task_assignments" (
    "id" bigint NOT NULL,
    "task_id" bigint NOT NULL,
    "employee_id" bigint NOT NULL,
    "role_type" integer,
    "is_responsible" boolean GENERATED ALWAYS AS (("role_type" = 2)) STORED,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "ops"."task_assignments" OWNER TO "postgres";


ALTER TABLE "ops"."task_assignments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "ops"."task_assignments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "ops"."tasks" (
    "id" bigint NOT NULL,
    "kaiten_card_id" bigint NOT NULL,
    "project_id" bigint,
    "assignee_id" bigint,
    "status" "text" NOT NULL,
    "title" "text" NOT NULL,
    "estimate_hours" numeric DEFAULT 0,
    "time_spent_sum" numeric DEFAULT 0 NOT NULL,
    "completed_at" timestamp with time zone,
    "raw_synced_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "owner_id" bigint,
    "all_members_ids" bigint[] DEFAULT '{}'::bigint[],
    "parent_task_id" bigint,
    "children_task_ids" bigint[] DEFAULT '{}'::bigint[],
    "external_id" "text",
    "tags" "jsonb" DEFAULT '[]'::"jsonb"
);


ALTER TABLE "ops"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ops"."test_ai_table" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "note" "text",
    "test" integer
);


ALTER TABLE "ops"."test_ai_table" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "ops"."test_ai_table_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "ops"."test_ai_table_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "ops"."test_ai_table_id_seq" OWNED BY "ops"."test_ai_table"."id";



CREATE TABLE IF NOT EXISTS "public"."sync_logs" (
    "id" integer NOT NULL,
    "entity_type" "text" NOT NULL,
    "sync_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "records_processed" integer,
    "records_created" integer,
    "records_updated" integer,
    "records_skipped" integer,
    "error_message" "text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "duration_ms" integer,
    "metadata" "jsonb"
);


ALTER TABLE "public"."sync_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sync_logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sync_logs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sync_logs_id_seq" OWNED BY "public"."sync_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."sync_metadata" (
    "entity_type" "text" NOT NULL,
    "last_full_sync_at" timestamp with time zone,
    "last_incremental_sync_at" timestamp with time zone,
    "last_synced_id" integer,
    "total_records" integer DEFAULT 0,
    "status" "text" DEFAULT 'idle'::"text",
    "error_message" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sync_metadata" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ref"."grades" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "level" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "ref"."grades" OWNER TO "postgres";


ALTER TABLE "ref"."grades" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "ref"."grades_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "ref"."job_roles" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "ref"."job_roles" OWNER TO "postgres";


ALTER TABLE "ref"."job_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "ref"."job_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "auth"."refresh_tokens" ALTER COLUMN "id" SET DEFAULT "nextval"('"auth"."refresh_tokens_id_seq"'::"regclass");



ALTER TABLE ONLY "ops"."test_ai_table" ALTER COLUMN "id" SET DEFAULT "nextval"('"ops"."test_ai_table_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sync_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sync_logs_id_seq"'::"regclass");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "amr_id_pk" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."audit_log_entries"
    ADD CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."flow_state"
    ADD CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_provider_id_provider_unique" UNIQUE ("provider_id", "provider");



ALTER TABLE ONLY "auth"."instances"
    ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_authentication_method_pkey" UNIQUE ("session_id", "authentication_method");



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_last_challenged_at_key" UNIQUE ("last_challenged_at");



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_authorization_code_key" UNIQUE ("authorization_code");



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_authorization_id_key" UNIQUE ("authorization_id");



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_clients"
    ADD CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_user_client_unique" UNIQUE ("user_id", "client_id");



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE ("token");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_entity_id_key" UNIQUE ("entity_id");



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."sso_providers"
    ADD CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "auth"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hr"."employee_history"
    ADD CONSTRAINT "employee_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."boards"
    ADD CONSTRAINT "boards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."card_members"
    ADD CONSTRAINT "card_members_pkey" PRIMARY KEY ("card_id", "user_id");



ALTER TABLE ONLY "kaiten"."card_tags"
    ADD CONSTRAINT "card_tags_pkey" PRIMARY KEY ("card_id", "tag_id");



ALTER TABLE ONLY "kaiten"."card_types"
    ADD CONSTRAINT "card_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."cards"
    ADD CONSTRAINT "cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."columns"
    ADD CONSTRAINT "columns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."lanes"
    ADD CONSTRAINT "lanes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."property_definitions"
    ADD CONSTRAINT "property_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."space_members"
    ADD CONSTRAINT "space_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."spaces"
    ADD CONSTRAINT "spaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."time_logs"
    ADD CONSTRAINT "time_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."tree_entity_roles"
    ADD CONSTRAINT "tree_entity_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "kaiten"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ops"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ops"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ops"."project_tag_mapping"
    ADD CONSTRAINT "project_tag_mapping_kaiten_tag_id_key" UNIQUE ("kaiten_tag_id");



ALTER TABLE ONLY "ops"."project_tag_mapping"
    ADD CONSTRAINT "project_tag_mapping_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ops"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ops"."task_assignments"
    ADD CONSTRAINT "task_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ops"."task_assignments"
    ADD CONSTRAINT "task_assignments_task_id_employee_id_key" UNIQUE ("task_id", "employee_id");



ALTER TABLE ONLY "ops"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ops"."test_ai_table"
    ADD CONSTRAINT "test_ai_table_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_logs"
    ADD CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sync_metadata"
    ADD CONSTRAINT "sync_metadata_pkey" PRIMARY KEY ("entity_type");



ALTER TABLE ONLY "ref"."grades"
    ADD CONSTRAINT "grades_name_key" UNIQUE ("name");



ALTER TABLE ONLY "ref"."grades"
    ADD CONSTRAINT "grades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ref"."job_roles"
    ADD CONSTRAINT "job_roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "ref"."job_roles"
    ADD CONSTRAINT "job_roles_pkey" PRIMARY KEY ("id");



CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries" USING "btree" ("instance_id");



CREATE UNIQUE INDEX "confirmation_token_idx" ON "auth"."users" USING "btree" ("confirmation_token") WHERE (("confirmation_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_current_idx" ON "auth"."users" USING "btree" ("email_change_token_current") WHERE (("email_change_token_current")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "email_change_token_new_idx" ON "auth"."users" USING "btree" ("email_change_token_new") WHERE (("email_change_token_new")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors" USING "btree" ("user_id", "created_at");



CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state" USING "btree" ("created_at" DESC);



CREATE INDEX "identities_email_idx" ON "auth"."identities" USING "btree" ("email" "text_pattern_ops");



COMMENT ON INDEX "auth"."identities_email_idx" IS 'Auth: Ensures indexed queries on the email column';



CREATE INDEX "identities_user_id_idx" ON "auth"."identities" USING "btree" ("user_id");



CREATE INDEX "idx_auth_code" ON "auth"."flow_state" USING "btree" ("auth_code");



CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state" USING "btree" ("user_id", "authentication_method");



CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "mfa_factors_user_friendly_name_unique" ON "auth"."mfa_factors" USING "btree" ("friendly_name", "user_id") WHERE (TRIM(BOTH FROM "friendly_name") <> ''::"text");



CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors" USING "btree" ("user_id");



CREATE INDEX "oauth_auth_pending_exp_idx" ON "auth"."oauth_authorizations" USING "btree" ("expires_at") WHERE ("status" = 'pending'::"auth"."oauth_authorization_status");



CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" USING "btree" ("deleted_at");



CREATE INDEX "oauth_consents_active_client_idx" ON "auth"."oauth_consents" USING "btree" ("client_id") WHERE ("revoked_at" IS NULL);



CREATE INDEX "oauth_consents_active_user_client_idx" ON "auth"."oauth_consents" USING "btree" ("user_id", "client_id") WHERE ("revoked_at" IS NULL);



CREATE INDEX "oauth_consents_user_order_idx" ON "auth"."oauth_consents" USING "btree" ("user_id", "granted_at" DESC);



CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("relates_to");



CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING "hash" ("token_hash");



CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens" USING "btree" ("user_id", "token_type");



CREATE UNIQUE INDEX "reauthentication_token_idx" ON "auth"."users" USING "btree" ("reauthentication_token") WHERE (("reauthentication_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE UNIQUE INDEX "recovery_token_idx" ON "auth"."users" USING "btree" ("recovery_token") WHERE (("recovery_token")::"text" !~ '^[0-9 ]*$'::"text");



CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id");



CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens" USING "btree" ("instance_id", "user_id");



CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens" USING "btree" ("parent");



CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens" USING "btree" ("session_id", "revoked");



CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens" USING "btree" ("updated_at" DESC);



CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers" USING "btree" ("sso_provider_id");



CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states" USING "btree" ("created_at" DESC);



CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states" USING "btree" ("for_email");



CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states" USING "btree" ("sso_provider_id");



CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions" USING "btree" ("not_after" DESC);



CREATE INDEX "sessions_oauth_client_id_idx" ON "auth"."sessions" USING "btree" ("oauth_client_id");



CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions" USING "btree" ("user_id");



CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING "btree" ("lower"("domain"));



CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains" USING "btree" ("sso_provider_id");



CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING "btree" ("lower"("resource_id"));



CREATE INDEX "sso_providers_resource_id_pattern_idx" ON "auth"."sso_providers" USING "btree" ("resource_id" "text_pattern_ops");



CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors" USING "btree" ("user_id", "phone");



CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions" USING "btree" ("user_id", "created_at");



CREATE UNIQUE INDEX "users_email_partial_key" ON "auth"."users" USING "btree" ("email") WHERE ("is_sso_user" = false);



COMMENT ON INDEX "auth"."users_email_partial_key" IS 'Auth: A partial unique index that applies only when is_sso_user is false';



CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING "btree" ("instance_id", "lower"(("email")::"text"));



CREATE INDEX "users_instance_id_idx" ON "auth"."users" USING "btree" ("instance_id");



CREATE INDEX "users_is_anonymous_idx" ON "auth"."users" USING "btree" ("is_anonymous");



CREATE INDEX "idx_hr_history_employee" ON "hr"."employee_history" USING "btree" ("employee_id");



CREATE INDEX "idx_card_members_card_id" ON "kaiten"."card_members" USING "btree" ("card_id");



CREATE INDEX "idx_card_members_user_id" ON "kaiten"."card_members" USING "btree" ("user_id");



CREATE INDEX "idx_kaiten_boards_space" ON "kaiten"."boards" USING "btree" ("space_id");



CREATE INDEX "idx_kaiten_cards_board" ON "kaiten"."cards" USING "btree" ("board_id");



CREATE INDEX "idx_kaiten_cards_completed_at" ON "kaiten"."cards" USING "btree" ("completed_at");



CREATE INDEX "idx_kaiten_cards_owner" ON "kaiten"."cards" USING "btree" ("owner_id");



CREATE INDEX "idx_kaiten_cards_properties" ON "kaiten"."cards" USING "gin" ("properties");



CREATE INDEX "idx_kaiten_columns_board" ON "kaiten"."columns" USING "btree" ("board_id");



CREATE INDEX "idx_kaiten_lanes_board" ON "kaiten"."lanes" USING "btree" ("board_id");



CREATE INDEX "idx_kaiten_users_email" ON "kaiten"."users" USING "btree" ("email");



CREATE INDEX "idx_space_members_role" ON "kaiten"."space_members" USING "btree" ("role_id");



CREATE INDEX "idx_space_members_space" ON "kaiten"."space_members" USING "btree" ("space_id");



CREATE INDEX "idx_space_members_space_user" ON "kaiten"."space_members" USING "btree" ("space_id", "user_id");



CREATE INDEX "idx_space_members_user" ON "kaiten"."space_members" USING "btree" ("user_id");



CREATE INDEX "idx_tree_entity_roles_company" ON "kaiten"."tree_entity_roles" USING "btree" ("company_uid") WHERE ("company_uid" IS NOT NULL);



CREATE INDEX "idx_tree_entity_roles_name" ON "kaiten"."tree_entity_roles" USING "btree" ("name");



CREATE UNIQUE INDEX "space_members_unique_idx" ON "kaiten"."space_members" USING "btree" ("space_id", "user_id", COALESCE("role_id", '00000000-0000-0000-0000-000000000000'::"uuid"), "is_from_group");



CREATE INDEX "idx_mapping_tag_id" ON "ops"."project_tag_mapping" USING "btree" ("kaiten_tag_id");



CREATE INDEX "idx_ops_tasks_external" ON "ops"."tasks" USING "btree" ("external_id");



CREATE INDEX "idx_ops_tasks_members" ON "ops"."tasks" USING "gin" ("all_members_ids");



CREATE INDEX "idx_ops_tasks_parent" ON "ops"."tasks" USING "btree" ("parent_task_id");



CREATE INDEX "idx_task_assignments_employee" ON "ops"."task_assignments" USING "btree" ("employee_id");



CREATE INDEX "idx_sync_logs_entity_type" ON "public"."sync_logs" USING "btree" ("entity_type");



CREATE INDEX "idx_sync_logs_started_at" ON "public"."sync_logs" USING "btree" ("started_at" DESC);



CREATE INDEX "idx_sync_logs_status" ON "public"."sync_logs" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "trg_sync_kaiten_to_ops" AFTER INSERT OR UPDATE ON "kaiten"."cards" FOR EACH ROW EXECUTE FUNCTION "ops"."sync_task_from_kaiten_card"();



CREATE OR REPLACE TRIGGER "trigger_fill_card_space_id" BEFORE INSERT OR UPDATE ON "kaiten"."cards" FOR EACH ROW EXECUTE FUNCTION "kaiten"."fill_card_space_id"();



CREATE OR REPLACE TRIGGER "sync_metadata_updated_at" BEFORE UPDATE ON "public"."sync_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_sync_metadata_updated_at"();



CREATE OR REPLACE TRIGGER "update_sync_metadata_updated_at" BEFORE UPDATE ON "public"."sync_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "auth"."identities"
    ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_amr_claims"
    ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_challenges"
    ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."mfa_factors"
    ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_authorizations"
    ADD CONSTRAINT "oauth_authorizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."oauth_consents"
    ADD CONSTRAINT "oauth_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."one_time_tokens"
    ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."refresh_tokens"
    ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_providers"
    ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."saml_relay_states"
    ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_oauth_client_id_fkey" FOREIGN KEY ("oauth_client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sessions"
    ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "auth"."sso_domains"
    ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hr"."employee_history"
    ADD CONSTRAINT "employee_history_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "ops"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hr"."employee_history"
    ADD CONSTRAINT "employee_history_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "ref"."grades"("id");



ALTER TABLE ONLY "hr"."employee_history"
    ADD CONSTRAINT "employee_history_job_role_id_fkey" FOREIGN KEY ("job_role_id") REFERENCES "ref"."job_roles"("id");



ALTER TABLE ONLY "kaiten"."boards"
    ADD CONSTRAINT "boards_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "kaiten"."spaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "kaiten"."card_tags"
    ADD CONSTRAINT "card_tags_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "kaiten"."cards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "kaiten"."columns"
    ADD CONSTRAINT "columns_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "kaiten"."boards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "kaiten"."lanes"
    ADD CONSTRAINT "lanes_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "kaiten"."boards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "kaiten"."spaces"
    ADD CONSTRAINT "spaces_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "kaiten"."users"("id");



ALTER TABLE ONLY "ops"."employees"
    ADD CONSTRAINT "employees_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "ref"."grades"("id");



ALTER TABLE ONLY "ops"."employees"
    ADD CONSTRAINT "employees_job_role_id_fkey" FOREIGN KEY ("job_role_id") REFERENCES "ref"."job_roles"("id");



ALTER TABLE ONLY "ops"."employees"
    ADD CONSTRAINT "employees_kaiten_role_id_fkey" FOREIGN KEY ("kaiten_role_id") REFERENCES "kaiten"."roles"("id");



ALTER TABLE ONLY "ops"."employees"
    ADD CONSTRAINT "employees_kaiten_user_id_fkey" FOREIGN KEY ("kaiten_user_id") REFERENCES "kaiten"."users"("id");



ALTER TABLE ONLY "ops"."project_tag_mapping"
    ADD CONSTRAINT "project_tag_mapping_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "ops"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ops"."projects"
    ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "ops"."clients"("id");



ALTER TABLE ONLY "ops"."projects"
    ADD CONSTRAINT "projects_kaiten_space_id_fkey" FOREIGN KEY ("kaiten_space_id") REFERENCES "kaiten"."spaces"("id");



ALTER TABLE ONLY "ops"."task_assignments"
    ADD CONSTRAINT "task_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "ops"."employees"("id");



ALTER TABLE ONLY "ops"."task_assignments"
    ADD CONSTRAINT "task_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "ops"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ops"."tasks"
    ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "ops"."employees"("id");



ALTER TABLE ONLY "ops"."tasks"
    ADD CONSTRAINT "tasks_kaiten_card_id_fkey" FOREIGN KEY ("kaiten_card_id") REFERENCES "kaiten"."cards"("id");



ALTER TABLE ONLY "ops"."tasks"
    ADD CONSTRAINT "tasks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "ops"."employees"("id");



ALTER TABLE ONLY "ops"."tasks"
    ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "ops"."projects"("id");



ALTER TABLE "auth"."audit_log_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."flow_state" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."identities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."instances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_amr_claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_challenges" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."mfa_factors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."one_time_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."refresh_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."saml_relay_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."schema_migrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_domains" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."sso_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "auth"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Read history" ON "hr"."employee_history" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "hr"."employee_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."boards" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."card_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."cards" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."columns" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."lanes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."property_definitions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."spaces" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."tags" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."time_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "kaiten"."users" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "kaiten"."boards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."card_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."card_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."card_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."columns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."lanes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."property_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."spaces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."time_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "kaiten"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow authenticated users to delete test_ai_table" ON "ops"."test_ai_table" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert test_ai_table" ON "ops"."test_ai_table" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read test_ai_table" ON "ops"."test_ai_table" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update test_ai_table" ON "ops"."test_ai_table" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable access to all users" ON "ops"."project_tag_mapping" USING (true);



ALTER TABLE "ops"."project_tag_mapping" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ops"."test_ai_table" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow read access for authenticated users" ON "public"."sync_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "public"."sync_metadata" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."sync_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sync_metadata" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Read grades" ON "ref"."grades" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Read ref" ON "ref"."job_roles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "ref"."grades" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ref"."job_roles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "auth" TO "anon";
GRANT USAGE ON SCHEMA "auth" TO "authenticated";
GRANT USAGE ON SCHEMA "auth" TO "service_role";
GRANT ALL ON SCHEMA "auth" TO "supabase_auth_admin";
GRANT ALL ON SCHEMA "auth" TO "dashboard_user";
GRANT USAGE ON SCHEMA "auth" TO "postgres";



GRANT USAGE ON SCHEMA "hr" TO "authenticated";
GRANT USAGE ON SCHEMA "hr" TO "service_role";



GRANT USAGE ON SCHEMA "kaiten" TO "anon";
GRANT USAGE ON SCHEMA "kaiten" TO "authenticated";
GRANT USAGE ON SCHEMA "kaiten" TO "service_role";



GRANT USAGE ON SCHEMA "ops" TO "authenticated";
GRANT USAGE ON SCHEMA "ops" TO "anon";
GRANT USAGE ON SCHEMA "ops" TO "service_role";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "ref" TO "authenticated";
GRANT USAGE ON SCHEMA "ref" TO "service_role";



GRANT ALL ON FUNCTION "auth"."email"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."jwt"() TO "postgres";
GRANT ALL ON FUNCTION "auth"."jwt"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."role"() TO "dashboard_user";



GRANT ALL ON FUNCTION "auth"."uid"() TO "dashboard_user";



GRANT ALL ON FUNCTION "kaiten"."fill_card_space_id"() TO "anon";
GRANT ALL ON FUNCTION "kaiten"."fill_card_space_id"() TO "authenticated";
GRANT ALL ON FUNCTION "kaiten"."fill_card_space_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."list_tables"() TO "anon";
GRANT ALL ON FUNCTION "public"."list_tables"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_tables"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_employee_kaiten_roles"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_employee_kaiten_roles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_employee_kaiten_roles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sync_metadata_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_sync_metadata_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sync_metadata_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "auth"."audit_log_entries" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."audit_log_entries" TO "postgres";
GRANT SELECT ON TABLE "auth"."audit_log_entries" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."flow_state" TO "postgres";
GRANT SELECT ON TABLE "auth"."flow_state" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."flow_state" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."identities" TO "postgres";
GRANT SELECT ON TABLE "auth"."identities" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."identities" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."instances" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."instances" TO "postgres";
GRANT SELECT ON TABLE "auth"."instances" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_amr_claims" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_amr_claims" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_amr_claims" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_challenges" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_challenges" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_challenges" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."mfa_factors" TO "postgres";
GRANT SELECT ON TABLE "auth"."mfa_factors" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."mfa_factors" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_authorizations" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_authorizations" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_clients" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_clients" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."oauth_consents" TO "postgres";
GRANT ALL ON TABLE "auth"."oauth_consents" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."one_time_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."one_time_tokens" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."one_time_tokens" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."refresh_tokens" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."refresh_tokens" TO "postgres";
GRANT SELECT ON TABLE "auth"."refresh_tokens" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "dashboard_user";
GRANT ALL ON SEQUENCE "auth"."refresh_tokens_id_seq" TO "postgres";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_providers" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."saml_relay_states" TO "postgres";
GRANT SELECT ON TABLE "auth"."saml_relay_states" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."saml_relay_states" TO "dashboard_user";



GRANT SELECT ON TABLE "auth"."schema_migrations" TO "postgres" WITH GRANT OPTION;



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sessions" TO "postgres";
GRANT SELECT ON TABLE "auth"."sessions" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sessions" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_domains" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_domains" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_domains" TO "dashboard_user";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."sso_providers" TO "postgres";
GRANT SELECT ON TABLE "auth"."sso_providers" TO "postgres" WITH GRANT OPTION;
GRANT ALL ON TABLE "auth"."sso_providers" TO "dashboard_user";



GRANT ALL ON TABLE "auth"."users" TO "dashboard_user";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "auth"."users" TO "postgres";
GRANT SELECT ON TABLE "auth"."users" TO "postgres" WITH GRANT OPTION;



GRANT ALL ON TABLE "hr"."employee_history" TO "service_role";
GRANT SELECT ON TABLE "hr"."employee_history" TO "authenticated";



GRANT ALL ON TABLE "kaiten"."boards" TO "anon";
GRANT ALL ON TABLE "kaiten"."boards" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."boards" TO "service_role";



GRANT ALL ON TABLE "kaiten"."card_members" TO "anon";
GRANT ALL ON TABLE "kaiten"."card_members" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."card_members" TO "service_role";



GRANT ALL ON TABLE "kaiten"."card_tags" TO "anon";
GRANT ALL ON TABLE "kaiten"."card_tags" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."card_tags" TO "service_role";



GRANT ALL ON TABLE "kaiten"."card_types" TO "anon";
GRANT ALL ON TABLE "kaiten"."card_types" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."card_types" TO "service_role";



GRANT ALL ON TABLE "kaiten"."cards" TO "anon";
GRANT ALL ON TABLE "kaiten"."cards" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."cards" TO "service_role";



GRANT ALL ON TABLE "kaiten"."columns" TO "anon";
GRANT ALL ON TABLE "kaiten"."columns" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."columns" TO "service_role";



GRANT ALL ON TABLE "kaiten"."lanes" TO "anon";
GRANT ALL ON TABLE "kaiten"."lanes" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."lanes" TO "service_role";



GRANT ALL ON TABLE "kaiten"."property_definitions" TO "anon";
GRANT ALL ON TABLE "kaiten"."property_definitions" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."property_definitions" TO "service_role";



GRANT ALL ON TABLE "kaiten"."roles" TO "anon";
GRANT ALL ON TABLE "kaiten"."roles" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."roles" TO "service_role";



GRANT ALL ON TABLE "kaiten"."space_members" TO "anon";
GRANT ALL ON TABLE "kaiten"."space_members" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."space_members" TO "service_role";



GRANT ALL ON SEQUENCE "kaiten"."space_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "kaiten"."space_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "kaiten"."space_members_id_seq" TO "service_role";



GRANT ALL ON TABLE "kaiten"."spaces" TO "anon";
GRANT ALL ON TABLE "kaiten"."spaces" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."spaces" TO "service_role";



GRANT ALL ON TABLE "kaiten"."tags" TO "anon";
GRANT ALL ON TABLE "kaiten"."tags" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."tags" TO "service_role";



GRANT ALL ON TABLE "kaiten"."time_logs" TO "anon";
GRANT ALL ON TABLE "kaiten"."time_logs" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."time_logs" TO "service_role";



GRANT ALL ON TABLE "kaiten"."tree_entity_roles" TO "anon";
GRANT ALL ON TABLE "kaiten"."tree_entity_roles" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."tree_entity_roles" TO "service_role";



GRANT ALL ON TABLE "kaiten"."users" TO "anon";
GRANT ALL ON TABLE "kaiten"."users" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."users" TO "service_role";



GRANT ALL ON TABLE "kaiten"."v_space_members_detailed" TO "anon";
GRANT ALL ON TABLE "kaiten"."v_space_members_detailed" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."v_space_members_detailed" TO "service_role";



GRANT ALL ON TABLE "kaiten"."v_user_roles_summary" TO "anon";
GRANT ALL ON TABLE "kaiten"."v_user_roles_summary" TO "authenticated";
GRANT ALL ON TABLE "kaiten"."v_user_roles_summary" TO "service_role";



GRANT ALL ON TABLE "ops"."clients" TO "service_role";
GRANT SELECT ON TABLE "ops"."clients" TO "authenticated";



GRANT ALL ON SEQUENCE "ops"."clients_id_seq" TO "service_role";



GRANT ALL ON TABLE "ops"."employees" TO "service_role";
GRANT SELECT ON TABLE "ops"."employees" TO "authenticated";



GRANT ALL ON SEQUENCE "ops"."employees_id_seq" TO "service_role";



GRANT ALL ON TABLE "ops"."project_tag_mapping" TO "service_role";



GRANT ALL ON SEQUENCE "ops"."project_tag_mapping_id_seq" TO "service_role";



GRANT ALL ON TABLE "ops"."projects" TO "service_role";
GRANT SELECT ON TABLE "ops"."projects" TO "authenticated";



GRANT ALL ON SEQUENCE "ops"."projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "ops"."task_assignments" TO "service_role";



GRANT ALL ON SEQUENCE "ops"."task_assignments_id_seq" TO "service_role";



GRANT ALL ON TABLE "ops"."tasks" TO "service_role";
GRANT SELECT ON TABLE "ops"."tasks" TO "authenticated";



GRANT ALL ON TABLE "public"."sync_logs" TO "anon";
GRANT ALL ON TABLE "public"."sync_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_logs" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sync_logs_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sync_logs_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sync_logs_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sync_metadata" TO "anon";
GRANT ALL ON TABLE "public"."sync_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."sync_metadata" TO "service_role";



GRANT ALL ON TABLE "ref"."grades" TO "service_role";
GRANT SELECT ON TABLE "ref"."grades" TO "authenticated";



GRANT ALL ON TABLE "ref"."job_roles" TO "service_role";
GRANT SELECT ON TABLE "ref"."job_roles" TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON SEQUENCES TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON FUNCTIONS TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_auth_admin" IN SCHEMA "auth" GRANT ALL ON TABLES TO "dashboard_user";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "kaiten" GRANT ALL ON TABLES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







