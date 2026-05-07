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
  return proxyRequest(request, path, "GET");
}

function buildProxyHeaders(request: NextRequest) {
  const headers: Record<string, string> = {
    accept: request.headers.get("accept") ?? "application/json"
  };

  const contentType = request.headers.get("content-type");

  if (contentType) {
    headers["content-type"] = contentType;
  }

  return headers;
}

async function proxyRequest(request: NextRequest, path: string[], method: "GET" | "POST" | "PATCH") {
  const upstreamUrl = buildUpstreamUrl(request, path);
  const requestBody = method === "GET" ? undefined : await request.text();
  const upstreamResponse = await fetch(upstreamUrl, {
    method,
    headers: buildProxyHeaders(request),
    body: requestBody && requestBody.length > 0 ? requestBody : undefined,
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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path, "POST");
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxyRequest(request, path, "PATCH");
}