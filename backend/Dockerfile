# Multi-stage Dockerfile for backend (build TypeScript -> production image)
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm config set registry https://package-mirror.liara.ir/repository/npm

# Install build deps
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm config set registry https://package-mirror.liara.ir/repository/npm

# Install only production deps
COPY package*.json ./
RUN npm install --only=production

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["node", "dist/index.js"]
