import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { getPublicElectionResultsList } from "@/lib/services/election.service";

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const elections = await getPublicElectionResultsList();

    const response = NextResponse.json({
      success: true,
      data: elections,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching public election results:", error);

    const response = NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public election results",
      },
      { status: 500 }
    );

    return addCorsHeaders(response);
  }
}

export function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? NextResponse.json({}, { status: 200 });
}
