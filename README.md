# Codenames

*Built with love by [Viktor Köves][viktor], [Lily Zhang][lily], [Armaan Shah][armaan] and [Nathan Shelly][nathan]*

## Description

A NodeJS back-end for Codenames built over 36 hours. Won 3rd Place at [Wildhacks 2017][wildhacks]. Built with NodeJS, Express and Websockets. Front-end repo [here][front].

## Running Locally

You can run the Codenames backend using the npm package [nodemon](https://www.npmjs.com/package/nodemon).

Simply run

``` shell
npm install -g nodemon
```

to install it, and then run it with

``` shell
nodemon
```

This will make the backend server available at `http://localhost:8000`. If everything is working, going to that page should say "Let's get started". You should then be able
to use the front-end properly when running it locally.

## Development

Run `npm install` to install required dependencies and then happy hacking!

### Running Tests

`make test` will run Mocha tests.

[viktor]: https://github.com/vkoves
[lily]: https://github.com/lilyszhang
[armaan]: https://github.com/armaanshah96
[nathan]: https://github.com/nathanshelly
[wildhacks]: https://devpost.com/software/codenames
[front]: https://github.com/nathanshelly/codenames
