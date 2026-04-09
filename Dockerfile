FROM node:18-alpine
WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# copy app
COPY . .

ENV PORT 8787
EXPOSE 8787

CMD [ "node", "server/server.js" ]
