"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function LandingPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-center">
      <div className="mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-5xl text-white">₿</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Dollar Cost Averaging for Bitcoin
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Automatically invest in Bitcoin with the best rates using Enso
          Protocol
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-3">🔄</div>
          <h3 className="font-semibold text-gray-900 mb-2">Automated DCA</h3>
          <p className="text-gray-600 text-sm">
            Set it and forget it - automated daily Bitcoin purchases
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-semibold text-gray-900 mb-2">Best Rates</h3>
          <p className="text-gray-600 text-sm">
            Enso Protocol finds the best rates across CBBTC, LBTC, and WBTC
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
          <p className="text-gray-600 text-sm">
            Non-custodial, your keys, your Bitcoin
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <ConnectButton />
      </div>
    </main>
  );
}
