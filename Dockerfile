FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
RUN npm install --no-audit --no-fund

COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
USER node
ENTRYPOINT ["node", "dist/index.js"]
