# some-webapp

Next.js (App Router) frontend for the SoMe posts API, replacing the original
Expo/React Native app in `some-mobileapp`.

## Running

```bash
npm install
npm run dev
```

The Feed page fetches posts server-side from the NestJS backend
(`some-backend`, default `http://localhost:3006`). Set `BACKEND_URL` in a
`.env.local` file to point elsewhere.
