FROM node:16-alpine
WORKDIR /usr/app

# Install deps
COPY package*.json ./
COPY prisma prisma

RUN npm ci --only=production

# Bundle app
COPY dist dist

CMD [ "npm", "start" ]