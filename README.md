## PFM Angular Client - User Interface

### Directions for developers working with this angular-cli app

#### Prerequisites

You will need the following things properly installed on your computer.

* [Node.js](https://nodejs.org/)

We recommend installing Node.js via NVM at https://github.com/nvm-sh/nvm

The system is tested on Node v10.15.3
 
#### Installation

* `git clone git@bitbucket.org:pexchange/pfm-ui.git`
* change into the directory `cd pfm-ui`
* `./swagger-codegen.sh`
* `npm install`
* `npm run-script ng s -- -c dev` to use the AWS backend. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

# PFM Angular Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.8.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# Certificates
PFM currently enforces bi-directional authentication via certificates. There are a number of certificates available in the `support/certificates` directory. Please install
all of these into Chrome or Chromium to access the system. "Bill Andrew" (contractor3) and "Beth Carrie" (gov3) are the most useful certificates.