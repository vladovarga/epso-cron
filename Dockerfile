FROM node:18-alpine3.17

# Go to app directory
WORKDIR /app/src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ../

# COPY .env.defaults ../

# npm install
# If you are building your code for production
RUN npm ci --only=production

RUN echo 'alias ll="ls -la"' >> ~/.bashrc

# Bundle app source
COPY ./src .

# Run build tests
# RUN set +x && \
#   npm run test-build

# At container start, run this command
CMD [ "npm", "run", "start" ]