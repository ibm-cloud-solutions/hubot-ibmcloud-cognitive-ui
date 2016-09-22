// Description:
//	Listens for commands to initiate actions against Bluemix
//
// Configuration:
//	 HUBOT_WATSON_NLC_URL api for the Watson Natural Language Classifier service
//	 HUBOT_WATSON_NLC_USERNAME user ID for the Watson NLC service
//	 HUBOT_WATSON_NLC_PASSWORD password for the Watson NLC service
//	 HUBOT_WATSON_NLC_CLASSIFIER name of the classifier for Watson NLC service
//
// Author:
//   mbecvarik
//
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

const path = require('path');
const TAG = path.basename(__filename);
// const env = require(path.resolve(__dirname, '..', 'lib', 'env'));
const cfenv = require('cfenv');

// --------------------------------------------------------------
// i18n (internationalization)
// It will read from a peer messages.json file.  Later, these
// messages can be referenced throughout the module.
// --------------------------------------------------------------
const i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	// Add more languages to the list of locales when the files are created.
	directory: __dirname + '/../messages',
	defaultLocale: 'en',
	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
// At some point we need to toggle this setting based on some user input.
i18n.setLocale('en');

const TRAINING_UI = /nlc training (ui)$/i;

module.exports = (robot) => {
	// Natural Language match
	robot.on('nlc.training.ui', (res, parameters) => {
		robot.logger.debug(`${TAG}: Natural Language match. res.message.text=${res.message.text}.`);
		getURL(robot, res);
	});

	// RegEx match
	robot.respond(TRAINING_UI, {id: 'nlc.training.ui'}, function(res) {
		robot.logger.debug(`${TAG}: RegEx match. res.message.text=${res.message.text}.`);
		getURL(robot, res);
	});

	function getURL(robot, res) {
		let appEnv = cfenv.getAppEnv();
		let url = appEnv.url;
		if (url.includes('localhost')) {
			let port;
			if (process.env.EXPRESS_PORT) {
				port = process.env.EXPRESS_PORT;
			}
			else if (process.env.PORT) {
				port = process.env.PORT;
			}
			else {
				port = '8080';	// hubot's default port if EXPRESS_PORT and PORT are not defined
			}
			url = 'http://localhost:' + port;
		}
		let message = '\nNLC Training URL: ' + url + '/training';
		robot.emit('ibmcloud.formatter', {response: res, message: message});
	}
};
