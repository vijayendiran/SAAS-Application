FROM node:20

WORKDIR /app

COPY . .

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "src/server.js"]
