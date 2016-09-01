/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

const nock = require('nock');
const path = require('path');
nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');
// nock.recorder.rec();

const endpoint = 'https://' + process.env.CLOUDANT_HOST;

// const dbListResults = require(path.resolve(__dirname, 'resources', 'test.db.list.json'));
// const dbDocResults = require(path.resolve(__dirname, 'resources', 'test.db.doc.json'));
const dbApprovedResults = require(path.resolve(__dirname, 'resources', 'test.db.approved.json'));
const dbLearnedResults = require(path.resolve(__dirname, 'resources', 'test.db.learned.json'));
const dbUnclassifiedResults = require(path.resolve(__dirname, 'resources', 'test.db.unclassified.json'));
const dbDocResults = require(path.resolve(__dirname, 'resources', 'test.db.doc.json'));


module.exports = {

	setupMockery: function() {
		let dbScope = nock(endpoint)
			.persist();
		dbScope.get('/')
			.reply(200, {couchdb: 'Welcome', version: '1.0.2', cloudant_build: '2580'});

		dbScope.post('/nlc/_design/getByType/_view/getByApproved', function(body) {
			if (body.keys[0][1] === true)
				return true;
		})
		.query(true)
		.reply(200, dbApprovedResults);

		dbScope.post('/nlc/_design/getByType/_view/getByApproved', function(body) {
			if (body.keys[0][1] === false && body.keys[0][0] === 'learned')
				return true;
		})
		.query(true)
		.reply(200, dbLearnedResults);

		dbScope.post('/nlc/_design/getByType/_view/getByApproved', function(body) {
			if (body.keys[0][1] === false && body.keys[0][0] === 'unclassified')
				return true;
		})
		.query(true)
		.reply(200, dbUnclassifiedResults);

		dbScope.post('/nlc', {
			classification: {
				text: 'hubot can you list my apps?'
			},
			approved: '1469652249102',
			selectedClass: 'app.list'
		})
		.reply(200);

		dbScope.get('/nlc/9ed9075fe3d7fd7eab83440b1c4e7461?revs_info=true')
		.reply(200, dbDocResults);

		dbScope.delete('/nlc/9ED9075F-E3D7-FD7E-AB83-440B1C4E7461?rev=4-62dbd64e48d861d4e57dac0b8e6f394d')
		.reply(200);

		dbScope.put('/nlc/9ED9075F-E3D7-FD7E-AB83-440B1C4E7461', function(body) {
			return true;
		})
		.reply(200, dbDocResults);
	}
};
