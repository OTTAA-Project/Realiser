![image](https://ottaaproject.com/img/ottaa-project.svg)

# Welcome to OTTAA Project's Realiser #

The realisation process consists of creating a coherent sentence out of a sequence of individual components, such as nouns, adjectives, subjects or verbs.
OTTAA Project's Realiser carries out this process over the cloud providing an API service. This repository contains all the files and scripts necessary for its development.

## How does it work?

The Realiser server recieves different types of API requests and responds with the results of the realisation process at different stages or carried out under different parameters.
For a detailed explanation on the endpoints of the service and their corresponding request types, see the [API Reference](https://us-central1-ottaaproject-flutter.cloudfunctions.net/realiser/docs)

## Getting started: 

### For users:

We recommend everyone to start testing the service on an API platform or enviroment such as [POSTMAN](https://www.postman.com/product/what-is-postman) for web or desktop
or [Thunder Client](https://www.thunderclient.com/) for VSCode.
Once the usecases have been tested and the expected outcome achieved they can be implemented on any app that has access to internet and a Native or External package for managing API requests, such as:

- [requests](https://requests.readthedocs.io/en/latest/) package for Python.
- [http](https://nodejs.org/api/http.html) and [https](https://nodejs.org/api/https.html) for NodeJS.
- [neon](https://notroj.github.io/neon/) and [curlpp](http://www.curlpp.org/) for C++.
- [HttpUrlConnection](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/net/HttpURLConnection.html) and [HttpRequest](https://docs.oracle.com/en/java/javase/11/docs/api/java.net.http/java/net/http/HttpRequest.html) for Java.
- [cURL](https://curl.se/) for Command Line Interface (CLI), except for Windows PowerShell.
- [Invoke-WebRequest](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest) method for Windows PowerShell.

### For developers:

Since the server is mounted on Firebase Cloud Functions, most of the code is NodeJS (Javascript).
Therefore, to contribute with the development, it is required:

- proper knowledge of the NodeJS Javascript programming language;
- Node Package Manager ([NPM](https://www.npmjs.com/)), or other package manager for NodeJS;
- a Firebase account (Google Accounts can be used) and a Firebase Project created, follow [these](https://docs.kii.com/en/samples/push-notifications/push-notifications-android-fcm/create-project/) steps;

Once your Firebase Project is created, generate a new Service Account and use the credentials on the provided JSON with the provided script.
Most of the logic of the Realiser is based on a lexicon saved on an instance of the Firebase Realtime Database, for which we provide a simple example [here](). Build up on it as you wish, following [these rules]().

You are free to choose upgrading your Firebase plan to Blaze to be able to [upload your own version](https://firebase.google.com/docs/functions/get-started) of the Realiser to the cloud using Firebase Cloud Functions, but you can also develop and test new functionalities on a local server, propose those changes on a *pull-request* and see them applied on our side once it is merged. Keep in mind, though, that a local server might take longer to access data from resources like Realtime Database and Firestore Database.

After forking and cloning this repository, remember installing every necessary package, since the packages files are not commited or pushed because of their size. To do it, run `npm i` or `npm install` on the CLI after installing NPM. There is no need to specify which packages to install because they are already listed on the *package.json* file. 

Still, there is a package that needs manual installation because it is generally installed globally: *firebase-tools*. To be able to run the server you will need to install it and initialize it following [this tutorial](https://firebase.google.com/docs/functions/get-started), which also shows how to upload your first cloud function (remember you do not need to do this, you can develop and test the methods on a server deployed locally). 

### Testng

Testing is done using [mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/).
To evaluate the testing process, run `npm test` on the functions folder. The results will be printed on console and outputted to a graphical report on *functions/tests/results/* powered by [mochawesome](https://github.com/adamgruber/mochawesome).

## Resources

### Libraries & tools

As commented above, the code for the Realiser is written in [NodeJS, Javascript](https://nodejs.org/en/). The packages needed for development are listed on the *package.json* file, except for *firebase-tools* which is installed globally, see above.
Some [Python](https://www.python.org/) scripts might be used at some point for local actions like Data Analysis and/or Machine Learning model training or testing.

### API reference

We use [Swagger](https://swagger.io/) to create the [API reference](https://us-central1-ottaaproject-flutter.cloudfunctions.net/realiser/docs). More specifically, we use the module *swagger-ui-express* and the structure is build on *functions/docs/swagger.config.json*.

## Contributing

Contributors help the OTTAA Project grow. If you would like to become a contributor, please read [Contribute](CONTRIBUTING.md).
