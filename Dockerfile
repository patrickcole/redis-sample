FROM node:latest

RUN mkdir -p /var/www/app
WORKDIR /var/www/app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
