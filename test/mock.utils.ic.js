/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';

const nock = require('nock');
nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');

const endpoint = 'https://containers-api.ng.bluemix.net';

module.exports = {

	setupMockery: function() {
		let icScope = nock(endpoint)
			.persist();

		icScope.post('/v3/containers/groups')
			.reply(200);

	}
};
