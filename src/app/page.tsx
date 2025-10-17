"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import LandingPage from "../components/LandingPage";
import DCAInterface from "../components/DCAInterface";
import Portfolio from "../components/Portfolio";

export default function Home() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("dca");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌲</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              BTC Maximizer
            </span>
          </Link>
          <nav className="flex space-x-8">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "dca"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("dca")}
            >
              DCA
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "one-time"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("one-time")}
            >
              One-Time Buy
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "portfolio"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("portfolio")}
            >
              Portfolio
            </button>
          </nav>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!isConnected ? (
        <LandingPage />
      ) : activeTab === "portfolio" ? (
        <Portfolio />
      ) : (
        <DCAInterface activeTab={activeTab} />
      )}
    </div>
  );
}
