# See It Off

<br/><p align="center"><img width="192" src="https://rawgit.com/marcl/see-it-off/master/favicons/android-chrome-192x192.png" alt="See It Off"></p><br/>

> Help Tom to have the time of his life!

## Install

```
git clone git@github.com:MarcL/see-it-off.git
cd see-it-off
npm install
```

## Running The Game

* Debug build can be run with `npm run build:dev` which will open http://localhost:3000/ and start the game.
* Production build can be created in `/dist` with `npm run build:production`.

## Deploying the game

The production build can be deployed to the `gh-pages` branch if it's mapped. To do this, clone a `gh-pages` branch into `/dist`. Assuming you're in the root of the project:

```
git clone git@github.com:MarcL/see-it-off.git --branch gh-pages dist
```

Then the build can automatically be deployed to `gh-pages` branch using:

```
npm run deploy
```

Once deployed, the code will be pushed to your `gh-pages` branch and available on your project page: https://USERNAME.github.io/PROJECT-NAME.

For this project you can see it here: https://marcl.github.io/see-it-off
