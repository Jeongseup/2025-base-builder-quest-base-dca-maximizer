"use client";

import React, { useState, useEffect } from "react";
import { useChainId } from "wagmi";

interface SpendPermissionManagerProps {
  isAuthenticated: boolean;
  userAddress?: string;
}

export function SpendPermissionManager({
  isAuthenticated,
  userAddress,
}: SpendPermissionManagerProps) {
  const chainId = useChainId() as number;
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    if (isAuthenticated && userAddress) {
      loadPermissions();
    }
  }, [isAuthenticated, userAddress]);

  const loadPermissions = async () => {
    if (!userAddress) {
      console.log("❌ No userAddress provided to loadPermissions");
      return;
    }

    console.log("🔍 Starting to load permissions for user:", userAddress);
    setIsLoadingPermissions(true);
    try {
      // Get spend permission from database
      console.log("📡 Fetching spend permission from database...");
      const response = await fetch(
        `/api/spend-permission?userAddress=${encodeURIComponent(userAddress)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch spend permission: ${response.status}`);
      }

      const result = await response.json();
      console.log("📊 Database response:", result);

      if (result.success && result.data) {
        const permissionData = result.data;
        console.log("✅ Permission data from database:", permissionData);

        // Convert database data to the format expected by the UI
        const formattedPermission = {
          permissionHash: `db_${permissionData.address}_${permissionData.spend_permission_granted_at}`,
          signature: "Database stored", // We don't store the actual signature in DB
          chainId: chainId,
          permission: {
            account: permissionData.address,
            spender: permissionData.smart_account_address,
            token: permissionData.spend_permission_token,
            allowance: permissionData.spend_permission_allowance, // Already a string from DB
            period: permissionData.spend_permission_period_days,
            start: permissionData.spend_permission_granted_at,
            end: new Date(
              new Date(permissionData.spend_permission_granted_at).getTime() +
                permissionData.spend_permission_period_days *
                  24 *
                  60 *
                  60 *
                  1000
            ).toISOString(),
          },
          allowance: permissionData.spend_permission_allowance, // Already a string from DB
          grantedAt: permissionData.spend_permission_granted_at,
        };

        setPermissions([formattedPermission]);
        console.log("📋 Formatted permission:", formattedPermission);
      } else {
        console.log("⚠️ No spend permission found in database");
        setPermissions([]);
      }
    } catch (error) {
      console.error("❌ Error loading permissions:", error);
      setPermissionError(
        `Failed to load spend permissions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-sm">Sign in to manage your spend permissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          Spend Permissions
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage your active spend permissions
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingPermissions ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">
              Loading permissions...
            </span>
          </div>
        ) : permissions.length > 0 ? (
          <div className="space-y-3">
            {permissions.map((permission, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      $
                      {(
                        Number(
                          permission.permission?.allowance ||
                            permission.allowance ||
                            "0"
                        ) / 1_000_000
                      ).toFixed(2)}{" "}
                      USDC
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Daily limit • Active</div>
                      <div className="font-mono text-xs bg-white px-2 py-1 rounded border">
                        {permission.permissionHash
                          ? `${permission.permissionHash.slice(0, 10)}...`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              No active spend permissions
            </p>
            <p className="text-xs text-gray-500">
              Set up permissions in the previous step to start using the agent
            </p>
          </div>
        )}

        {permissionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {permissionError}
          </div>
        )}
      </div>

      {/* Footer */}
      {permissions.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            💡 Revoked permissions will be removed immediately
          </div>
        </div>
      )}
    </div>
  );
}
