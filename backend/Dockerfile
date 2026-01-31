# Base image
FROM node:22-slim

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port
EXPOSE 4000

# Start the application using the absolute path to the build output
CMD ["node", "dist/src/main.js"]
