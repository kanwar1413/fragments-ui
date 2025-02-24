# Dockerfile for Fragments UI

# Use the Alpine-based Node.js image as the base
FROM node:20-alpine AS dependencies
# LABEL adds metadata to an image
LABEL maintainer="Kanwar Preet Kaur <kkaur531@myseneca.ca>" \
    description="Fragments-UI web app"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

RUN npm ci

#######################################################################

# use dependencies to build the site
FROM node:20.11.1-alpine AS builder

WORKDIR /app

# Copy cached dependencies from stage 0 to stage 1 so we don't have to download them again
COPY --from=dependencies /app /app

# Copy source code into the image
COPY . .

# Build the site
RUN npm run build

#######################################################################

# Stage 2: nginx web server to host the built site
FROM nginx:alpine AS deploy

# Put our build/ into /usr/share/nginx/html/ and host static files
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl --fail localhost:80 || exit 1