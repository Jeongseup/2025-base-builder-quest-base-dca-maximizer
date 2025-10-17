import { getServerWalletForUser } from "./cdp";
import { Database, DCAConfig } from "./database";

// Smart contract addresses (Base mainnet)
const DCA_CONTRACT_ADDRESS = process.env.DCA_CONTRACT_ADDRESS || "0x..."; // Your deployed DCA contract
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base mainnet USDC
const CBBTC_ADDRESS = "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf"; // Base mainnet CBBTC

// Contract ABIs
const DCA_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "buyBTC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "deposits",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export interface DCAExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  amountDeposited?: bigint;
  amountSpent?: bigint;
}

export class DCAService {
  /**
   * Execute DCA for a specific configuration
   */
  static async executeDCA(config: DCAConfig): Promise<DCAExecutionResult> {
    try {
      console.log(
        `Executing DCA for user ${config.userAddress}, config ${config.id}`
      );

      // Get server wallet for user
      const serverWallet = getServerWalletForUser(config.userAddress);
      if (!serverWallet?.smartAccount) {
        throw new Error(
          `No server wallet found for user ${config.userAddress}`
        );
      }

      // Convert USD amount to USDC (6 decimals)
      const amountUSDC = BigInt(config.amountUSD * 1_000_000);

      console.log(`DCA amount: ${config.amountUSD} USD (${amountUSDC} USDC)`);

      // Check if we have enough USDC balance in server wallet
      const usdcBalance = await this.getUSDCBalance(
        serverWallet.smartAccount.address
      );
      console.log(`Server wallet USDC balance: ${usdcBalance}`);

      if (usdcBalance < amountUSDC) {
        throw new Error(
          `Insufficient USDC balance. Required: ${amountUSDC}, Available: ${usdcBalance}`
        );
      }

      // Step 1: Deposit USDC to DCA contract
      const depositTx = await this.depositToDCA(serverWallet, amountUSDC);
      console.log(`Deposit transaction: ${depositTx}`);

      // Step 2: Execute DCA buy (swap USDC for CBBTC)
      const buyTx = await this.buyBTC(serverWallet, amountUSDC);
      console.log(`Buy BTC transaction: ${buyTx}`);

      // Update config with execution details
      Database.updateDCAConfig(config.id, {
        lastExecutedAt: new Date(),
        totalExecutions: config.totalExecutions + 1,
        totalAmountSpent: config.totalAmountSpent + config.amountUSD,
      });

      return {
        success: true,
        transactionHash: buyTx,
        amountDeposited: amountUSDC,
        amountSpent: amountUSDC,
      };
    } catch (error) {
      console.error(`DCA execution failed for config ${config.id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if DCA should be executed based on frequency and last execution
   */
  static shouldExecuteDCA(config: DCAConfig): boolean {
    if (!config.isActive || !config.lastExecutedAt) {
      return true; // First execution
    }

    const now = new Date();
    const lastExecuted = config.lastExecutedAt;
    const timeDiff = now.getTime() - lastExecuted.getTime();

    switch (config.frequency) {
      case "daily":
        return timeDiff >= 24 * 60 * 60 * 1000; // 24 hours
      case "weekly":
        return timeDiff >= 7 * 24 * 60 * 60 * 1000; // 7 days
      case "monthly":
        return timeDiff >= 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return false;
    }
  }

  /**
   * Execute all eligible DCA configurations
   */
  static async executeAllEligibleDCAs(): Promise<{
    executed: number;
    failed: number;
    results: DCAExecutionResult[];
  }> {
    const activeConfigs = Database.getAllActiveDCAConfigs();
    const eligibleConfigs = activeConfigs.filter((config) =>
      this.shouldExecuteDCA(config)
    );

    console.log(
      `Found ${eligibleConfigs.length} eligible DCA configurations out of ${activeConfigs.length} active configs`
    );

    const results: DCAExecutionResult[] = [];
    let executed = 0;
    let failed = 0;

    for (const config of eligibleConfigs) {
      const result = await this.executeDCA(config);
      results.push(result);

      if (result.success) {
        executed++;
      } else {
        failed++;
      }

      // Add delay between executions to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return { executed, failed, results };
  }

  /**
   * Get USDC balance for an address
   */
  private static async getUSDCBalance(address: string): Promise<bigint> {
    // This would use your CDP client to call the contract
    // For now, returning a mock value
    console.log(`Getting USDC balance for ${address}`);
    return BigInt(1000000000); // Mock 1000 USDC (1000 * 10^6)
  }

  /**
   * Deposit USDC to DCA contract
   */
  private static async depositToDCA(
    serverWallet: any,
    amount: bigint
  ): Promise<string> {
    console.log(`Depositing ${amount} USDC to DCA contract`);

    // This would use your CDP client to send transaction
    // For now, returning a mock transaction hash
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  /**
   * Execute buyBTC function on DCA contract
   */
  private static async buyBTC(
    serverWallet: any,
    amount: bigint
  ): Promise<string> {
    console.log(`Executing buyBTC for ${amount} USDC`);

    // This would use your CDP client to send transaction
    // For now, returning a mock transaction hash
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  /**
   * Create a new DCA configuration for a user
   */
  static async createDCAConfig(
    userAddress: string,
    config: {
      targetToken: string;
      amountUSD: number;
      frequency: "daily" | "weekly" | "monthly";
    }
  ): Promise<DCAConfig> {
    const user = Database.getUser(userAddress);
    if (!user) {
      throw new Error(`User ${userAddress} not found`);
    }

    if (!user.serverWalletAddress || !user.smartAccountAddress) {
      throw new Error(`User ${userAddress} does not have a server wallet`);
    }

    return Database.createDCAConfig({
      userAddress,
      serverWalletAddress: user.serverWalletAddress,
      smartAccountAddress: user.smartAccountAddress,
      targetToken: config.targetToken,
      amountUSD: config.amountUSD,
      frequency: config.frequency,
      isActive: true,
    });
  }
}
