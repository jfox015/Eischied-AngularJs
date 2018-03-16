# Project Eischied

A boilerplate MEAN Stack demo for a web based, multi-API application. Named after the 70's TV Show "Eischeid" staring Joe Don Baker.

This library has two main components, the backend pages/API and public HTML.

The example API included is written in NodeJS using Express 4.x+ with Jade Templating.

The front end is an AngularJS 1.x based application UI using JQuery, Bootstrap and LESS CSS.

Back and forth communication from the UI to the backend is accomplished via a RESTful services API.

This project is based off the excellent Hackathon Starter Project (https://github.com/sahat/hackathon-starter).

## NOTE

Many of the technologies used in this demo are now deprecated or have been supercedded by newer versions. This demo features Angular 1.x which is now closing in on end of life for support. Jade Templates have also been renamed to pug. So there may be depercation warnings and messages during NPM Install. This project is provided "as-is" as a Angular 1.x demo.

## Requirements

- NodeJs
- MongoDB 2.x


## Set up the project

```sh
$ git clone git://github.com/jfox015/Eischied-AngularJs
$ cd Eischied-AngularJs
$ npm install
```

## Launch MongoDB

Make sure your local copy of MongoDB is running. The run the following command to start the site.

```sh
$ $ npm start
```

Browse to http://localhost:3000 to run.

## Error Note

If you received the following error:

```sh
$ Error: Cannot find module 'mongodb/node_modules/bson
```

Do the following:

```sh
npm install -g node-gyp 
cd /to/your/project-folder
rm -rf node_modules
npm install
```