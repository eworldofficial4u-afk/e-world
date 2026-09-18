import { json } from '../../_lib/auth.js';

export function onRequest() {
  return json({ error: 'Discord OAuth login is disabled' }, 410);
}
