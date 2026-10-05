This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Homepage alignment

The homepage keeps SMP at the top centre, Community and FiveM as a mirrored
lower pair, and the two locked worlds at the outer edges. In
`app/components/CosmicTriadScene.tsx`, positions are fractions of the viewport
and orb sizes are limited by both its width and height. Portrait viewports
use a compact arrangement. Keep the camera centred on `[0, 0, 14.5]` so these
anchors match the screen coordinates.

Homepage-only typography and spacing live under `.cosmic-home` in
`app/globals.css`; the hero markup is in `app/components/CosmicHudOverlay.tsx`.
Check wide desktop, laptop, portrait and short landscape layouts when changing
these values. Verify that all five labels remain visible and clear of the hero
text, and that paired worlds remain aligned throughout their floating motion.

For an isolated local preview, set `NEXT_PUBLIC_API_URL` and
`NEXT_PUBLIC_WS_URL` to local test services before building. The default URLs
connect to the live backend. Publishing to the connected GitHub `main` branch
triggers Hostinger auto-deployment; local editing/building does not publish.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
