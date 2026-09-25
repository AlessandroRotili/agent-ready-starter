# Media, caching and resource budgets

Defaults: static public landing; system fonts; no trackers, videos, animations or embeds downloaded by default; bounded content lists; no public caching of personal data; versioned immutable media URLs. Tailwind compiles the utilities used by the app.

## Images

`npm run media:optimize -- path/to/image.jpg` produces 480/960/1600 WebP+AVIF variants under public/media/immutable. Filenames include a hash of the original and pipeline version. Metadata is stripped by the image pipeline and dimensions are recorded in a JSON manifest. Original private documents must never be fed to this public pipeline.

Use ResponsiveImage for generated variants, with correct intrinsic dimensions and sizes. Use Next Image for originals/remote public images with an allowlisted host. Do not run both optimizers on the same variants. Eager loading is reserved for the actual above-the-fold LCP image; everything else stays lazy. Changing immutable bytes requires a new URL.

AmbientVideo initially renders a poster; video is mounted only while visible and allowed by reduced-motion/data-saving hints. It includes a pause button and mutually exclusive poster/video layers. Optimize the asset separately; do not assume visibility logic can undo bytes already transferred. Use captions/controls for meaningful video content.

Carousels must bound slide counts/dimensions and avoid duplicate full-resolution downloads. Third-party embeds load after deliberate interaction/consent where needed. Test mobile, reduced motion, slow networks and background tabs.

## Cache

Public content uses the public-content tag with a 300-second revalidation policy; only published anonymous rows enter it. Invalidate after a successful publication change. Generic/private services are not shared-cached. Supabase session refresh is scoped to auth/account/admin/API routes; static public pages do not refresh cookies.

## Verification

Measure a production build, cold cache, with recorded viewport/network settings: LCP, CLS, responsiveness, JS/media bytes and request count. Compare before/after reports for each app. Track hosting transfer and database/storage egress separately. Define the product's budgets in PROJECT.md; a free hosting tier cannot be guaranteed by a template.
