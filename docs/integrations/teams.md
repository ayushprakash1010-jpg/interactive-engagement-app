# Microsoft Teams Integration Guide

## Overview

Pulse integrates with Microsoft Teams as a **meeting side panel** (meeting app) and **personal/channel tab**, embedding the existing host dashboard and participant event views directly inside Teams. The integration uses the [Teams JS SDK v2](https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/using-teams-client-sdk) for context detection and SSO.

---

## Architecture

```
Teams Client (Desktop / Web / Mobile)
    │
    │  Teams JS SDK (reads meetingId, userId, tenantId)
    ▼
/teams  (Next.js page — served from your ngrok/tunnel URL)
    │
    │  /api/teams/context-to-event  (Next.js → NestJS proxy)
    ▼
NestJS TeamsModule
    │
    ├── Match meeting → IEP Event via MongoDB
    └── Auto-create event if host recognized
```

---

## Teams App Manifest (`manifest.json`)

Replace all `{{PLACEHOLDER}}` values before sideloading.

```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.17/MicrosoftTeams.schema.json",
  "manifestVersion": "1.17",
  "version": "1.0.0",
  "id": "{{YOUR_APP_ID}}",
  "packageName": "app.pulse.iep",
  "developer": {
    "name": "Pulse IEP",
    "websiteUrl": "{{YOUR_NGROK_URL}}",
    "privacyUrl": "{{YOUR_NGROK_URL}}/privacy",
    "termsOfUseUrl": "{{YOUR_NGROK_URL}}/terms"
  },
  "name": {
    "short": "Pulse",
    "full": "Pulse — Live Audience Engagement"
  },
  "description": {
    "short": "Live polls, Q&A and quizzes in your meeting.",
    "full": "Run live polls, anonymous Q&A, and interactive quizzes directly inside your Microsoft Teams meeting — no downloads or sign-ups for participants."
  },
  "icons": {
    "color": "color.png",
    "outline": "outline.png"
  },
  "accentColor": "#6264A7",
  "configurableTabs": [],
  "staticTabs": [
    {
      "entityId": "pulse-home",
      "name": "Pulse",
      "contentUrl": "{{YOUR_NGROK_URL}}/teams",
      "websiteUrl": "{{YOUR_NGROK_URL}}/teams",
      "scopes": ["personal"]
    }
  ],
  "meetingExtensionDefinition": {
    "scenes": [],
    "supportsStreaming": false
  },
  "configurableTabContexts": [],
  "permissions": ["identity", "messageTeamMembers"],
  "validDomains": [
    "{{YOUR_NGROK_DOMAIN}}",
    "*.loca.lt"
  ],
  "webApplicationInfo": {
    "id": "{{YOUR_AZURE_AD_APP_CLIENT_ID}}",
    "resource": "api://{{YOUR_NGROK_DOMAIN}}/{{YOUR_AZURE_AD_APP_CLIENT_ID}}"
  },
  "authorization": {
    "permissions": {
      "resourceSpecific": [
        {
          "name": "OnlineMeeting.ReadBasic.Chat",
          "type": "Application"
        }
      ]
    }
  }
}
```

---

## Setup Steps

### Step 1: Create Azure AD App Registration

1. Go to [Azure Portal → App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps).
2. Click **New registration**.
   - Name: `Pulse IEP`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: `Web` → `https://{{YOUR_NGROK_URL}}/api/teams/callback`
3. Copy the **Application (client) ID** — this is your `TEAMS_CLIENT_ID`.
4. Under **Certificates & Secrets**, create a new client secret. Copy it — this is your `TEAMS_CLIENT_SECRET`.
5. Under **API Permissions**, add:
   - `User.Read` (Microsoft Graph, Delegated)
   - `openid`, `profile`, `email`, `offline_access` (OpenID Connect)

### Step 2: Configure Environment Variables

Add to `apps/api/.env`:
```env
TEAMS_CLIENT_ID=your-azure-ad-app-client-id
TEAMS_CLIENT_SECRET=your-client-secret
TEAMS_REDIRECT_URI=https://your-ngrok-url.ngrok-free.app/api/teams/callback
```

Add to `apps/web/.env.local`:
```env
# No additional env vars needed — the /api/teams/* proxy handles routing
```

### Step 3: Build the Teams App Package

Create a folder with these files:
```
pulse-teams-app/
├── manifest.json     (filled from above)
├── color.png         (192×192 px app icon)
└── outline.png       (32×32 px monochrome icon)
```

Zip the folder contents (not the folder itself):
```bash
cd pulse-teams-app && zip -r ../pulse-app.zip .
```

### Step 4: Sideload the App in Teams

1. Open Microsoft Teams Desktop.
2. Go to **Apps** → **Manage your apps** → **Upload an app** → **Upload a custom app**.
3. Select `pulse-app.zip`.
4. The Pulse app will appear in your apps list.

### Step 5: Test in a Meeting

1. Start or join a Teams meeting.
2. Click **Apps** in the meeting toolbar.
3. Find **Pulse** and click **Add**.
4. The Teams side panel opens at `{{YOUR_NGROK_URL}}/teams`.
5. The SDK auto-detects the `meetingId` and `userId`.
6. If the host has connected their Teams account via Settings, the event auto-links and the participant view loads.
7. If not linked yet, the "Join an Event" code entry form appears.

---

## Enterprise SSO (Auth0 Enterprise Connections)

Auth0 Enterprise Connections broker SAML/OIDC with customer IdPs (Okta, Azure AD, Google Workspace, PingIdentity, etc.) natively. No additional backend code is required in Pulse.

### How it works

1. An organization's IT admin goes to the **Auth0 Dashboard → Authentication → Enterprise**.
2. They create a new connection (e.g. **Okta**, **SAML**, or **Azure AD**).
3. They configure their IdP with the Auth0 callback URL Auth0 provides.
4. Auth0 handles all token exchange and user profile mapping.
5. When a Pulse host from that organization clicks **Log In**, Auth0 automatically routes them through SSO.
6. The user arrives in Pulse with a `samlp|...` or `waad|...` `auth0Sub`, which the `UsersService` stores as normal — no code change required.

### Auth0 Dashboard Steps

1. **Auth0 Dashboard** → **Authentication** → **Enterprise** → select provider (e.g., Microsoft Azure AD).
2. Fill in the tenant domain, Client ID and Secret from your Azure AD app.
3. Enable the connection for the **Pulse IEP** application.
4. Set **Home Realm Discovery** domain (e.g., `yourcompany.com`) so Auth0 knows which users to route to SSO.

### What Pulse already supports

| Feature | Status |
|---|---|
| Email/password login | ✅ Working |
| Google social login | ✅ Working |
| Enterprise SAML SSO | ✅ Auth0 handles — just configure |
| Enterprise OIDC (Azure AD) | ✅ Auth0 handles — just configure |
| Anonymous participant join | ✅ Unchanged |
| SSO for participants | ❌ Participants are always anonymous |

---

## API Reference

All Teams endpoints are proxied through Next.js rewrites (`/api/teams/*` → `localhost:4000/api/teams/*`).

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/teams/authorize` | JWT required | Returns Microsoft OAuth URL for the logged-in host |
| `GET` | `/api/teams/callback` | None (OAuth) | Exchanges auth code, saves integration, redirects to settings |
| `GET` | `/api/teams/context-to-event` | None | Finds/creates IEP event for a Teams meeting |
| `GET` | `/api/teams/link-meeting` | None | Links a meeting ID to an event code manually |
| `GET` | `/api/teams/status` | None | Returns `{ configured: boolean }` |
