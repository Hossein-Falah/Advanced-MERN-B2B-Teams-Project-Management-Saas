# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm config set registry https://mirror-npm.runflare.com

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# inject env
ARG VITE_API_BASE_URL

# set env whene build time
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the React app
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm config set registry https://mirror-npm.runflare.com

# Install serve globally to serve static files
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 4010
EXPOSE 8010

# Start serve with React Router support
CMD ["serve", "-s", "dist", "-l", "8010"]
