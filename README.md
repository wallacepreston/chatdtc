# wine-assistant
Front End UI for WinePulse AI Assistant

## Getting Started
### 1.  Make sure you're running the correct node version. 
  - The easiest way to do this is by using [volta](https://volta.sh/). Once installed, anytime you `cd` into a directory that has a `package.json` with a `volta` entry listed, the correct node version will be downloaded and used just within that project/app.

`curl https://get.volta.sh | bash`

  - Alternatively, you can use a node version manager.  Check the `volta` entry of the `package.json` file for the version of node that is required. If you're using `nvm` you can run `nvm use` to switch to the correct version.

### 2. Install dependencies

In the project directory, run:

`npm install`

### 3. Run the app

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

## Architecture

The frontend is built with React (Typescript) using:

-   [React-Router](https://reactrouter.com/)
-   [Material-UI](https://material-ui.com/)
-   [Axios](https://axios-http.com/)
-   [React-Transition-Group](https://reactcommunity.org/react-transition-group/)
-   [Socket.io-Client](https://socket.io/docs/v3/client-api/index.html)
-   [highlight.js](https://highlightjs.org/)