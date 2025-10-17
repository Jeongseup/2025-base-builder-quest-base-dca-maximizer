import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/database";
import { DCAService } from "@/lib/dca-service";

export async function GET(request: NextRequest) {
  try {
    // Get user address from query parameters
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    // Get user's DCA configurations
    const configs = Database.getUserDCAConfigs(userAddress);

    return NextResponse.json({
      success: true,
      configs: configs.map((config) => ({
        id: config.id,
        targetToken: config.targetToken,
        amountUSD: config.amountUSD,
        frequency: config.frequency,
        isActive: config.isActive,
        lastExecutedAt: config.lastExecutedAt,
        totalExecutions: config.totalExecutions,
        totalAmountSpent: config.totalAmountSpent,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get DCA configs error:", error);
    return NextResponse.json(
      { error: "Failed to get DCA configurations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, targetToken, amountUSD, frequency } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    // Validate input
    if (!targetToken || !amountUSD || !frequency) {
      return NextResponse.json(
        {
          error: "Missing required fields: targetToken, amountUSD, frequency",
        },
        { status: 400 }
      );
    }

    if (!["daily", "weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        {
          error: "Invalid frequency. Must be: daily, weekly, or monthly",
        },
        { status: 400 }
      );
    }

    if (amountUSD <= 0 || amountUSD > 1000) {
      return NextResponse.json(
        {
          error: "Invalid amount. Must be between $0.01 and $1000",
        },
        { status: 400 }
      );
    }

    // Create DCA configuration
    const config = await DCAService.createDCAConfig(userAddress, {
      targetToken,
      amountUSD,
      frequency,
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        targetToken: config.targetToken,
        amountUSD: config.amountUSD,
        frequency: config.frequency,
        isActive: config.isActive,
        createdAt: config.createdAt,
      },
    });
  } catch (error) {
    console.error("Create DCA config error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create DCA configuration",
      },
      { status: 500 }
    );
  }
}
