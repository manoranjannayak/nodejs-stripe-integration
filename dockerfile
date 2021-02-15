  
FROM node:12

#create app directory
WORKDIR /app

# Install app dependencies
COPY package.json /app

RUN npm install

# Bundle app source
COPY . /app

# run image
CMD [ "npm", "start" ]