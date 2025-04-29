import { NextResponse } from "next/server";
import { scanReceipt } from "@/actions/transaction";
import { db } from "@/lib/prisma";
import { jwtVerify } from "jose";

// Secret key for verifying tokens - must match the one used for generation
const SECRET_KEY = new TextEncoder().encode(process.env.TOKEN_SECRET || "finbox-receipt-scanner-secret-key");

// Verify the JWT token from the Authorization header
async function verifyToken(req) {
  try {
    // Check for Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { valid: false, error: "Missing or invalid Authorization header" };
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return { valid: false, error: "No token provided" };
    }

    // Verify the token
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    // Get the user from the database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return { valid: false, error: "User not found" };
    }

    return { valid: true, user };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, error: error.message };
  }
}

export async function POST(req) {
  try {
    // Verify the token
    const { valid, user, error } = await verifyToken(req);
    if (!valid) {
      return NextResponse.json(
        { error: error || "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the form data
    const formData = await req.formData();
    const file = formData.get("receipt");
    
    if (!file) {
      return NextResponse.json(
        { error: "No receipt file provided" },
        { status: 400 }
      );
    }

    // Scan the receipt
    const result = await scanReceipt(file);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Receipt scanner API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan receipt" },
      { status: 500 }
    );
  }
}

// Special endpoint for token validation - just returns success if token is valid
export async function GET(req) {
  try {
    const { valid, error } = await verifyToken(req);
    
    if (!valid) {
      return NextResponse.json(
        { error: error || "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token is valid"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
