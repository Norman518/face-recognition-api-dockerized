FROM node:8.11.1

# App directory
WORKDIR /Users/Cake/Documents/GitHub/face-recognition-api-dockerized

# Install app dependencies
COPY package.json /Users/Cake/Documents/GitHub/face-recognition-api-dockerized
RUN npm install

# Bundle app source
COPY . /Users/Cake/Documents/GitHub/face-recognition-api-dockerized

# Build arguments
ARG NODE_VERSION=8.11.1

# Environment
ENV NODE_VERSION $NODE_VERSION