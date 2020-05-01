FROM node:alpine
WORKDIR /usr/app/src
COPY . ./
RUN npm install --production
CMD ["node", "Server.js"]