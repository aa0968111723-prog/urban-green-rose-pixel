# Production image for Zeabur / any Docker host.
# This app's Vite config defaults to Nitro's Vercel preset (.vercel/output).
# Zeabur's auto builder then tries COPY /src/dist, which does not exist.
# Force the node-server preset so the runnable output is .output/server.
FROM node:22-bookworm-slim AS builder
WORKDIR /app

ARG DATABASE_URL
ARG NITRO_PRESET=node-server
ENV DATABASE_URL=$DATABASE_URL
ENV NITRO_PRESET=$NITRO_PRESET
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

COPY --from=builder /app/.output ./.output

EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
