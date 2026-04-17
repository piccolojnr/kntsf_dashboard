import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, Document } from "@react-pdf/renderer";
import React, { type ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/auth/auth";
import { getRole } from "@/lib/role";
import { getElectionResults } from "@/lib/services/election.service";
import { ElectionPdfDocument } from "@/components/app/election/election-pdf";

interface ExportPdfRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: ExportPdfRouteContext) {
  // Auth — executives and above only
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const { isExecutive } = await getRole({ user });
  if (!isExecutive) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const electionId = Number.parseInt((await params).id, 10);
  if (Number.isNaN(electionId)) {
    return NextResponse.json({ success: false, error: "Invalid election ID" }, { status: 400 });
  }

  let election: any;
  try {
    election = await getElectionResults(electionId, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch election";
    const status = message === "Election not found" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }

  const element = React.createElement(ElectionPdfDocument, {
    election,
  }) as unknown as ReactElement<DocumentProps, typeof Document>;

  const buffer = await renderToBuffer(element);

  const filename = `election-results-${election.id}-${election.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
