import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCustomRole } from "@/lib/team/roles";
import { ALL_ROLE_TOOL_HREFS } from "@/lib/seo/toolAccess";
import { getWorkspace } from "@/lib/team/workspace";

export async function GET() {
  const workspace = await getWorkspace();
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isCustomRole(workspace.role)) return NextResponse.json({ all: true, toolHrefs: ALL_ROLE_TOOL_HREFS });
  const access = await prisma.roleToolAccess.findMany({ where: { ownerId: workspace.ownerId, roleName: workspace.role }, select: { toolHref: true } });
  return NextResponse.json({ all: false, toolHrefs: access.map(item => item.toolHref) });
}
