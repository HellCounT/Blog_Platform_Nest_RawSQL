
FROM node:20
LABEL authors="a_kil"
WORKDIR /usr/src/app
COPY package.json ./

RUN npm install --production

COPY dist/ .

EXPOSE 3000

CMD [ "node", "main.js" ]