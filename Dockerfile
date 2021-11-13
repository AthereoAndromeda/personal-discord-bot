FROM node:16-alpine as builder
WORKDIR /builder

# Build App
COPY package*.json ./
COPY src src
COPY prisma prisma
COPY typings typings
COPY tsconfig.json tsconfig.json

RUN npm ci
RUN npm run build

# Deploy App
FROM node:16-alpine as app
WORKDIR /app

COPY package*.json ./
ADD start.sh /
COPY prisma prisma
COPY --from=builder /builder/dist dist

RUN npm ci --only=production
RUN chmod +x /start.sh

CMD [ "/bin/sh", "/start.sh" ]