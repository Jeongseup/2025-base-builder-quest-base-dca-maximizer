import { getDatabase } from "./sqlite";

export interface DCAConfig {
  id: string;
  userAddress: string;
  serverWalletAddress: string;
  smartAccountAddress: string;
  targetToken: string; // e.g., "CBBTC", "WBTC", etc.
  amountUSD: number; // Daily DCA amount in USD
  frequency: "daily" | "weekly" | "monthly";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastExecutedAt?: Date;
  totalExecutions: number;
  totalAmountSpent: number;
}

export interface User {
  address: string;
  serverWalletAddress: string;
  smartAccountAddress: string;
  spendPermission?: {
    token: string;
    allowance: string;
    periodInDays: number;
    grantedAt: Date;
  };
  createdAt: Date;
}

export class Database {
  // User management
  static createUser(userData: Omit<User, "createdAt">): User {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (
        address, server_wallet_address, smart_account_address,
        spend_permission_token, spend_permission_allowance, spend_permission_period_days, spend_permission_granted_at,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      userData.address,
      userData.serverWalletAddress,
      userData.smartAccountAddress,
      userData.spendPermission?.token || null,
      userData.spendPermission?.allowance || null,
      userData.spendPermission?.periodInDays || null,
      userData.spendPermission?.grantedAt?.toISOString() || null,
      now
    );

    return {
      ...userData,
      createdAt: new Date(now),
    };
  }

  static getUser(address: string): User | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE address = ?");
    const row = stmt.get(address) as any;

    if (!row) return null;

    return {
      address: row.address,
      serverWalletAddress: row.server_wallet_address,
      smartAccountAddress: row.smart_account_address,
      spendPermission: row.spend_permission_token
        ? {
            token: row.spend_permission_token,
            allowance: row.spend_permission_allowance,
            periodInDays: row.spend_permission_period_days,
            grantedAt: new Date(row.spend_permission_granted_at),
          }
        : undefined,
      createdAt: new Date(row.created_at),
    };
  }

  static updateUser(address: string, updates: Partial<User>): User | null {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE users SET
        server_wallet_address = COALESCE(?, server_wallet_address),
        smart_account_address = COALESCE(?, smart_account_address),
        spend_permission_token = COALESCE(?, spend_permission_token),
        spend_permission_allowance = COALESCE(?, spend_permission_allowance),
        spend_permission_period_days = COALESCE(?, spend_permission_period_days),
        spend_permission_granted_at = COALESCE(?, spend_permission_granted_at)
      WHERE address = ?
    `);

    stmt.run(
      updates.serverWalletAddress || null,
      updates.smartAccountAddress || null,
      updates.spendPermission?.token || null,
      updates.spendPermission?.allowance || null,
      updates.spendPermission?.periodInDays || null,
      updates.spendPermission?.grantedAt?.toISOString() || null,
      address
    );

    return this.getUser(address);
  }

  // DCA Configuration management
  static createDCAConfig(
    configData: Omit<
      DCAConfig,
      "id" | "createdAt" | "updatedAt" | "totalExecutions" | "totalAmountSpent"
    >
  ): DCAConfig {
    const db = getDatabase();
    const id = `dca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO dca_configs (
        id, user_address, server_wallet_address, smart_account_address,
        target_token, amount_usd, frequency, is_active,
        total_executions, total_amount_spent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      configData.userAddress,
      configData.serverWalletAddress,
      configData.smartAccountAddress,
      configData.targetToken,
      configData.amountUSD,
      configData.frequency,
      configData.isActive ? 1 : 0,
      0, // totalExecutions
      0, // totalAmountSpent
      now,
      now
    );

    return {
      ...configData,
      id,
      createdAt: new Date(now),
      updatedAt: new Date(now),
      totalExecutions: 0,
      totalAmountSpent: 0,
    };
  }

  static getDCAConfig(id: string): DCAConfig | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM dca_configs WHERE id = ?");
    const row = stmt.get(id) as any;

    if (!row) return null;

    return this.rowToDCAConfig(row);
  }

  static getUserDCAConfigs(userAddress: string): DCAConfig[] {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM dca_configs WHERE user_address = ? ORDER BY created_at DESC"
    );
    const rows = stmt.all(userAddress) as any[];

    return rows.map((row) => this.rowToDCAConfig(row));
  }

  static updateDCAConfig(
    id: string,
    updates: Partial<DCAConfig>
  ): DCAConfig | null {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE dca_configs SET
        target_token = COALESCE(?, target_token),
        amount_usd = COALESCE(?, amount_usd),
        frequency = COALESCE(?, frequency),
        is_active = COALESCE(?, is_active),
        last_executed_at = COALESCE(?, last_executed_at),
        total_executions = COALESCE(?, total_executions),
        total_amount_spent = COALESCE(?, total_amount_spent),
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.targetToken || null,
      updates.amountUSD || null,
      updates.frequency || null,
      updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : null,
      updates.lastExecutedAt?.toISOString() || null,
      updates.totalExecutions || null,
      updates.totalAmountSpent || null,
      now,
      id
    );

    return this.getDCAConfig(id);
  }

  static getAllActiveDCAConfigs(): DCAConfig[] {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM dca_configs WHERE is_active = 1 ORDER BY created_at DESC"
    );
    const rows = stmt.all() as any[];

    return rows.map((row) => this.rowToDCAConfig(row));
  }

  static deleteDCAConfig(id: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM dca_configs WHERE id = ?");
    const result = stmt.run(id);

    return result.changes > 0;
  }

  // Analytics
  static getStats() {
    const db = getDatabase();

    const userCount = db
      .prepare("SELECT COUNT(*) as count FROM users")
      .get() as { count: number };
    const dcaCount = db
      .prepare("SELECT COUNT(*) as count FROM dca_configs")
      .get() as { count: number };
    const activeDcaCount = db
      .prepare("SELECT COUNT(*) as count FROM dca_configs WHERE is_active = 1")
      .get() as { count: number };

    return {
      totalUsers: userCount.count,
      totalDCAConfigs: dcaCount.count,
      activeDCAConfigs: activeDcaCount.count,
    };
  }

  // Helper method to convert database row to DCAConfig
  private static rowToDCAConfig(row: any): DCAConfig {
    return {
      id: row.id,
      userAddress: row.user_address,
      serverWalletAddress: row.server_wallet_address,
      smartAccountAddress: row.smart_account_address,
      targetToken: row.target_token,
      amountUSD: row.amount_usd,
      frequency: row.frequency,
      isActive: Boolean(row.is_active),
      lastExecutedAt: row.last_executed_at
        ? new Date(row.last_executed_at)
        : undefined,
      totalExecutions: row.total_executions,
      totalAmountSpent: row.total_amount_spent,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
