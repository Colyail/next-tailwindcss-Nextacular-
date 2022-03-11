import { validateAddDomain, validateSession } from '@/config/api-validation';
import api from '@/lib/common/api';
import { createDomain, deleteDomain } from '@/prisma/services/domain';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    await validateSession(req, res);
    await validateAddDomain(req, res);
    const { domainName } = req.body;
    const teamId = process.env.VERCEL_TEAM_ID;
    const response = await api(
      `${process.env.VERCEL_API_URL}/v8/projects/${
        process.env.VERCEL_PROJECT_ID
      }/domains${teamId ? `?teamId=${teamId}` : ''}`,
      {
        body: { name: domainName },
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
        },
        method: 'POST',
      }
    );

    if (!response.error) {
      await createDomain(
        session.user.userId,
        session.user.email,
        req.query.workspaceSlug,
        domainName
      );
      res.status(200).json({ data: { domain: domainName } });
    } else {
      res
        .status(response.status)
        .json({ errors: { error: { msg: response.error.message } } });
    }
  } else if (method === 'DELETE') {
    await validateSession(req, res);
    const { domainName } = req.body;
    const teamId = process.env.VERCEL_TEAM_ID;
    await api(
      `${process.env.VERCEL_API_URL}/v8/projects/${
        process.env.VERCEL_PROJECT_ID
      }/domains/${domainName}${teamId ? `?teamId=${teamId}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_BEARER_TOKEN}`,
        },
        method: 'DELETE',
      }
    );
    await deleteDomain(
      session.user.userId,
      session.user.email,
      req.query.workspaceSlug,
      domainName
    );
    res.status(200).json({ data: { domain: domainName } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
