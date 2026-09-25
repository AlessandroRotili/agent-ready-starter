# syntax=docker/dockerfile:1
FROM node:__NODE_VERSION__-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install --global npm@12.1.0 --no-fund

# Source is mounted by Compose; dependencies stay in a named volume.
FROM base AS development
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

# Optional browser tooling, excluded from the production image.
FROM development AS browser
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npm exec --yes --package=playwright@__PLAYWRIGHT_VERSION__ -- playwright install --with-deps chromium

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-fund

FROM dependencies AS builder
COPY . .
# Only public configuration is allowed in build args. No DB/admin secrets.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_MEDIA_ORIGIN
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_MEDIA_ORIGIN=$NEXT_PUBLIC_MEDIA_ORIGIN \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
RUN mkdir -p public && npm run build

FROM node:__NODE_VERSION__-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
