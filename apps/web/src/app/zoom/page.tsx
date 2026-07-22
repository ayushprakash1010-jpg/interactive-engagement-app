import { headers } from 'next/headers';
import crypto from 'crypto';
import ZoomClient from './zoom-client';

function decryptZoomContext(context: string, clientSecret: string) {
  try {
    const buffer = Buffer.from(context, 'base64url');
    const iv = buffer.subarray(0, 16);
    const aadLength = buffer.readUInt16LE(16);
    const aad = buffer.subarray(18, 18 + aadLength);
    const payload = buffer.subarray(18 + aadLength, buffer.length - 16);
    const authTag = buffer.subarray(buffer.length - 16);
    
    const hash = crypto.createHash('sha256').update(clientSecret).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', hash, iv);
    decipher.setAAD(aad);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(payload, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (e) {
    console.error('Failed to decrypt Zoom App Context:', e);
    return null;
  }
}

export default function ZoomPage() {
  const headersList = headers();
  const zoomContext = headersList.get('x-zoom-app-context');
  
  // If the Zoom Client sends the context header, we must validate it.
  if (zoomContext) {
    const secret = process.env.ZOOM_CLIENT_SECRET;
    
    if (!secret) {
      console.warn('x-zoom-app-context received but ZOOM_CLIENT_SECRET is missing. Cannot decrypt.');
    } else {
      const decrypted = decryptZoomContext(zoomContext, secret);
      
      // If decryption fails, it means the request was spoofed or the secret is wrong.
      // Zoom requires us to reject invalid requests.
      if (!decrypted) {
         return (
           <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-surface to-surface-sunken p-6 text-center text-destructive">
             <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 shadow-lg">
               <h2 className="mb-2 text-xl font-bold">Invalid Security Context</h2>
               <p className="text-sm opacity-80">Failed to validate the authenticity of the Zoom App request.</p>
             </div>
           </div>
         );
      }
      
      // Successfully decrypted.
      // (Optional) We could pass the decrypted context to the client, but the client 
      // already uses the Zoom Apps SDK to get context, so we just proceed to render.
    }
  }

  // Render the interactive client app
  return <ZoomClient />;
}
