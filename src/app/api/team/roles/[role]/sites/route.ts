import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCustomRole } from "@/lib/team/roles";
import { requireWorkspace } from "@/lib/team/workspace";

export async function GET(_req: Request, { params }: { params: Promise<{ role: string }> }) {
  const guard = await requireWorkspace("manageMembers");
  if (!guard.ok) return guard.response;
  const roleName = decodeURIComponent((await params).role);
  if (!isCustomRole(roleName)) return NextResponse.json({ error: "invalid_role" }, { status: 400 });

  const [sites, access] = await Promise.all([
    prisma.site.findMany({ where: { userId: guard.ws.ownerId }, orderBy: { createdAt: "asc" } }),
    prisma.roleSiteAccess.findMany({ where: { ownerId: guard.ws.ownerId, roleName }, select: { siteId: true } }),
  ]);
  return NextResponse.json({
    sites: sites.map(site => ({ id: site.id, url: site.url, siteId: site.siteId })),
    selectedSiteIds: access.map(item => item.siteId),
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ role: string }> }) {
  const guard = await requireWorkspace("manageMembers");
  if (!guard.ok) return guard.response;
  const roleName = decodeURIComponent((await params).role);
  if (!isCustomRole(roleName)) return NextResponse.json({ error: "invalid_role" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const requested = Array.isArray(body?.siteIds) ? body.siteIds.filter((id: unknown): id is string => typeof id === "string") : null;
  if (!requested) return NextResponse.json({ error: "invalid_site_ids" }, { status: 400 });

  const sites = await prisma.site.findMany({ where: { userId: guard.ws.ownerId, id: { in: requested } }, select: { id: true } });
  const allowed = new Set(sites.map((site: { id: string }) => site.id));
  const siteIds = requested.filter((id: string) => allowed.has(id));

  await prisma.$transaction([
    prisma.roleSiteAccess.deleteMany({ where: { ownerId: guard.ws.ownerId, roleName } }),
    prisma.roleSiteAccess.createMany({ data: siteIds.map((siteId: string) => ({ ownerId: guard.ws.ownerId, roleName, siteId })) }),
  ]);
  return NextResponse.json({ selectedSiteIds: siteIds });
}
