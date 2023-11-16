# Stage 1 - the build process
FROM node:18.13.0-alpine AS build-deps

# env vars
ENV PORT=3050

# Install CI dependencies
RUN apk add --no-cache git

# Create app directory
WORKDIR /app

# copy package separately so that we can cache it individually
COPY package.json .

RUN npm install

# bring everything else into our working directory
COPY . .

# build our app
RUN npm run build

# Stage 2 - the production environment
FROM node:18.13.0-alpine AS run-app

# serve is used in the CMD below to serve the app
RUN npm install -g serve

WORKDIR /code

COPY --from=build-deps /app/build .

EXPOSE $PORT

# The -s option tells serve to serve single-page apps
CMD ["serve", "-p", "3050", "-s", "."]
