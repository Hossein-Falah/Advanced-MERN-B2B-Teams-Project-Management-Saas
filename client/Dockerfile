# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm config set registry https://mirror2.chabokan.net/npm/

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# inject env
ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL

# set env whene build time
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the React app
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm config set registry https://mirror2.chabokan.net/npm/

# Install serve globally to serve static files
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 4010
EXPOSE 8010

# Start serve with React Router support
CMD ["serve", "-s", "dist", "-l", "8010"]
