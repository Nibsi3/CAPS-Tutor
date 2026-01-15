# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Provide env variables for Next.js build (expects values in .env.production)
# This file is created locally from docker/env.docker.example
COPY .env.docker .env.production

# Set environment variables for build
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Stage 3: Runner (production)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package manifest and node_modules so runtime has all deps
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy standalone output from builder (contains compiled server + minimal deps)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static files that are needed by the server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public folder for static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server
CMD ["node", "server.js"]

