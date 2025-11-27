-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE kaiten.boards (
  id bigint NOT NULL,
  uid uuid,
  space_id bigint,
  title text NOT NULL,
  description text,
  board_type text,
  archived boolean DEFAULT false,
  sort_order double precision,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT boards_pkey PRIMARY KEY (id),
  CONSTRAINT boards_space_id_fkey FOREIGN KEY (space_id) REFERENCES kaiten.spaces(id)
);
CREATE TABLE kaiten.card_members (
  card_id bigint NOT NULL,
  user_id bigint NOT NULL,
  CONSTRAINT card_members_pkey PRIMARY KEY (card_id, user_id)
);
CREATE TABLE kaiten.card_tags (
  card_id bigint NOT NULL,
  tag_id bigint NOT NULL,
  CONSTRAINT card_tags_pkey PRIMARY KEY (card_id, tag_id),
  CONSTRAINT card_tags_card_id_fkey FOREIGN KEY (card_id) REFERENCES kaiten.cards(id)
);
CREATE TABLE kaiten.card_types (
  id bigint NOT NULL,
  uid uuid,
  name text NOT NULL,
  icon_url text,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  raw_payload jsonb DEFAULT '{}'::jsonb,
  payload_hash text,
  CONSTRAINT card_types_pkey PRIMARY KEY (id)
);
CREATE TABLE kaiten.cards (
  id bigint NOT NULL,
  uid uuid,
  title text NOT NULL,
  description text,
  space_id bigint,
  board_id bigint,
  column_id bigint,
  lane_id bigint,
  type_id bigint,
  owner_id bigint,
  creator_id bigint,
  state integer,
  archived boolean DEFAULT false,
  blocked boolean DEFAULT false,
  size_text text,
  due_date timestamp with time zone,
  time_spent_sum double precision DEFAULT 0,
  time_blocked_sum double precision DEFAULT 0,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  properties jsonb DEFAULT '{}'::jsonb,
  tags_cache jsonb DEFAULT '[]'::jsonb,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  estimate_workload double precision DEFAULT 0,
  parents_ids ARRAY DEFAULT '{}'::bigint[],
  children_ids ARRAY DEFAULT '{}'::bigint[],
  members_ids ARRAY DEFAULT '{}'::bigint[],
  members_data jsonb DEFAULT '[]'::jsonb,
  external_id text,
  CONSTRAINT cards_pkey PRIMARY KEY (id)
);
CREATE TABLE kaiten.columns (
  id bigint NOT NULL,
  uid uuid,
  board_id bigint,
  title text,
  column_type integer,
  sort_order double precision,
  wip_limit integer,
  archived boolean DEFAULT false,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT columns_pkey PRIMARY KEY (id),
  CONSTRAINT columns_board_id_fkey FOREIGN KEY (board_id) REFERENCES kaiten.boards(id)
);
CREATE TABLE kaiten.lanes (
  id bigint NOT NULL,
  uid uuid,
  board_id bigint,
  title text,
  sort_order double precision,
  archived boolean DEFAULT false,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT lanes_pkey PRIMARY KEY (id),
  CONSTRAINT lanes_board_id_fkey FOREIGN KEY (board_id) REFERENCES kaiten.boards(id)
);
CREATE TABLE kaiten.property_definitions (
  id bigint NOT NULL,
  uid uuid,
  name text NOT NULL,
  field_type text,
  select_options jsonb,
  kaiten_created_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  raw_payload jsonb DEFAULT '{}'::jsonb,
  kaiten_updated_at timestamp with time zone,
  payload_hash text,
  CONSTRAINT property_definitions_pkey PRIMARY KEY (id)
);
CREATE TABLE kaiten.roles (
  id bigint NOT NULL,
  uid uuid,
  name text NOT NULL,
  company_id bigint,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  raw_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE kaiten.spaces (
  id bigint NOT NULL,
  uid uuid,
  title text NOT NULL,
  company_id bigint,
  owner_user_id bigint,
  archived boolean DEFAULT false,
  sort_order double precision,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT spaces_pkey PRIMARY KEY (id),
  CONSTRAINT spaces_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES kaiten.users(id)
);
CREATE TABLE kaiten.tags (
  id bigint NOT NULL,
  uid uuid,
  name text NOT NULL,
  color text,
  group_name text,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  raw_payload jsonb DEFAULT '{}'::jsonb,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  payload_hash text,
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE kaiten.time_logs (
  id bigint NOT NULL,
  uid uuid,
  card_id bigint,
  user_id bigint,
  time_spent_minutes integer NOT NULL DEFAULT 0,
  date date,
  comment text,
  role_id bigint,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT time_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE kaiten.users (
  id bigint NOT NULL,
  uid uuid,
  full_name text,
  email text,
  username text,
  timezone text,
  role integer,
  is_admin boolean DEFAULT false,
  take_licence boolean,
  apps_permissions integer,
  locked boolean,
  last_request_date timestamp with time zone,
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE ops.clients (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  contact_info text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE ops.employees (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  kaiten_user_id bigint,
  full_name text NOT NULL,
  role text,
  hourly_cost numeric DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  job_role_id bigint,
  grade_id bigint,
  kaiten_role_id bigint,
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_kaiten_user_id_fkey FOREIGN KEY (kaiten_user_id) REFERENCES kaiten.users(id),
  CONSTRAINT employees_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES ref.job_roles(id),
  CONSTRAINT employees_grade_id_fkey FOREIGN KEY (grade_id) REFERENCES ref.grades(id),
  CONSTRAINT employees_kaiten_role_id_fkey FOREIGN KEY (kaiten_role_id) REFERENCES kaiten.roles(id)
);
CREATE TABLE ops.project_tag_mapping (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  project_id bigint NOT NULL,
  kaiten_tag_id bigint NOT NULL UNIQUE,
  kaiten_tag_name text,
  CONSTRAINT project_tag_mapping_pkey PRIMARY KEY (id),
  CONSTRAINT project_tag_mapping_project_id_fkey FOREIGN KEY (project_id) REFERENCES ops.projects(id)
);
CREATE TABLE ops.projects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  client_id bigint NOT NULL,
  name text NOT NULL,
  default_rate numeric NOT NULL DEFAULT 0,
  kaiten_space_id bigint,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES ops.clients(id),
  CONSTRAINT projects_kaiten_space_id_fkey FOREIGN KEY (kaiten_space_id) REFERENCES kaiten.spaces(id)
);
CREATE TABLE ops.task_assignments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  task_id bigint NOT NULL,
  employee_id bigint NOT NULL,
  role_type integer,
  is_responsible boolean DEFAULT (role_type = 2),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT task_assignments_task_id_fkey FOREIGN KEY (task_id) REFERENCES ops.tasks(id),
  CONSTRAINT task_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES ops.employees(id)
);
CREATE TABLE ops.tasks (
  id bigint NOT NULL,
  kaiten_card_id bigint NOT NULL,
  project_id bigint,
  assignee_id bigint,
  status text NOT NULL,
  title text NOT NULL,
  estimate_hours numeric DEFAULT 0,
  time_spent_sum numeric NOT NULL DEFAULT 0,
  completed_at timestamp with time zone,
  raw_synced_at timestamp with time zone NOT NULL DEFAULT now(),
  owner_id bigint,
  all_members_ids ARRAY DEFAULT '{}'::bigint[],
  parent_task_id bigint,
  children_task_ids ARRAY DEFAULT '{}'::bigint[],
  external_id text,
  tags jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_kaiten_card_id_fkey FOREIGN KEY (kaiten_card_id) REFERENCES kaiten.cards(id),
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES ops.projects(id),
  CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES ops.employees(id),
  CONSTRAINT tasks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES ops.employees(id)
);

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE ref.grades (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  level integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grades_pkey PRIMARY KEY (id)
);
CREATE TABLE ref.job_roles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  code text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT job_roles_pkey PRIMARY KEY (id)
);