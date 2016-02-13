# Node Necessities

A NodeJS project with necessities to create a multiplayer game using Mongoose, AngularJS, socket.io, Jade and ExpressJS

## To install it you need to:

Install npm modules:

```bash
    $ npm install
```

Start the server (server is currently in debug mode - port 3000):

```bash
    $ npm start
```

Test the server:

```bash
    $ npm test
```

Then set up the files in /config in order to work with your own project

## In this project I've set up ready to use:

* Passport login and sign up thanks to [passport tutorial](https://scotch.io/tutorials/easy-node-authentication-setup-and-local)
* Mongoose setup with User scheme only
* Possibility for easy setup with facebook, 
twitter and google+ according to [this tutorial](https://scotch.io/tutorials/easy-node-authentication-setup-and-local) 
* Session variables
* Angular set up
* socket.io token auth
* socket.io support for game/chat modules with the current authentication
* User profile
* User avatars
* Chat lobby with information about users in chat and some kind of message frontend
* Demo Game connection via the lobby
* Live multiplayer connection for two players (Demo)

## Things left to do:

* Private chat room
* Demo games
* Write some more tests

## Many thanks to [this](https://scotch.io/tutorials/easy-node-authentication-setup-and-local) tutorial

It was very helpful with setting up Passport sign up and login