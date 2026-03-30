import { destroyUserSession } from '~/lib/auth.server';

export async function action({ request }: { request: Request }) {
  return destroyUserSession(request);
}
