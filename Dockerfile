# --------------> The build image
FROM node:latest AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
COPY api api
COPY lib lib
COPY mod mod
COPY public public
COPY express.js express.js

RUN npm ci --omit=dev

# --------------> The production image
FROM node:16.17.0-bullseye-slim

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules node_modules
COPY --chown=node:node --from=build /usr/src/app/api api
COPY --chown=node:node --from=build /usr/src/app/lib lib
COPY --chown=node:node --from=build /usr/src/app/mod mod
COPY --chown=node:node --from=build /usr/src/app/public public
COPY --chown=node:node --from=build /usr/src/app/express.js express.js

CMD ["dumb-init", "node", "express.js"]
