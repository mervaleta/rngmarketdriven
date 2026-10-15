-- Proposed additive schema. Apply manually only to an isolated reviewed database.
-- No existing tables changed. MySQL/MariaDB compatibility needs target validation.
CREATE TABLE market_datasets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  version VARCHAR(40) NOT NULL,
  source_kind VARCHAR(20) NOT NULL,
  week_start_utc DATE NOT NULL,
  generator_version VARCHAR(40) NOT NULL,
  generation_seed VARCHAR(255) NOT NULL,
  manifest_json LONGTEXT NOT NULL,
  content_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY dataset_version (name, version),
  UNIQUE KEY dataset_content (content_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE market_instruments (
  id VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  symbol VARCHAR(30) NOT NULL,
  market VARCHAR(30) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  UNIQUE KEY market_symbol_currency (market, symbol, currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE market_prices (
  dataset_id BIGINT UNSIGNED NOT NULL,
  instrument_id VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  minute_index SMALLINT UNSIGNED NOT NULL,
  timestamp_utc DATETIME NOT NULL,
  session_date DATE NOT NULL,
  price DECIMAL(24,10) NOT NULL,
  PRIMARY KEY (dataset_id, instrument_id, timestamp_utc),
  UNIQUE KEY series_minute (dataset_id, instrument_id, minute_index),
  KEY dataset_tick (dataset_id, minute_index),
  FOREIGN KEY (dataset_id) REFERENCES market_datasets(id),
  FOREIGN KEY (instrument_id) REFERENCES market_instruments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE market_simulation_runs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dataset_id BIGINT UNSIGNED NOT NULL,
  selection_version VARCHAR(40) NOT NULL,
  selection_seed VARCHAR(255) NOT NULL,
  selection_manifest_json LONGTEXT NOT NULL,
  rules_version VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dataset_id) REFERENCES market_datasets(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
