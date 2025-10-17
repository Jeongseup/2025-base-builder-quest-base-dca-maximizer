import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const config = Database.getDCAConfig(params.id);
    if (!config) {
      return NextResponse.json(
        { error: "DCA configuration not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (config.userAddress !== userAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      config: {
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
      },
    });
  } catch (error) {
    console.error("Get DCA config error:", error);
    return NextResponse.json(
      { error: "Failed to get DCA configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userAddress, ...updates } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    const config = Database.getDCAConfig(params.id);
    if (!config) {
      return NextResponse.json(
        { error: "DCA configuration not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (config.userAddress !== userAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate updates
    const { targetToken, amountUSD, frequency, isActive } = updates;

    if (targetToken !== undefined) {
      updates.targetToken = targetToken;
    }

    if (amountUSD !== undefined) {
      if (amountUSD <= 0 || amountUSD > 1000) {
        return NextResponse.json(
          {
            error: "Invalid amount. Must be between $0.01 and $1000",
          },
          { status: 400 }
        );
      }
      updates.amountUSD = amountUSD;
    }

    if (frequency !== undefined) {
      if (!["daily", "weekly", "monthly"].includes(frequency)) {
        return NextResponse.json(
          {
            error: "Invalid frequency. Must be: daily, weekly, or monthly",
          },
          { status: 400 }
        );
      }
      updates.frequency = frequency;
    }

    if (isActive !== undefined) {
      updates.isActive = isActive;
    }

    const updatedConfig = Database.updateDCAConfig(params.id, updates);

    return NextResponse.json({
      success: true,
      config: {
        id: updatedConfig!.id,
        targetToken: updatedConfig!.targetToken,
        amountUSD: updatedConfig!.amountUSD,
        frequency: updatedConfig!.frequency,
        isActive: updatedConfig!.isActive,
        lastExecutedAt: updatedConfig!.lastExecutedAt,
        totalExecutions: updatedConfig!.totalExecutions,
        totalAmountSpent: updatedConfig!.totalAmountSpent,
        createdAt: updatedConfig!.createdAt,
        updatedAt: updatedConfig!.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update DCA config error:", error);
    return NextResponse.json(
      { error: "Failed to update DCA configuration" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const config = Database.getDCAConfig(params.id);
    if (!config) {
      return NextResponse.json(
        { error: "DCA configuration not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (config.userAddress !== userAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deleted = Database.deleteDCAConfig(params.id);

    return NextResponse.json({
      success: deleted,
      message: deleted
        ? "DCA configuration deleted successfully"
        : "Failed to delete DCA configuration",
    });
  } catch (error) {
    console.error("Delete DCA config error:", error);
    return NextResponse.json(
      { error: "Failed to delete DCA configuration" },
      { status: 500 }
    );
  }
}
