import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { getElectionResults } from "@/lib/services/election.service";

interface ElectionResultsRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: ElectionResultsRouteContext) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const electionId = Number.parseInt((await params).id, 10);

    if (Number.isNaN(electionId)) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Invalid election ID",
        },
        { status: 400 }
      );

      return addCorsHeaders(response);
    }

    const election = await getElectionResults(electionId);

    const response = NextResponse.json({
      success: true,
      data: election,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching election results:", error);

    const message = error instanceof Error ? error.message : "Failed to fetch election results";
    const status = message === "Election not found" ? 404 : 400;
    const response = NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );

    return addCorsHeaders(response);
  }
}

export function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? NextResponse.json({}, { status: 200 });
}
