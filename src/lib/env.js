/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

const settings = {
	// Cloudant DB API Key settings
	dbEndpoint: process.env.VCAP_SERVICES_CLOUDANTNOSQLDB_0_CREDENTIALS_HOST ? 'https://' + process.env.VCAP_SERVICES_CLOUDANTNOSQLDB_0_CREDENTIALS_HOST : process.env.HUBOT_CLOUDANT_ENDPOINT,
	dbPassword: process.env.VCAP_SERVICES_CLOUDANTNOSQLDB_0_CREDENTIALS_PASSWORD || process.env.HUBOT_CLOUDANT_PASSWORD,
	dbName: process.env.HUBOT_CLOUDANT_DB,
	dbKey: process.env.VCAP_SERVICES_CLOUDANTNOSQLDB_0_CREDENTIALS_USERNAME || process.env.HUBOT_CLOUDANT_KEY,

	// Cloudant General Username and Password
	username: process.env.CLOUDANT_USERNAME,
	userpass: process.env.CLOUDANT_PASSWORD,

	// determine if running as a standalone app or part of hubot
	standaloneApp: process.env.STANDALONE_APP || true
};

// gracefully output message and exit if any required config is undefined
if (!(settings.username && settings.userpass)) {
	if (!(settings.dbKey && settings.dbName && settings.dbPassword && settings.dbEndpoint)) {
		if (!settings.username) {
			console.error('CLOUDANT_PASSWORD not set.');
		}
		if (!settings.userpass) {
			console.error('CLOUDANT_USERNAME not set.');
		}
		if (!settings.dbHost) {
			console.error('HUBOT_CLOUDANT_ENDPOINT not set');
		}
		if (!settings.dbKey) {
			console.error('HUBOT_CLOUDANT_KEY not set');
		}
		if (!settings.dbPassword) {
			console.error('HUBOT_CLOUDANT_PASSWORD not set');
		}
		if (!settings.dbName) {
			console.error('HUBOT_CLOUDANT_DB_NAME not set.');
		}
	}
}

// Either dbKey or username will be used, but it cannot use both. Warn the user if both are set
if (settings.username && settings.dbKey) {
	console.warn('Both HUBOT_CLOUDANT_KEY and CLOUDANT_USERNAME are defined. CLOUDANT_USERNAME will be used as the default');
}

// trim protocol from dbEndpoint
if (settings.dbEndpoint) {
	settings.dbEndpoint = settings.dbEndpoint.replace('http://', '').replace('https://', '');
}

// convert 'false'(string) to false(boolean) or default to true
if (typeof (settings.standaloneApp) !== 'boolean') {
	settings.standaloneApp = !(settings.standaloneApp.toLowerCase() === 'false');
}

module.exports = settings;
