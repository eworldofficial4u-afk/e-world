import { json } from '../../_lib/auth.js';

export function onRequest() {
  return json({ error: 'Discord OAuth callback is disabled' }, 410);
}
