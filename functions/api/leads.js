import { handleCloudflareLead } from '../../cloudflare/leads.mjs';

export const onRequest = context => handleCloudflareLead(context.request, context.env, context);
