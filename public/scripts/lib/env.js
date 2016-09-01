/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

const settings = {
	dbHost: process.env.CLOUDANT_HOST,
	dbPassword: process.env.CLOUDANT_PASSWORD,
	dbName: process.env.CLOUDANT_DB_NAME,
	dbKey: process.env.CLOUDANT_KEY,
	username: process.env.CLOUDANT_USER,
	userpass: process.env.CLOUDANT_PASS
};

// gracefully output message and exit if any required config is undefined
if (!settings.dbHost) {
	console.error('CLOUDANT_HOST not set');
}

if (!settings.dbKey) {
	console.error('CLOUDANT_KEY not set');
}
if (!settings.dbPassword) {
	console.error('CLOUDANT_PASSWORD not set');
}

if (!settings.dbName) {
	console.error('CLOUDANT_DB_NAME not set.');
}

module.exports = settings;
