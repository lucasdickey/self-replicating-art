# Use the official Node.js 20 image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Set environment variables (these will be overridden by your .env file)
ENV NODE_ENV=production

# Install ts-node globally for convenience
RUN npm install -g ts-node

# Default command (can be overridden)
CMD ["npm", "start"] 