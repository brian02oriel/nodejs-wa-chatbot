# Use the official Node.js image as the base image
FROM node:18.18.0

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port specified by the PORT environment variable
EXPOSE $PORT

# Command to run the application
CMD ["node", "server.js"]
