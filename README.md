

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.5.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
Install **Node.js®** and npm if they are not already on your machine.

>Make sure you have installed at least **Node.js _8.x_** or **_greater_** and **npm _version 5.x_** or **_greter_**.
In terminal/console window, run `node -v` and `npm -v` to check your installed version.

Set up the Development Environment by install the **Angular CLI** globally.
```
npm install -g @angular/cli
```

### Installing

Clone project into local environment.
```
git clone https://github.com/nya429/ubq-front-app.git
```

Install project by run: 
```
npm install
```

## Development server

For a dev server run:
```
ng serve
``` 
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


### HTTP Client Configuration

To switch between your local api server and the api server hosted on Amazon EC2, set **option** in **src/app/shared/httpCfg.ts**.


## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
