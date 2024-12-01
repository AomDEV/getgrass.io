# ================= #
# Build image
# ================= #
FROM node:18-alpine as builder

# Install necessary dependencies
RUN apk add --no-cache bash

# Create app directory and set ownership
WORKDIR /usr/src/app

# Copy package manager lock files and install dependencies
COPY --chown=node:node package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile --ignore-scripts; \
  elif [ -f package-lock.json ]; then npm ci --ignore-scripts; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile --ignore-scripts; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy application source code
COPY --chown=node:node . .

# Build the project
RUN npm run build

# ================= #
# Production image
# ================= #
FROM node:18-alpine

# Install Chromium and necessary tools for headless mode
RUN apk add --no-cache chromium chromium-chromedriver

# Environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROMEDRIVER_BIN=/usr/bin/chromedriver \
    CHROME_OPTS="--headless --disable-gpu --no-sandbox --disable-dev-shm-usage" \
    DBUS_SESSION_BUS_ADDRESS="/dev/null"

# Use non-root user for security
USER node

# Set working directory
WORKDIR /usr/src/app

# Copy built files and dependencies from the builder stage
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

# Expose application port
EXPOSE 3030

# Command to run the application
CMD ["node", "dist/index.js"]
