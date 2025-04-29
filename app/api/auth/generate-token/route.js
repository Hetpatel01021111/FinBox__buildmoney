import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { SignJWT } from "jose";

// Secret key for signing tokens - in production, use a proper secret from environment variables
const SECRET_KEY = new TextEncoder().encode(process.env.TOKEN_SECRET || "finbox-receipt-scanner-secret-key");

// Handle GET request for token generation via web interface
export async function GET(req) {
  try {
    // Use Clerk's auth() to get the authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the user from the database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create a JWT token that expires in 30 days
    const token = await new SignJWT({ 
      userId: user.id,
      clerkUserId: userId
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(SECRET_KEY);

    return NextResponse.json({
      success: true,
      token,
      expiresIn: "30 days"
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
