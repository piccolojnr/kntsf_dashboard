import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { getElectionBallot } from "@/lib/services/election.service";

interface ElectionRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: ElectionRouteContext) {
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

    const election = await getElectionBallot(electionId);

    const response = NextResponse.json({
      success: true,
      data: election,
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching election ballot:", error);

    const response = NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch election ballot",
      },
      { status: 500 }
    );

    return addCorsHeaders(response);
  }
}

export function OPTIONS(request: NextRequest) {
  return handleCors(request) ?? NextResponse.json({}, { status: 200 });
}
