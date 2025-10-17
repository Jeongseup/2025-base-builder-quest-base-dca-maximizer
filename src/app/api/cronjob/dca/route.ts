import { NextRequest, NextResponse } from "next/server";
import { DCAService } from "@/lib/dca-service";
import { Database } from "@/lib/database";

// Optional: Add authentication for cronjob endpoint
const CRON_SECRET = process.env.CRON_SECRET || "your-cron-secret";

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cronjob secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = authHeader?.replace("Bearer ", "");

    if (CRON_SECRET !== "your-cron-secret" && cronSecret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🚀 Starting DCA cronjob execution...");

    const startTime = Date.now();
    const stats = Database.getStats();

    console.log(
      `📊 DCA Stats: ${stats.activeDCAConfigs} active configs out of ${stats.totalDCAConfigs} total`
    );

    // Execute all eligible DCA configurations
    const result = await DCAService.executeAllEligibleDCAs();

    const executionTime = Date.now() - startTime;

    console.log(`✅ DCA cronjob completed in ${executionTime}ms`);
    console.log(
      `📈 Results: ${result.executed} executed, ${result.failed} failed`
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
      stats: {
        ...stats,
        executed: result.executed,
        failed: result.failed,
        eligibleConfigs: result.results.length,
      },
      results: result.results.map((r) => ({
        success: r.success,
        transactionHash: r.transactionHash,
        error: r.error,
      })),
    });
  } catch (error) {
    console.error("❌ DCA cronjob failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual trigger (useful for testing)
export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Manual DCA execution triggered");

    const result = await DCAService.executeAllEligibleDCAs();
    const stats = Database.getStats();

    return NextResponse.json({
      success: true,
      message: "Manual DCA execution completed",
      timestamp: new Date().toISOString(),
      stats,
      results: {
        executed: result.executed,
        failed: result.failed,
        details: result.results,
      },
    });
  } catch (error) {
    console.error("❌ Manual DCA execution failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
