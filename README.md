[![Build Status](https://travis-ci.org/ibm-cloud-solutions/hubot-ibmcloud-cognitive-ui.svg?branch=master)](https://travis-ci.org/ibm-cloud-solutions/hubot-ibmcloud-cognitive-ui)
[![Dependency Status](https://dependencyci.com/github/ibm-cloud-solutions/hubot-ibmcloud-cognitive-ui/badge)](https://dependencyci.com/github/ibm-cloud-solutions/hubot-ibmcloud-cognitive-ui)

# hubot-ibmcloud-cognitive-ui

This repository delivers a UI for cognitive training of a bot that has been instrumented with [hubot-ibmcloud-cognitive-lib](http://github.com/ibm-cloud-solutions/hubot-ibmcloud-cognitive-lib)
and [hubot-ibmcloud-nlc](http://github.com/ibm-cloud-solutions/hubot-ibmcloud-nlc).  See the respective Readme files
for more details.  

In general, enabling a bot for natural language involves early manual training, which is limited.  It must still learn based on real human interaction.  During usage of a bot, logic from IBM Watson makes decisions based on levels of confidence. When confidence isn't high, there is an opportunity for added learning.  The user interaction is recorded in a database for future reference.  The UI delivered by this project allows one to review those interactions and either accept or deny them as new data for future training.

## Getting Started

 * [Prerequisites](#prerequisites)
 * [Configuration Setup](#configuration-setup)
 * [Running the UI Locally](#running-the-ui-locally)
 * [License](#license)
 * [Contribute](#contribute)

## Prerequisites

Beyond the UI implemented in this project is a lot of interaction with the [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db/), hosted on Bluemix, and initially set up as part of integrating natural language into your bot with [hubot-ibmcloud-cognitive-lib](http://github.com/ibm-cloud-solutions/hubot-ibmcloud-cognitive-lib).  An instance of the Cloudant NoSQL DB service must exist already, and will be referenced in the following section.

## Configuration Setup

1. Identify your Cloudant credentials.<br>
  From the Bluemix dashboard, click on your Cloudant NoSQL DB service instance.  You should see something like the following:

  <img src="/docs/images/BluemixCloudantLaunch.png" width="500">

  Click `Service Credentials` in the left panel.  The values for `username`, `password`, and `host` will map to several environment variables needed shortly.

2. UI can either be used to view a single database or multiple databases available in your Cloudant account.

3. Identify the Cloudant key and database value.<br>
  From the same dashboard listed in the previous step, click the `Launch` button to bring up the Cloudant dashboard.  You should see something like the following:

  <img src="/docs/images/CloudantDashboard.png" width="400">

  With `Databases` selected on the left, find the name of the database that was created and associated with `hubot-ibmcloud-cognitive-lib`.  Click on that name to see the details.  Then click `Permissions` where you'll find the API Key on the right.  Both the database name and API key are used below.

4. Per the values above, update the environment variable settings in the file `config/env`.
  To view multiple databases from your Cloudant account, set the following environment variables.
  ```  
    export CLOUDANT_USERNAME=<Cloudant credentials value for "username">
    export CLOUDANT_PASSWORD=<Cloudant credentials value for "password">
    export PORT=<Optional Port, default is 3000>
  ```

  To view a single database, set the following.
  ```
    export HUBOT_CLOUDANT_HOST=<Cloudant credentials value for "host">
    export HUBOT_CLOUDANT_KEY=<Cloudant API key>
    export HUBOT_CLOUDANT_PASSWORD=<Cloudant database password>
    export HUBOT_CLOUDANT_DB=<Cloudant database name>
    export PORT=<Optional Port, default is 3000>
  ```

	Set the following environment variable to `true` if this UI is run as a standalone app or `false` if this UI is run as part of Hubot. The default value is `false` if not set.
	```
		export STANDALONE_APP=<true if standalone, or false if not>
	```

5. Run `npm install` to obtain all the dependent node modules.

## Running the UI Locally

```
npm run start:dev
```
Go to http://localhost:3000/training in the browser, substituting 3000 with the value for `PORT` in the environment variables if that option was taken.

## License

See [LICENSE.txt](./LICENSE.txt) for license information.

## Contribute

Please check out our [Contribution Guidelines](./CONTRIBUTING.md) for detailed information on how you can lend a hand.
