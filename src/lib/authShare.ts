import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isCustomRole } from '@/lib/team/roles';
import { getWorkspace } from '@/lib/team/workspace';

export async function verifyAuthOrShare(
  req: Request,
  siteIdOrDomain: string,
  isDomain = false
): Promise<{ userId: string; site: any } | null> {
  const session = await getServerSession(authOptions);
  const loggedInUserId = (session?.user as any)?.id as string | undefined;

  const { searchParams } = new URL(req.url);
  const shareToken = searchParams.get('shareToken') ?? undefined;

  if (shareToken) {
    const site = await prisma.site.findFirst({
      where: {
        shareToken,
        shareEnabled: true,
        ...(isDomain ? { url: siteIdOrDomain } : { id: siteIdOrDomain }),
      },
    });
    if (site) {
      return { userId: site.userId, site };
    }
  }

  if (loggedInUserId) {
    const workspace = await getWorkspace();
    const userId = workspace?.ownerId ?? loggedInUserId;
    const site = await prisma.site.findFirst({
      where: {
        userId,
        ...(isDomain ? { url: siteIdOrDomain } : { id: siteIdOrDomain }),
      },
    });
    if (site) {
      if (workspace && isCustomRole(workspace.role)) {
        const access = await prisma.roleSiteAccess.findFirst({
          where: { ownerId: workspace.ownerId, roleName: workspace.role, siteId: site.id },
          select: { id: true },
        });
        if (!access) return null;
      }
      return { userId, site };
    }
  }

  return null;
}
