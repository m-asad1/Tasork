import { redirect } from 'next/navigation';

/**
 * Public marketing links point to /submit-project (matches the "Submit a
 * Project" brand language in docs/01_Project_Identity.md). Guests are routed
 * through auth first; the middleware sends unauthenticated users to /login
 * with a redirect back here once they're signed in.
 */
export default function SubmitProjectRedirect() {
  redirect('/dashboard/projects/new');
}
