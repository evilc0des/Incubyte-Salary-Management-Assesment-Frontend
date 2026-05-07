import { NextRequest, NextResponse } from "next/server";

import { resolveApiBaseUrl } from "../../../../lib/dashboard-api";

export const dynamic = "force-dynamic";

function buildUpstreamUrl(request: NextRequest, path: string[]) {
  const upstreamBaseUrl = resolveApiBaseUrl({ serverSide: true });
  const normalizedBaseUrl = upstreamBaseUrl.endsWith("/") ? upstreamBaseUrl : `${upstreamBaseUrl}/`;
  const upstreamUrl = new URL(path.join("/"), normalizedBaseUrl);

  upstreamUrl.search = request.nextUrl.search;

  return upstreamUrl;
}

async function proxyGetRequest(request: NextRequest, path: string[]) {
  const upstreamUrl = buildUpstreamUrl(request, path);
  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
    },
    cache: "no-store",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyGetRequest(request, path);
}