"use client";

import { useState } from "react";
import { useChainId } from "wagmi";
import { toHex } from "viem";
import { getProvider } from "../lib/base-account";

interface SignInWithBaseProps {
  onSignIn: (address: string) => void;
  colorScheme?: "light" | "dark";
}

export const SignInWithBaseButton = ({
  onSignIn,
  colorScheme = "light",
}: SignInWithBaseProps) => {
  // const chains = useChains();
  const chainId = useChainId() as number;
  const hexChainId = toHex(chainId);

  const [isLoading, setIsLoading] = useState(false);
  const isLight = colorScheme === "light";

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      // 개발 모드: 항상 성공하도록 설정
      const isDevMode =
        process.env.NEXT_PUBLIC_NODE_ENV === "development" || false; // 개발 중에는 항상 true

      if (isDevMode) {
        console.log("🚀 Development mode: Skipping authentication");
        // 개발용 더미 주소
        const devAddress = "0x742d35Cc6634C0532925a3b8D8C9c2a8c9C2a8c9";
        setTimeout(() => {
          onSignIn(devAddress);
          setIsLoading(false);
        }, 500); // 0.5초 후 성공 처리
        return;
      }

      // Get the provider from lib
      const provider = getProvider(chainId);

      // 1 — Get a fresh nonce from the server
      const nonceResponse = await fetch("/api/auth/verify", { method: "GET" });
      const { nonce } = await nonceResponse.json();

      console.log("Using nonce:", nonce);

      const ethRequestAccountsResponse = await provider.request({
        method: "eth_requestAccounts",
      });

      console.log("Eth request accounts response:", ethRequestAccountsResponse);

      const switchChainResponse = await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });

      console.log("Switch chain response:", switchChainResponse);
      // 2 — Connect and get address
      const connectResponse = (await provider.request({
        method: "wallet_connect",
        params: [
          {
            version: "1",
            capabilities: {
              signInWithEthereum: {
                chainId: hexChainId,
                nonce,
              },
            },
          },
        ],
      })) as {
        accounts: { address: string }[];
        signInWithEthereum?: {
          message: string;
          signature: string;
        };
      };

      console.log("Connect response:", connectResponse);
      const { address } = connectResponse.accounts[0];

      /*
      // 3 — Check if we got SIWE data from the response
      if (connectResponse.signInWithEthereum) {
        const { message, signature } = connectResponse.signInWithEthereum;
        console.log("SIWE message:", message);
        console.log("SIWE signature:", signature);

        // 4 — Verify signature on the server
        const verifyResponse = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, message, signature }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.ok) {
          throw new Error(verifyData.error || "Signature verification failed");
        }

        console.log("✅ Signature verified successfully!");
      } else {
        // Fallback: manual signing if SIWE not available
        console.log("⚠️ SIWE not available, using manual signing");

        // Create SIWE message manually
        // 나중에 여기를 수정하면 되는듯?
        const domain = window.location.host;
        const uri = window.location.origin;
        const message = `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nAgent Spend Permissions Authentication\n\nURI: ${uri}\nVersion: 1\nChain ID: 8453\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;

        // Request signature
        const signature = await provider.request({
          method: "personal_sign",
          params: [message, address],
        });

        // Verify signature on server
        const verifyResponse = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, message, signature }),
        });

        const verifyData = await verifyResponse.json();

        if (!verifyData.ok) {
          throw new Error(verifyData.error || "Signature verification failed");
        }

        console.log("✅ Manual signature verified successfully!");
      }
      */

      console.log("✅ Authentication complete for address:", address);
      onSignIn(address);
    } catch (err) {
      console.error("Sign in failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={isLoading}
      className={`
        flex items-center justify-center gap-2 px-8 py-5 rounded-lg cursor-pointer 
        font-medium text-lg min-w-64 h-14 transition-all duration-200
        ${
          isLight
            ? "bg-white text-black border-2 border-gray-200 hover:bg-gray-50"
            : "bg-black text-white border-2 border-gray-700 hover:bg-gray-900"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div
        className={`
        w-4 h-4 rounded-sm flex-shrink-0
        ${isLight ? "bg-base-blue" : "bg-white"}
      `}
      />
      <span>{isLoading ? "Signing in..." : "Sign in with Base"}</span>
    </button>
  );
};
