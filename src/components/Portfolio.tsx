"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import Image from "next/image";

// Token addresses on Base
const USDC_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const CBBTC_ADDRESS = "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf";
const LBTC_ADDRESS = "0xecac9c5f704e954931349da37f60e39f515c11c1";
const WBTC_ADDRESS = "0x0555e30da8f98308edb960aa94c0db47230d2b9c";

// ERC20 ABI for balanceOf
const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState({
    usdc: 0,
    cbbtc: 0,
    lbtc: 0,
    wbtc: 0,
  });

  // Read token balances for connected wallet
  const { data: usdcBalanceRaw } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: cbbtcBalanceRaw } = useReadContract({
    address: CBBTC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: lbtcBalanceRaw } = useReadContract({
    address: LBTC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: wbtcBalanceRaw } = useReadContract({
    address: WBTC_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    // Calculate USDC balance
    const usdcBal =
      typeof usdcBalanceRaw === "bigint"
        ? Number(usdcBalanceRaw) / 1_000_000
        : 0;
    setUsdcBalance(usdcBal);

    // Calculate BTC token balances (all have 18 decimals except WBTC which has 8)
    const cbbtcBal =
      typeof cbbtcBalanceRaw === "bigint"
        ? Number(cbbtcBalanceRaw) / 100_000_000
        : 0;
    const lbtcBal =
      typeof lbtcBalanceRaw === "bigint"
        ? Number(lbtcBalanceRaw) / 1_000_000_000_000_000_000
        : 0;
    const wbtcBal =
      typeof wbtcBalanceRaw === "bigint"
        ? Number(wbtcBalanceRaw) / 100_000_000
        : 0; // WBTC has 8 decimals

    setTokenBalances({
      usdc: usdcBal,
      cbbtc: cbbtcBal,
      lbtc: lbtcBal,
      wbtc: wbtcBal,
    });
  }, [usdcBalanceRaw, cbbtcBalanceRaw, lbtcBalanceRaw, wbtcBalanceRaw]);

  if (!isConnected) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Wallet Not Connected
          </h1>
          <p className="text-gray-600">
            Please connect your wallet to view your portfolio
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Investment Portfolio
        </h1>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Total Amount Invested Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">
            Total Amount Invested
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                $
                {(
                  tokenBalances.usdc +
                  (tokenBalances.cbbtc +
                    tokenBalances.lbtc +
                    tokenBalances.wbtc) *
                    95000
                ).toLocaleString()}
              </div>
              <div className="text-lg text-gray-600">
                ≈{" "}
                {(
                  tokenBalances.cbbtc +
                  tokenBalances.lbtc +
                  tokenBalances.wbtc
                ).toFixed(8)}{" "}
                BTC
              </div>
            </div>
            <div className="w-32 h-32 relative">
              {/* Simple donut chart representation */}
              <div className="w-full h-full rounded-full border-8 border-blue-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">BTC</div>
                  <div className="text-xs text-gray-500">
                    {(
                      (((tokenBalances.cbbtc +
                        tokenBalances.lbtc +
                        tokenBalances.wbtc) *
                        95000) /
                        (tokenBalances.usdc +
                          (tokenBalances.cbbtc +
                            tokenBalances.lbtc +
                            tokenBalances.wbtc) *
                            95000)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>
                BTC{" "}
                {(
                  (((tokenBalances.cbbtc +
                    tokenBalances.lbtc +
                    tokenBalances.wbtc) *
                    95000) /
                    (tokenBalances.usdc +
                      (tokenBalances.cbbtc +
                        tokenBalances.lbtc +
                        tokenBalances.wbtc) *
                        95000)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>
                USDC{" "}
                {(
                  (tokenBalances.usdc /
                    (tokenBalances.usdc +
                      (tokenBalances.cbbtc +
                        tokenBalances.lbtc +
                        tokenBalances.wbtc) *
                        95000)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Token Balances Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">
            Token Balances
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">USDC</span>
                </div>
                <span className="text-gray-600">USDC</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                $
                {tokenBalances.usdc.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/assets/cbbtc-logo.png"
                    alt="CBBTC logo"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-gray-600">CBBTC</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {tokenBalances.cbbtc.toFixed(8)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/assets/lbtc-logo.jpeg"
                    alt="LBTC logo"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-gray-600">LBTC</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {tokenBalances.lbtc.toFixed(8)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/assets/wbtc-logo.png"
                    alt="WBTC logo"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <span className="text-gray-600">WBTC</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {tokenBalances.wbtc.toFixed(8)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">
          Recent Activity
        </h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>Transaction history will appear here</p>
        </div>
      </div>
    </main>
  );
}
