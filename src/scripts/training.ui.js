// Description:
//	Listens for commands to initiate actions against Bluemix
//
// Configuration:
//   HUBOT_CLOUDANT_HOST url for cloudant account with NLC training data
//   HUBOT_CLOUDANT_KEY key associated with NLC training data db
//   HUBOT_CLOUDANT_PASSWORD password associated with NLC training data db
//   HUBOT_CLOUDANT_DB name of NLC training db
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
'use strict';

const path = require('path');
const TAG = path.basename(__filename);
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
		url += '/training';

		let message = i18n.__('nlc.training.ui.success', url);
		robot.emit('ibmcloud.formatter', { response: res, message: message});
	}
};
