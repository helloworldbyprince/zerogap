FROM node:20-alpine AS base

# Step 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Step 2: Build Next.js application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="zerogap-509816"
ENV NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBgOocciXlyWeMomwmPkup_RSzdwMndtT4"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="zerogap-509816.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="zerogap-509816.firebasestorage.app"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="677303028609"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:677303028609:web:dffc44dcc422e63379b680"

RUN npm run build

# Step 3: Minimal Cloud Run production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="zerogap-509816"
ENV NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBgOocciXlyWeMomwmPkup_RSzdwMndtT4"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="zerogap-509816.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="zerogap-509816.firebasestorage.app"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="677303028609"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:677303028609:web:dffc44dcc422e63379b680"
ENV GCP_PROJECT_ID="zerogap-509816"
ENV GCP_REGION="asia-south1"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
