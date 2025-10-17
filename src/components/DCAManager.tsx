"use client";

import React, { useState, useEffect } from "react";

interface DCAConfig {
  id: string;
  targetToken: string;
  amountUSD: number;
  frequency: "daily" | "weekly" | "monthly";
  isActive: boolean;
  lastExecutedAt?: string;
  totalExecutions?: number;
  totalAmountSpent?: number;
  createdAt: string;
  updatedAt: string;
}

interface DCAManagerProps {
  userAddress: string;
}

export function DCAManager({ userAddress }: DCAManagerProps) {
  const [configs, setConfigs] = useState<DCAConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newConfig, setNewConfig] = useState({
    targetToken: "CBBTC",
    amountUSD: 10,
    frequency: "daily" as "daily" | "weekly" | "monthly",
  });

  useEffect(() => {
    fetchDCAConfigs();
  }, [userAddress]);

  const fetchDCAConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/dca?userAddress=${encodeURIComponent(userAddress)}`
      );
      const data = await response.json();

      if (data.success) {
        setConfigs(data.configs);
      } else {
        console.error("Failed to fetch DCA configs:", data.error);
      }
    } catch (error) {
      console.error("Error fetching DCA configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDCAConfig = async () => {
    try {
      setCreating(true);
      const response = await fetch("/api/dca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAddress, ...newConfig }),
      });

      const data = await response.json();

      if (data.success) {
        setConfigs([...configs, data.config]);
        setShowCreateForm(false);
        setNewConfig({
          targetToken: "CBBTC",
          amountUSD: 10,
          frequency: "daily",
        });
      } else {
        alert(`Failed to create DCA config: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating DCA config:", error);
      alert("Error creating DCA config");
    } finally {
      setCreating(false);
    }
  };

  const toggleDCAConfig = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `/api/dca/${id}?userAddress=${encodeURIComponent(userAddress)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userAddress, isActive }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setConfigs(
          configs.map((config) =>
            config.id === id ? { ...config, isActive } : config
          )
        );
      } else {
        alert(`Failed to update DCA config: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating DCA config:", error);
      alert("Error updating DCA config");
    }
  };

  const deleteDCAConfig = async (id: string) => {
    if (!confirm("Are you sure you want to delete this DCA configuration?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/dca/${id}?userAddress=${encodeURIComponent(userAddress)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setConfigs(configs.filter((config) => config.id !== id));
      } else {
        alert(`Failed to delete DCA config: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting DCA config:", error);
      alert("Error deleting DCA config");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-700">
          DCA Configurations
        </h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-base-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create DCA"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">
            Create New DCA Configuration
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Token
              </label>
              <select
                value={newConfig.targetToken}
                onChange={(e) =>
                  setNewConfig({ ...newConfig, targetToken: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-base-blue focus:border-transparent"
              >
                <option value="CBBTC">CBBTC (Coinbase Bitcoin)</option>
                <option value="WBTC">WBTC (Wrapped Bitcoin)</option>
                <option value="LBTC">LBTC (Liquid Bitcoin)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                step="0.01"
                value={newConfig.amountUSD}
                onChange={(e) =>
                  setNewConfig({
                    ...newConfig,
                    amountUSD: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-base-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={newConfig.frequency}
                onChange={(e) =>
                  setNewConfig({
                    ...newConfig,
                    frequency: e.target.value as any,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-base-blue focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <button
              onClick={createDCAConfig}
              disabled={creating}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create DCA Configuration"}
            </button>
          </div>
        </div>
      )}

      {/* DCA Configurations List */}
      <div className="space-y-4">
        {configs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No DCA configurations found.</p>
            <p className="text-sm">
              Create your first DCA to start automated Bitcoin purchases.
            </p>
          </div>
        ) : (
          configs.map((config) => (
            <div
              key={config.id}
              className={`p-4 border rounded-lg ${
                config.isActive
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {config.targetToken}
                  </span>
                  <span className="text-sm text-gray-600">
                    ${config.amountUSD} / {config.frequency}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      config.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {config.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDCAConfig(config.id, !config.isActive)}
                    className={`px-3 py-1 text-xs rounded ${
                      config.isActive
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {config.isActive ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => deleteDCAConfig(config.id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Executions:</span>
                  <br />
                  {config.totalExecutions || 0}
                </div>
                <div>
                  <span className="font-medium">Total Spent:</span>
                  <br />${(config.totalAmountSpent || 0).toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Last Execution:</span>
                  <br />
                  {config.lastExecutedAt
                    ? formatDate(config.lastExecutedAt)
                    : "Never"}
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <br />
                  {formatDate(config.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-2">📊 How DCA Works:</p>
          <ul className="text-xs space-y-1">
            <li>
              • Your server wallet automatically executes DCA purchases based on
              your schedule
            </li>
            <li>
              • Each DCA purchase swaps USDC for your chosen Bitcoin token
            </li>
            <li>• Gas fees are sponsored automatically via CDP paymaster</li>
            <li>• You can pause, resume, or modify configurations anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
