/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

const settings = {
	username: process.env.CLOUDANT_USERNAME,
	userpass: process.env.CLOUDANT_PASSWORD
};

// gracefully output message and exit if any required config is undefined


if (!settings.username) {
	console.error('CLOUDANT_USERNAME not set');
}
if (!settings.userpass) {
	console.error('CLOUDANT_PASSWORD not set');
}

module.exports = settings;
