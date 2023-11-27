## ===========================================================> The common stage
FROM node:20 AS base
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production 

## Remove unnecessary files from `node_modules` directory
RUN ( wget -q -O /dev/stdout https://gobinaries.com/tj/node-prune | sh ) \
 && node-prune


## ======================================================> The build image stage
FROM base AS build
ENV NODE_ENV=development

COPY . .
## This step could install only the missing dependencies (ie., development deps ones)
## but there's no way to do that with this NPM version
RUN npm ci --only=production 
## Compile the TypeScript source code
# RUN npm link 


## =================================================> The production image stage
FROM node:20-alpine AS prod
ENV NODE_ENV=production

WORKDIR /app
## Copy required file to run the production application
COPY --from=base --chown=node:node /app/node_modules ./node_modules
COPY --from=base --chown=node:node /app/*.json ./
COPY --from=build --chown=node:node /app/src /app/src
# COPY --from=build --chown=node:node  /app/sndevopscli.js /app/
RUN npm link
# COPY --from=build --chown=node:node /usr/local/lib/node_modules/sndevopscli /usr/local/bin/sndevopscli



## https://engineeringblog.yelp.com/2016/01/dumb-init-an-init-for-docker.html
# RUN apk add --no-cache dumb-init
# RUN npm link
# RUN chmod +x sndevopscli.js
## Dropping privileges
USER node
## Running the app wrapped by the init system for helping on graceful shutdowns
CMD [ "sndevopscli" ]

# FROM node:20-alpine as builder

# # Create app directory
# WORKDIR /app

# ENV NODE_ENV=production

# COPY  sndevopscli.js package*.json ./

# COPY . /app

# RUN npm ci --only=production

# FROM node:20-alpine


# WORKDIR /app

# COPY . .
# RUN npm install .
# RUN npm link
# RUN chmod +x sndevopscli.js
# RUN ln sndevopscli.js sndevopscli
# # USER node
# CMD [ "echo Get a command" ]
