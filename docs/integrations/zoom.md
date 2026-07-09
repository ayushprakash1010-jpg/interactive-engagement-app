# Zoom Integration

This document outlines the architecture, setup, and Marketplace requirements for the Interactive Engagement Platform (IEP) Zoom App.

## Architecture

The Zoom integration follows the "Slido approach" to embed IEP directly inside video-conferencing tools without requiring a separate codebase.

1. **OAuth Flow**: Hosts connect their Zoom account via the IEP Dashboard. We use standard OAuth to retrieve and store `zoomUserId` and `zoomRefreshToken` on the `User` schema.
2. **Context Mapping**: The backend maps a Zoom `meetingId` to an IEP `Event` through the `/api/zoom/context-to-event` endpoint.
3. **App Embed**: The frontend imports `@zoom/appssdk` via a `ZoomProvider`. If the `isZoom` context is true:
    - We hide standard navigation and web-only UI elements.
    - We auto-join participants using the Zoom user's context as the `anonId` (bypassing the join screen).

## Zoom Marketplace App Manifest Requirements

To publish or install the IEP Zoom App, you must configure your Zoom App build with the following settings in the Zoom Marketplace Developer Portal.

### Basic Information
- **App Name**: Pulse / IEP
- **Short Description**: Interactive Engagement Platform for live polling and Q&A.

### OAuth Information
- **Redirect URL for OAuth**: `https://<YOUR_API_DOMAIN>/api/zoom/callback`
- **OAuth Allow List**: `https://<YOUR_API_DOMAIN>`

### Features -> Zoom App
- **Home URL**: `https://<YOUR_WEB_DOMAIN>/zoom` (The entry point that handles auto-join)
- **Domain Allow List**: 
  - `https://<YOUR_WEB_DOMAIN>`
  - `https://<YOUR_API_DOMAIN>`
  - `wss://<YOUR_API_DOMAIN>` (for Socket.IO)

### Scopes
The app requires the following scopes to function:
1. `zoomapp:inmeeting` - Required to render the app inside a meeting panel.
2. `user:read` - Required to fetch the host's profile during OAuth setup.

### Embedded App Config
- The app should be configured as an **In-Meeting** app, rendering in the side panel.

## Local Development
Since Zoom requires HTTPS, you MUST use a tunneling service like Ngrok for local development.

1. Tunnel your frontend (e.g., `ngrok http 3000`)
2. Tunnel your backend (e.g., `ngrok http 4000`)
3. Update `ZOOM_REDIRECT_URI` and the App Manifest Home URL to use these ngrok URLs.
