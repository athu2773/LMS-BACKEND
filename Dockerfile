# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source code
COPY . .

# Expose port (adjust if your app runs on different port)
EXPOSE 3000

# Environment variable for production (optional)
ENV NODE_ENV=production

# Start the app
CMD ["node", "app.js"]
