FROM node:22.17.0-alpine AS base

# Install dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .

# Build Next.js app (non-standalone)
RUN npm run build

EXPOSE 8080
ENV PORT 8080
ENV NODE_ENV production

CMD ["node_modules/.bin/next", "start", "-p", "8080"]
