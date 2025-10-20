import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { isValid: false, reason: "Invalid request" },
        { status: 400 }
      );
    }

    // Validate the code using Convex
    const result = await convex.query(api.inviteCodes.validateCode, { code });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating invite code:", error);
    return NextResponse.json(
      { isValid: false, reason: "Server error" },
      { status: 500 }
    );
  }
}
