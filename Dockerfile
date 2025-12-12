# --- STAGE 1: Build the React/Vite App ---
# Use Node 20 with the lightweight Alpine distribution as the builder
FROM node:20-alpine AS build

# Declare a build argument for your API key
# This is where Cloud Run will inject your secret during the build process
ARG GEMINI_API_KEY

# Set the working directory
WORKDIR /app

# Copy the dependency files first to enable Docker layer caching
COPY package.json ./


# Install dependencies
RUN npm install

# Copy all the rest of the app files
COPY . .

# IMPORTANT: Write the API key to a .env.local file
# This file is used by Vite during the 'npm run build' step
# Note: For the key to be picked up by Vite, you should ensure it's prefixed 
# with 'VITE_' in your React code (e.g., VITE_GEMINI_API_KEY).
# The Docker ARG is simply GEMINI_API_KEY.
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Build the React app (output will be in the 'dist' folder)
# Cloud Run's build system will automatically use the production mode.
RUN npm run build


# --- STAGE 2: Serve the App with Nginx ---
# Use the tiny, secure Nginx Alpine image for the final container
FROM nginx:alpine AS production

# Cloud Run requires the container to listen on the port defined by the 
# PORT environment variable, which it sets automatically, and which defaults to 8080.
# Nginx's default config listens on port 80, so we EXPOSE 8080 to satisfy the Cloud Run requirement.
EXPOSE 8080

# Remove Nginx's default config and copy our custom config
# Our custom config will be set up to listen on 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the 'build' stage's /app/dist folder 
# into Nginx's default serving location
COPY --from=build /app/dist /usr/share/nginx/html

# Command to run Nginx in the foreground so the container doesn't exit
CMD ["nginx", "-g", "daemon off;"]
