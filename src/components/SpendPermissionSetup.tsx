"use client";

import React, { useState } from "react";
import { useChainId } from "wagmi";
import { getBaseAccountProvider } from "../lib/base-account";
import { requestSpendPermission } from "@base-org/account/spend-permission/browser";
import { createBaseAccountSDK } from "@base-org/account";

interface SpendPermissionSetupProps {
  userAddress: string;
  onPermissionGranted: () => void;
}

export function SpendPermissionSetup({
  userAddress,
  onPermissionGranted,
}: SpendPermissionSetupProps) {
  const chainId = useChainId() as number;
  const [dailyLimit, setDailyLimit] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetupPermission = async () => {
    setIsLoading(true);
    setError("");

    // Validate input
    if (dailyLimit < 0.01 || dailyLimit > 1000) {
      setError("Daily limit must be between $0.01 and $1000");
      setIsLoading(false);
      return;
    }

    try {
      // First create server wallet to get the spender address
      const walletResponse = await fetch("/api/wallet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAddress }),
      });

      if (!walletResponse.ok) {
        throw new Error("Failed to create server wallet");
      }

      const walletData = await walletResponse.json();
      const spenderAddress = walletData.smartAccountAddress;

      if (!spenderAddress) {
        throw new Error("Smart account address not found");
      }

      console.log("Smart account address (spender):", spenderAddress);
      console.log("Server wallet address:", walletData.serverWalletAddress);

      // USDC address on Base sepolia
      // const USDC_BASE_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
      // USDC address on Base mainnet
      const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

      // Convert USD to USDC (6 decimals)
      const allowanceUSDC = BigInt(dailyLimit * 1_000_000);

      // Request spend permission from user's wallet (this requires user signature)
      console.log("Requesting spend permission from user...");

      const permission = await requestSpendPermission({
        account: userAddress as `0x${string}`,
        spender: spenderAddress as `0x${string}`,
        token: USDC_BASE_ADDRESS as `0x${string}`,
        chainId: chainId, // Base mainnet
        allowance: allowanceUSDC,
        periodInDays: 1, // Daily limit
        provider: getBaseAccountProvider(chainId),
      });

      // Store the permission in database
      const saveResponse = await fetch("/api/spend-permission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress,
          spenderAddress,
          token: USDC_BASE_ADDRESS,
          allowance: allowanceUSDC.toString(),
          periodInDays: 1,
          permissionData: permission,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save spend permission to database");
      }

      const saveResult = await saveResponse.json();
      console.log("Spend permission saved to database:", saveResult);

      onPermissionGranted();
    } catch (error) {
      console.error("Permission setup error:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Set Up Spend Permissions
      </h3>

      <p className="text-gray-600 text-sm mb-6">
        To use the Zora Coins Agent, you need to grant spend permissions. This
        allows the agent to purchase coins on your behalf using your USDC.
      </p>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="dailyLimit"
            className="block text-sm font-medium text-gray-700"
          >
            Daily Spend Permission (USD)
          </label>
          <div className="mt-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                id="dailyLimit"
                min="0.01"
                max="1000"
                step="0.01"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-base-blue focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Enter the daily spending limit in USD (minimum $0.01)
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleSetupPermission}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-base-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-blue disabled:opacity-50"
        >
          {isLoading
            ? "Setting up..."
            : `Grant $${dailyLimit.toFixed(2)}/day Spend Permission`}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          💡 This creates a secure spend permission that allows the agent to
          spend up to ${dailyLimit.toFixed(2)} per day from your wallet to buy
          Zora coins. Gas fees are sponsored automatically.
        </p>
      </div>
    </div>
  );
}
