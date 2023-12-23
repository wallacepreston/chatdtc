# ChatDTC

Front End UI code for ChatDTC, an AI Assistant deployed at [chatdtc.winepulse.com](https://chatdtc.winepulse.com/)

## Getting Started

### 1. Make sure you're running the correct node version.

-   The easiest way to do this is by using [volta](https://volta.sh/). Once installed, anytime you `cd` into a directory that has a `package.json` with a `volta` entry listed, the correct node version will be downloaded and used just within that project/app.

`curl https://get.volta.sh | bash`

-   Alternatively, you can use a node version manager. Check the `volta` entry of the `package.json` file for the version of node that is required. If you're using `nvm` you can run `nvm use` to switch to the correct version.

### 2. Install dependencies

In the project directory, run:

`npm install`

### 3. Create an `.env` file

This file is ignored by git, so you'll have to create it yourself. It should contain the following:

```sh
REACT_APP_API_URL=http://localhost:3051 # server port
PORT=3050 # client port
```

### 4. Run the app

In the project directory, you can run:

`npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3050](http://localhost:3050) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## PM2

We use [pm2](https://pm2.keymetrics.io/docs/usage/process-management/) on the server to keep the node process running. A few commands:

To restart all applications:

`pm2 restart all` (this runs when the Linux server restarts)

To stop a specified application:

`pm2 stop frontend`

To delete a specified application:

`pm2 delete frontend`

To stop them all:

`pm2 stop all`

To add a new pm2 process (or re-add after deleting), use the command in the package.json file in the repos:

`cd winepulse/chatdtc`

`npm run start-forever`

## Docker

To test the Docker deployment, it's useful to run it locally. You'll have to have [Docker](https://www.docker.com/products/docker-desktop/) installed locally.

### 1. Build the image

Build the image from the [Dockerfile](./Dockerfile).

`docker build -t wine-assistant . --no-cache`

### 2. Run the container

Run the container with the local env file and expose the port externally

`docker run --env-file ./.env -p 3050:3050 wine-assistant`

### 3. Stop the container

List the containers

`docker ps`

Stop the container

`docker stop <container id>`

## Architecture

The frontend is built with React (Typescript) using:

-   [React-Router](https://reactrouter.com/)
-   [Material-UI](https://material-ui.com/)
-   [Axios](https://axios-http.com/)
-   [React-Transition-Group](https://reactcommunity.org/react-transition-group/)
-   [Socket.io-Client](https://socket.io/docs/v3/client-api/index.html)
-   [highlight.js](https://highlightjs.org/)
