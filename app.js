/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

/* eslint strict: "off" */
'use strict';

const express = require('express');
const routes = require('./routes');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const env = require('./src/lib/env');
const Cloudant = require('cloudant');
const winston = require('winston');

const app = express();

const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			handleExceptions: true,
			prettyPrint: true,
			colorize: true,
			timestamp: function(){
				return '[' + new Date().toDateString() + ' ' + new Date().toTimeString() + ']';
			}
		})
	],
	exitOnError: false
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'public')));

if (env.appHost !== 'hubot') {
	// bodyParser and methodOverride are different in Express 3 (hubot's version) and Express 4 (this app's version)
	// need to only use bodyParser and methodOverride if this app is a standalone app (using Express 4)
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(methodOverride());
	app.set('port', process.env.PORT || 3000);
	http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
		let port = app.get('port');
		logger.info(`Express server listening on port ${port}`);
	});
}

let cloudant;

function listAllDbs() {
	const designDocId = '_design/getByType';
	return new Promise((resolve, reject) => {
		cloudant.db.list(function(err, allDbs) {
			if (err) {
				logger.error('Error loading databases', err);
				reject(err);
			}
			else {
				resolve(allDbs);
			}
		});
	}).then(allDbs => {
		const p = allDbs.map(dbId => new Promise((resolve, reject) => {
			let db = cloudant.use(dbId);
			db.get(designDocId, (err, doc) => {
				if (!err){
					resolve(dbId);
				}
				// Add design document "_design/getByType" if it doesn't exist.
				else if (err.statusCode === 404){
					// Look for botInfo document to confirm this is a cognitive training database.
					db.get('botInfo', (er, info) => {
						if (!er) {
							let doc = {
								views: {
									getByApproved: {
										map: 'function(doc) { if (doc.approved) { emit([doc.type, true]); } else { emit([doc.type, false]);}}'
									}
								},
								language: 'javascript',
								_id: '_design/getByType'
							};

							db.insert(doc, function(e, body){
								if (e){
									logger.error(`Error creating design document in database [${dbId}].`);
									resolve(undefined);
								}
								else {
									logger.info(`Created design document [${designDocId}] in database [${dbId}].`);
									resolve(dbId);
								}
							});
						}
						else {
							logger.info(`Database [${dbId}] doesn't appear to be a cognitive training db. Couldn't find a document with id 'botInfo'.`);
							resolve(undefined);
						}
					});
				}
				// Unknown error getting design document.
				else {
					logger.error(`Error getting design document [${id}] from database [${dbId}].`, err);
					resolve(undefined);
				}
			});
		}));
		return Promise.all(p);
	}).then(all => {
		return all.filter(db => db !== undefined);
	});
}
app.get('/training/api/dbs/', function(request, response) {
	if (env.username) {
		cloudant = Cloudant({account: env.username, password: env.userpass});
		return listAllDbs().then(dbs => response.status(200).send(dbs));
	}
	else {
		let url = `https://${env.dbKey}:${env.dbPassword}@${env.dbEndpoint}`;
		cloudant = Cloudant(url);
		let list = [ env.dbName ];
		response.status(200).send(list);
	}
});

app.get('/training/', routes.index);

let saveDocument = function(id, data, db_name, response) {
	if (id === undefined) {
		id = '';
	}
	let	db = cloudant.use(db_name);
	db.insert({
		classification: {
			text: data.text
		},
		approved: data.approved,
		selectedClass: data.selectedClass
	}, id, function(err, doc) {
		if (err) {
			response.send(500);
		}
		else {
			response.status(200).send(doc);
		}
		response.end();
	});
};

app.post('/training/api/:db_name', function(request, response) {
	logger.debug('Create Invoked..');
	saveDocument(null, request.body, request.params.db_name, response);
});

app.delete('/training/api/:db_name', function(request, response) {
	let id = request.query.id;
	logger.debug(`Delete Invoked.. ID: ${id}`);
	let	db = cloudant.use(request.params.db_name);
	db.get(id, { revs_info: true }, function(err, doc) {
		if (!err) {
			db.destroy(doc._id, doc._rev, function(err, res) {
				if (err) {
					response.send(500);
				}
				else {
					response.send(200);
				}
			});
		}
	});
});

app.put('/training/api/:db_name', function(request, response) {
	let id = request.body.id;
	logger.debug(`Update Invoked.. ID: ${id}`);
	let	db = cloudant.use(request.params.db_name);
	db.get(id, { revs_info: true }, function(err, doc) {
		if (!err) {
			doc.approved = request.body.approved;
			doc.classification.text = request.body.text;
			doc.selectedClass = request.body.selectedClass;
			db.insert(doc, doc._id, function(err, res) {
				if (err) {
					logger.error('Error inserting document into the database', err);
					response.status(500).send(`Error inserting document into the database: ${err.message}`);
				}
				else {
					response.send(200);
				}
			});
		}
		else {
			logger.error('Error getting data', err);
			response.status(404).send(`Unable to find document: ${err.message}`);
		}
	});
});

