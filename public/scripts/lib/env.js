/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

const settings = {
	dbHost: process.env.HUBOT_CLOUDANT_ENDPOINT,
	dbPassword: process.env.HUBOT_CLOUDANT_PASSWORD,
	dbName: process.env.HUBOT_CLOUDANT_DB,
	dbKey: process.env.HUBOT_CLOUDANT_KEY,
	username: process.env.CLOUDANT_USERNAME,
	userpass: process.env.CLOUDANT_PASSWORD
};

// gracefully output message and exit if any required config is undefined


if (!settings.username || !settings.userpass) {
	console.log('CLOUDANT_USERNAME or CLOUDANT_PASSWORD not set');
}
if (!settings.dbKey || !settings.dbName || !settings.dbPassword || !settings.dbHost) {
	console.log('HUBOT_CLOUDANT not set');
}

module.exports = settings;
