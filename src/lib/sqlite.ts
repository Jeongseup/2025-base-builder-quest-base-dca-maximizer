import Database from "better-sqlite3";
import path from "path";

// SQLite 데이터베이스 파일 경로
const DB_PATH = path.join(process.cwd(), "dca_database.sqlite");

// 전역 데이터베이스 인스턴스
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);

    // 데이터베이스 초기화
    initializeDatabase(db);

    console.log(`📊 SQLite database initialized at: ${DB_PATH}`);
  }

  return db;
}

function initializeDatabase(database: Database.Database) {
  // Users 테이블 생성
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT UNIQUE NOT NULL,
      server_wallet_address TEXT,
      smart_account_address TEXT,
      spend_permission_token TEXT,
      spend_permission_allowance TEXT,
      spend_permission_period_days INTEGER,
      spend_permission_granted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // DCA Configs 테이블 생성
  database.exec(`
    CREATE TABLE IF NOT EXISTS dca_configs (
      id TEXT PRIMARY KEY,
      user_address TEXT NOT NULL,
      server_wallet_address TEXT NOT NULL,
      smart_account_address TEXT NOT NULL,
      target_token TEXT NOT NULL,
      amount_usd REAL NOT NULL,
      frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
      is_active BOOLEAN DEFAULT 1,
      last_executed_at DATETIME,
      total_executions INTEGER DEFAULT 0,
      total_amount_spent REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_address) REFERENCES users (address)
    )
  `);

  // 인덱스 생성
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_dca_configs_user_address ON dca_configs(user_address);
    CREATE INDEX IF NOT EXISTS idx_dca_configs_is_active ON dca_configs(is_active);
    CREATE INDEX IF NOT EXISTS idx_dca_configs_frequency ON dca_configs(frequency);
  `);

  console.log("✅ Database tables and indexes created");
}

// 데이터베이스 연결 종료 (앱 종료 시 사용)
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log("📊 Database connection closed");
  }
}

// 데이터베이스 상태 확인
export function getDatabaseStats() {
  const database = getDatabase();

  const userCount = database
    .prepare("SELECT COUNT(*) as count FROM users")
    .get() as { count: number };
  const dcaCount = database
    .prepare("SELECT COUNT(*) as count FROM dca_configs")
    .get() as { count: number };
  const activeDcaCount = database
    .prepare("SELECT COUNT(*) as count FROM dca_configs WHERE is_active = 1")
    .get() as { count: number };

  return {
    totalUsers: userCount.count,
    totalDCAConfigs: dcaCount.count,
    activeDCAConfigs: activeDcaCount.count,
  };
}
