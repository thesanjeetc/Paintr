FROM node:alpine
WORKDIR /usr/app/src
COPY . ./
RUN npm install --production && cd client && npm install --production && npm run build && cd ..
CMD ["node", "Server.js"]