import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCustomRole } from "@/lib/team/roles";
import { ALL_ROLE_TOOL_HREFS } from "@/lib/seo/toolAccess";
import { requireWorkspace } from "@/lib/team/workspace";

export async function GET(_req: Request, { params }: { params: Promise<{ role: string }> }) {
  const guard = await requireWorkspace("manageMembers");
  if (!guard.ok) return guard.response;
  const roleName = decodeURIComponent((await params).role);
  if (!isCustomRole(roleName)) return NextResponse.json({ error: "invalid_role" }, { status: 400 });
  const access = await prisma.roleToolAccess.findMany({ where: { ownerId: guard.ws.ownerId, roleName }, select: { toolHref: true } });
  return NextResponse.json({ toolHrefs: access.map(item => item.toolHref) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ role: string }> }) {
  const guard = await requireWorkspace("manageMembers");
  if (!guard.ok) return guard.response;
  const roleName = decodeURIComponent((await params).role);
  if (!isCustomRole(roleName)) return NextResponse.json({ error: "invalid_role" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const toolHrefs = Array.isArray(body?.toolHrefs)
    ? body.toolHrefs.filter((href: unknown): href is string => ALL_ROLE_TOOL_HREFS.includes(href as typeof ALL_ROLE_TOOL_HREFS[number]))
    : null;
  if (!toolHrefs) return NextResponse.json({ error: "invalid_tool_hrefs" }, { status: 400 });

  await prisma.$transaction([
    prisma.roleToolAccess.deleteMany({ where: { ownerId: guard.ws.ownerId, roleName } }),
    prisma.roleToolAccess.createMany({ data: toolHrefs.map((toolHref: string) => ({ ownerId: guard.ws.ownerId, roleName, toolHref })) }),
  ]);
  return NextResponse.json({ toolHrefs });
}
