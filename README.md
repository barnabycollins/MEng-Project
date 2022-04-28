# MEng-Project

## Using the program

This program uses Node.js. In order to run it, ensure Node.js is installed, and then run the following commands in the root directory of the project:

```
npm install
```
This will install the required node modules for the project. Bear in mind that this project was developed with `faust2webaudio` version 0.6.59. Other versions may not be compatible with the included copy of `libfaust`, but the correct copy should be able to be retrieved from the module itself inside the `dist` directory and placed in the `/src/libfaust` directory in the main project to remedy this.

```
npm run dev
```
This will run a local Vite development server; follow the given instructions to view the page in a browser.