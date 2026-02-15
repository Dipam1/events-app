import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/api-middleware";

/**
 * TODO: Implement video listing endpoint
 * This endpoint should return videos for the authenticated user
 */
export async function GET(req: NextRequest) {
	const authResult = await requireAuth();
	if (isAuthError(authResult)) return authResult.error;
	
	// TODO: Implement video fetching logic
	return NextResponse.json({ 
		message: "Video listing endpoint - implementation pending",
		userId: authResult.session.user.id 
	});
}