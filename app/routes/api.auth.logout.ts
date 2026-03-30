import { destroyUserSession } from "~/lib/auth";

export async function action({ request }: { request: Request }) {
  return destroyUserSession(request);
}
