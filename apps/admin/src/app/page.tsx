import { redirect } from 'next/navigation';

/** Root redirects to the Workspace Launcher. */
export default function RootPage() {
  redirect('/home');
}