let parseClasses = function(classes, selectedClass) {
	let classList = [];
	let i;
	let len = classes.length;
	for (i = 0; i < len; i++) {
		if (classes[i].confidence >= 0.01) {	// only display classes with >0% confidence
			classList.push(classes[i]);
		}
		if (classList.length >= 5) {	// limit length of class list
			break;
		}
	}
	if (selectedClass) {	// add selected class to list if not there
		let contains = false;
		for (let c in classList) {
			if (classList[c].class_name === selectedClass) {
				contains = true;
				break;
			}
		}
		if (!contains) {
			let selectedClassObj = {
				confidence: 0
			};
			classList.push(selectedClassObj);
		}
	}
	return classList;
};

app.get('/training/api/learned/:db_name', function(request, response) {
	logger.debug('Get learned type method invoked.. ');
	let	db = cloudant.use(request.params.db_name);
	db.view('getByType', 'getByApproved', {keys: [['learned', false]], include_docs: true}, function(err, body) {
		if (!err) {
			let docList = [];
			let totalLearned = 0;
			body.rows.forEach(function(res) {
				let classList = parseClasses(res.doc.classification.classes, res.doc.selectedClass);
				let responseData = {
					id: res.doc._id,
					text: res.doc.classification.text,
					selectedClass: res.doc.selectedClass,
					classes: classList,
					logs: res.doc.logs,
					ts: res.doc.ts
				};
				docList.push(responseData);
			});
			db.view('getByType', 'getByApproved', {keys: [['learned', false]]}, function(err, body) {
				if (!err) {
					logger.debug(`not classified: ${body.rows.length}`);
					totalLearned = body.rows.length;
				}
				let res = {
					numDocs: totalLearned,
					data: docList
				};
				response.send(res);
			});
		}
		else {
			logger.error('Error getting view results', err);
			response.status(500).send(`Error getting view results: ${err.message}`);
		}
	});
});

app.get('/training/api/unclassified/:db_name', function(request, response) {
	logger.debug('Get unclassified type method invoked.. ');
	let	db = cloudant.use(request.params.db_name);
	db.view('getByType', 'getByApproved', {keys: [['unclassified', false]], include_docs: true, limit: request.query.limit, skip: (request.query.page - 1) * (request.query.limit)}, function(err, body) {
		if (!err) {
			let docList = [];
			let totalUnclassified = 0;
			body.rows.forEach(function(res) {
				let classList = parseClasses(res.doc.classification.classes, res.doc.selectedClass);
				let responseData = {
					id: res.doc._id,
					text: res.doc.classification.text,
					selectedClass: res.doc.selectedClass,
					classes: classList,
					logs: res.doc.logs,
					ts: res.doc.ts
				};
				docList.push(responseData);
			});
			db.view('getByType', 'getByApproved', {keys: [['unclassified', false]]}, function(err, body) {
				if (!err) {
					logger.debug(`not classified: ${body.rows.length}`);
					totalUnclassified = body.rows.length;
				}
				let res = {
					numDocs: totalUnclassified,
					data: docList
				};
				response.send(res);
			});
		}
		else {
			logger.error('Error getting view results', err);
			response.status(500).send(`Error getting view results: ${err.message}`);
		}
	});
});


app.get('/training/api/approved/:db_name', function(request, response) {
	logger.debug('Get approved method invoked.. ');
	let	db = cloudant.use(request.params.db_name);
	db.view('getByType', 'getByApproved', {keys: [['learned', true], ['unclassified', true]], include_docs: true, limit: request.query.limit, skip: (request.query.page - 1) * (request.query.limit)}, function(err, body) {
		if (!err) {
			let docList = [];
			let totalApproved = 0;
			body.rows.forEach(function(res) {
				let responseData = {
					id: res.doc._id,
					text: res.doc.classification.text,
					selectedClass: res.doc.selectedClass,
					approved: res.doc.approved
				};
				docList.push(responseData);
			});
			db.view('getByType', 'getByApproved', {keys: [['learned', true], ['unclassified', true]] }, function(err, body) {
				if (!err) {
					logger.debug(`not classified: ${body.rows.length}`);
					totalApproved = body.rows.length;
				}
				let res = {
					numDocs: totalApproved,
					data: docList
				};
				response.send(res);
			});
		}
		else {
			logger.error(err);
			response.status(500).send(`Error getting view results: ${err.message}`);
		}
	});
});

app.get('/training/api/stats/:db_name', function(request, response) {
	logger.debug('Get stats');
	let numClassified = -1;
	let numNotClassified = -1;
	let	db = cloudant.use(request.params.db_name);
	db.view('getByType', 'getByApproved', {keys: [['classified', false]]}, function(err, body) {
		if (!err) {
			logger.debug(`classified: ${body.rows.length}`);
			numClassified = body.rows.length;
			db.view('getByType', 'getByApproved', {keys: [['learned', false], ['unclassified', false]]}, function(err, body) {
				if (!err) {
					logger.debug(`not classified: ${body.rows.length}`);
					numNotClassified = body.rows.length;
					let stat = (numClassified) / (numClassified + numNotClassified) * 100;
					response.send({
						nClassified: stat
					});
				}
				else {
					logger.error('Error getting view results', err);
					response.status(500).send(`Error getting view results: ${err.message}`);
				}
			});
		}
		else {
			logger.error('Error getting view results', err);
			response.status(500).send(`Error getting view results: ${err.message}`);
		}
	});
});

module.exports = app;
