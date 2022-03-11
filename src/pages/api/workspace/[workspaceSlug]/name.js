import { TeamRole } from '@prisma/client';

import {
  validateSession,
  validateUpdateWorkspaceName,
} from '@/config/api-validation/index';
import prisma from '@/prisma/index';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    await validateSession(req, res);
    await validateUpdateWorkspaceName(req, res);
    const { name } = req.body;
    const slug = req.query.workspaceSlug;
    const workspace = await prisma.workspace.findFirst({
      select: { id: true },
      where: {
        OR: [
          { id: session.user.userId },
          {
            members: {
              some: {
                deletedAt: null,
                teamRole: TeamRole.OWNER,
                email: session.user.email,
              },
            },
          },
        ],
        AND: {
          deletedAt: null,
          slug,
        },
      },
    });

    if (workspace) {
      await prisma.workspace.update({
        data: { name },
        where: { id: workspace.id },
      });
      res.status(200).json({ data: { name } });
    } else {
      res
        .status(404)
        .json({ errors: { error: { msg: 'Unable to find workspace' } } });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
