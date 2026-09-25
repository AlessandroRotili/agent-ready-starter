# Performance defaults and recipes

The homepage is static, with system fonts and no tracking, images, video or embeds loaded by default. Session refresh is scoped to protected/auth/API routes. Lists are paginated and uploads bypass application compute: bytes go directly to Supabase with a signed upload token.

## Public media

- Use Next Image with explicit dimensions (or a stable aspect ratio), meaningful `alt` and accurate `sizes`.
- Use `loading="eager"` only for the actual above-the-fold/LCP image. Below-the-fold images stay lazy. Inspect network requests to ensure mobile does not fetch desktop originals.
- Generate appropriately sized WebP/AVIF assets before publishing. This version does not include a public gallery upload/resizing pipeline.
- `next.config.ts` accepts public Storage images only from the configured Supabase host. Private bucket objects must not go through a public shared image pipeline.
- `/media/immutable/*` receives long-lived immutable cache headers. Use content hashes/versioned filenames there; changing bytes means a new URL. Other files do not inherit this policy.
- For slideshows/marquees, bound the number and dimensions of images; avoid fetching full-resolution duplicates and suspend animation outside the viewport.

`components/media/ambient-video.tsx` is an optional decorative video component. It initially renders a responsive poster and only creates the video element while visible, the tab is active, reduced motion is off and supported connection hints allow playback. Outside those conditions it unmounts the video. A pause button is provided. Poster and video are mutually exclusive to avoid the hero overlay regression. Use a compressed, short, silent asset; this component does not transcode it or guarantee cancellation of bytes already in flight. Use a separate controls/captions player for meaningful video content.

Load third-party embeds only after explicit interaction/consent where needed. The starter includes no analytics or consent manager because it installs no tracking scripts.

## Measure each application

Before/after a change, measure a production build with cold browser cache on desktop and a mobile viewport. Record LCP, CLS, responsiveness, JS/media transfer and requests. Test reduced motion, data saving, background tab and offscreen media. Check that personal responses are `private, no-store` and public pages do not refresh auth cookies.

Record the deployment URL, commit, date, device/network conditions and raw reports in a project-specific audit. Do not reuse performance numbers from the original app as evidence for a new app. Distinguish hosting transfer from Supabase egress; moving bytes changes which provider serves them, not necessarily total cost.
