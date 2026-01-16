FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy all project files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose Hugging Face port
EXPOSE 7860

# Set environment to production
ENV NODE_ENV=production
ENV PORT=7860

# Start the application
CMD ["npm", "start"]
