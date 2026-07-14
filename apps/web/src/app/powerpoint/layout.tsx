import type { Metadata } from 'next';
import { PowerPointProvider } from '@/components/powerpoint/PowerPointProvider';

export const metadata: Metadata = {
  title: 'Pulse for PowerPoint',
  description: 'Live polls and Q&A for your PowerPoint presentations — powered by Pulse.',
};

/**
 * Layout for the /powerpoint route.
 *
 * This route is served inside the PowerPoint task pane as an Office Add-in.
 * It loads Office.js from the Microsoft CDN, which is required for all Office Add-ins
 * to communicate with the PowerPoint host application.
 *
 * IMPORTANT: Office.js must be loaded from the official Microsoft CDN. Bundling it
 * locally is not supported and will cause the add-in to malfunction.
 */
export default function PowerPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/*
       * Office.js CDN script — MUST be the first script loaded.
       * This initializes the Office JavaScript API that lets our web app
       * communicate with the PowerPoint host.
       */}
      <script
        src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"
        type="text/javascript"
      />
      <PowerPointProvider>{children}</PowerPointProvider>
    </>
  );
}
