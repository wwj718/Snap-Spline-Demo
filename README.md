# Spline Adapter

Refer to [Spline library for Snap!](https://wwj718.github.io/post/programming/snap-spline-en/)

## How it works?

Use [splinetool/react-spline](https://github.com/splinetool/react-spline) to interoperate with Spline project.

Use [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)(dynatalk was built on it) to pass messages between Spline element(`import Spline from "@splinetool/react-spline";`) and Snap!.

## Development

`npm start`

## build and deploy

`npm run build`

### Deploy to Github Pages

Refer to [create-react-app Deployment: GitHub Pages](https://create-react-app.dev/docs/deployment/#github-pages)

The current project is deployed here: [https://wwj718.github.io/Snap-Spline-Demo/](https://wwj718.github.io/Snap-Spline-Demo/)