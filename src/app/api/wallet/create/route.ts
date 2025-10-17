import { NextRequest, NextResponse } from "next/server";
import { createServerWalletForUser, getServerWalletForUser } from "@/lib/cdp";
import { Database } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    // Get user address from request body
    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 }
      );
    }

    // Get or create server wallet for user
    let serverWallet = getServerWalletForUser(userAddress);
    if (!serverWallet?.smartAccount) {
      serverWallet = await createServerWalletForUser(userAddress);
    }

    // Store/update user in database
    let user = Database.getUser(userAddress);
    if (!user) {
      user = Database.createUser({
        address: userAddress,
        serverWalletAddress: serverWallet.address,
        smartAccountAddress: serverWallet.smartAccount?.address || "",
      });
    } else {
      // Update existing user with server wallet info
      user = Database.updateUser(userAddress, {
        serverWalletAddress: serverWallet.address,
        smartAccountAddress: serverWallet.smartAccount?.address || "",
      });
    }

    return NextResponse.json({
      ok: true,
      serverWalletAddress: serverWallet.address,
      smartAccountAddress: serverWallet.smartAccount?.address,
      message: "Server wallet ready",
    });
  } catch (error) {
    console.error("Server wallet creation error:", error);
    return NextResponse.json(
      { error: "Failed to create server wallet" },
      { status: 500 }
    );
  }
}

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

    // Get existing server wallet for user
    const serverWallet = getServerWalletForUser(userAddress);

    return NextResponse.json({
      ok: true,
      serverWalletAddress: serverWallet?.address || null,
      smartAccountAddress: serverWallet?.smartAccount?.address || null,
      exists: !!serverWallet,
    });
  } catch (error) {
    console.error("Server wallet fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch server wallet" },
      { status: 500 }
    );
  }
}
