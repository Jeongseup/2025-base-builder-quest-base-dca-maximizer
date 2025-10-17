import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dca_database.sqlite");
const db = new Database(dbPath);

export async function POST(request: NextRequest) {
  try {
    const {
      userAddress,
      spenderAddress,
      token,
      allowance,
      periodInDays,
      permissionData,
    } = await request.json();

    if (
      !userAddress ||
      !spenderAddress ||
      !token ||
      !allowance ||
      !periodInDays
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update or insert user with spend permission data
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (
        address, 
        server_wallet_address, 
        smart_account_address, 
        spend_permission_token, 
        spend_permission_allowance, 
        spend_permission_period_days, 
        spend_permission_granted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userAddress,
      spenderAddress, // server_wallet_address
      spenderAddress, // smart_account_address (same as server wallet in this case)
      token,
      allowance, // Already a string from the request
      periodInDays,
      new Date().toISOString()
    );

    console.log("Spend permission saved to database:", {
      userAddress,
      spenderAddress,
      token,
      allowance,
      periodInDays,
      permissionData,
    });

    return NextResponse.json({
      success: true,
      message: "Spend permission saved successfully",
      data: {
        id: result.lastInsertRowid,
        userAddress,
        spenderAddress,
        token,
        allowance,
        periodInDays,
      },
    });
  } catch (error) {
    console.error("Error saving spend permission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save spend permission" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: "User address is required" },
        { status: 400 }
      );
    }

    // Get user's spend permission data
    const stmt = db.prepare(`
      SELECT 
        address,
        server_wallet_address,
        smart_account_address,
        spend_permission_token,
        spend_permission_allowance,
        spend_permission_period_days,
        spend_permission_granted_at,
        created_at
      FROM users 
      WHERE address = ?
    `);

    const user = stmt.get(userAddress);

    if (!user) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No spend permission found for this user",
      });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching spend permission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch spend permission" },
      { status: 500 }
    );
  }
}
