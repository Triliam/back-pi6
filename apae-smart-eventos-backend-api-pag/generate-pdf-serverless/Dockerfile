# Use the slim Node.js 22 base image
FROM node:22-slim

# Install Puppeteer dependencies for Chromium to run properly
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install Chromium browser (from Debian repos)
RUN apt-get update && apt-get install -y chromium

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install node modules
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Set environment variable for Puppeteer to find Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose the port your Cloud Run service listens on
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
