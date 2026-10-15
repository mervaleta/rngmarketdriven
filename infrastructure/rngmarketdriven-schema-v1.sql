-- RNGMarketDriven commercial/service database v1
-- This does not store player wallets or Cryptodromo bets.
PRAGMA foreign_keys = ON;
CREATE TABLE organizations (
  organization_id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lead' CHECK(status IN ('lead','active','suspended','closed')),
  created_at TEXT NOT NULL
);
CREATE TABLE contacts (
  contact_id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(organization_id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE service_plans (
  plan_id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
);
CREATE TABLE projects (
  project_id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(organization_id),
  plan_id TEXT REFERENCES service_plans(plan_id),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','active','paused','closed')),
  created_at TEXT NOT NULL
);
CREATE TABLE api_clients (
  client_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(project_id),
  key_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked')),
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE TABLE api_usage (
  usage_id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES api_clients(client_id),
  dataset_version TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  asset_id TEXT,
  source_time TEXT,
  response_hash TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE deployments (
  deployment_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(project_id),
  environment TEXT NOT NULL CHECK(environment IN ('sandbox','production')),
  dataset_version TEXT,
  status TEXT NOT NULL CHECK(status IN ('requested','running','succeeded','failed','rolled_back')),
  created_at TEXT NOT NULL
);
CREATE TABLE audit_events (
  event_id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(project_id),
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_usage_client_time ON api_usage(client_id, created_at);
