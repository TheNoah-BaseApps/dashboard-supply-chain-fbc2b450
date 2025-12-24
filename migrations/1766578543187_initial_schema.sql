CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  supplier_key text NOT NULL UNIQUE,
  supplier_name text NOT NULL,
  contact_name text,
  contact_title text,
  address text,
  city text,
  region text,
  postal_code text,
  country text,
  phone text,
  email text,
  website text,
  date_added timestamp with time zone DEFAULT now() NOT NULL,
  last_updated timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_key ON suppliers (supplier_key);
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers (email);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_by ON suppliers (created_by);

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  item_id text NOT NULL UNIQUE,
  item_name text NOT NULL,
  date timestamp with time zone DEFAULT now() NOT NULL,
  quantity integer DEFAULT 0 NOT NULL,
  reorder_level integer DEFAULT 0 NOT NULL,
  suggested_reorder_quantity integer,
  order_quantity integer DEFAULT 0,
  order_status boolean DEFAULT false NOT NULL,
  current_cost_per_unit decimal(10,2) DEFAULT 0.00 NOT NULL,
  unit_cost_paid decimal(10,2),
  total_inventory_value decimal(12,2) DEFAULT 0.00 NOT NULL,
  total_item_reorder_cost decimal(12,2),
  last_updated timestamp with time zone DEFAULT now() NOT NULL,
  updated_by uuid NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON inventory_items (item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_updated_by ON inventory_items (updated_by);
CREATE INDEX IF NOT EXISTS idx_inventory_reorder ON inventory_items (quantity, reorder_level);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  workflow text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  timestamp timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workflow ON audit_logs (workflow);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs (record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);

CREATE TABLE IF NOT EXISTS data_validations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  workflow text NOT NULL,
  record_id uuid NOT NULL,
  field text NOT NULL,
  validation_type text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  resolved boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_validations_workflow ON data_validations (workflow);
CREATE INDEX IF NOT EXISTS idx_validations_record_id ON data_validations (record_id);
CREATE INDEX IF NOT EXISTS idx_validations_resolved ON data_validations (resolved);
CREATE INDEX IF NOT EXISTS idx_validations_severity ON data_validations (severity);