/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

'use strict';

const express = require('express');
const routes = require('./routes');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const env = require('./public/scripts/lib/env');
const Cloudant = require('cloudant');
const winston = require('winston');

const app = express();
let cloudant;

const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({
			handleExceptions: true,
			json: true
		})
	],
	exitOnError: false
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
let me = env.username;
let pass = env.userpass;
cloudant = Cloudant({account: me, password: pass});

function listAllDbs() {
	let db;
	let id = '_design/getByType';
	const p1 = new Promise((resolve, reject) => {
		cloudant.db.list(function(err, allDbs) {
			if (err) {
				reject(err);
			}
			else {
				resolve(allDbs);
			}
		});
	}).then(allDbs => {
		const p = allDbs.map(dbId => new Promise((resolve, reject) => {
			db = cloudant.use(dbId);
			db.get(id, (err, doc) => {
				if (err) {
					resolve(undefined);
				}
				else {
					resolve(dbId);
				}
			});
		}));
		return Promise.all(p);
	}).then(all => {
		return all.filter(db => db !== undefined);
	});
	return p1;
}
app.get('/api/dbs/', function(request, response) {
	return listAllDbs().then(dbs => response.send(dbs));
});

// app.get('/api/loadDB/:currentDB', function(request, response) {
// 	//	initDBConnection(request.params.currentDB);
// 	response.status(200).send('OK');
// });

// let initDBConnection = function(currentdb) {
// 	db = cloudant.use(currentdb);
// };

app.get('/', routes.index);

let saveDocument = function(id, data, db_name, response) {
	if (id === undefined) {
		id = '';
	}
	let db = cloudant.use(db_name);
	db.insert({
		classification: {
			text: data.text
		},
		approved: data.approved,
		selectedClass: data.selectedClass
	}, id, function(err, doc) {
		if (err) {
			response.sendStatus(500);
		}
		else {
			response.status(200).send(doc);
		}
		response.end();
	});
};

app.post('/api/favorites/:db_name', function(request, response) {
	logger.debug('Create Invoked..');
	let db = request.params.db_name;
	saveDocument(null, request.body, db, response);
});
app.delete('/api/favorites/:db_name', function(request, response) {
	let id = request.query.id;
	logger.debug(`Delete Invoked.. ID: ${id}`);
	let db = cloudant.use(request.params.db_name);
	db.get(id, { revs_info: true }, function(err, doc) {
		if (!err) {
			db.destroy(doc._id, doc._rev, function(err, res) {
				if (err) {
					response.sendStatus(500);
				}
				else {
					response.sendStatus(200);
				}
			});
		}
	});
});

app.put('/api/favorites/:db_name', function(request, response) {
	let id = request.body.id;
	logger.debug(`Update Invoked.. ID: ${id}`);
	let db = cloudant.use(request.params.db_name);
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
				response.sendStatus(200);
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
				// classList[c].class_name += '*';
				contains = true;
				break;
			}
		}
		if (!contains) {
			let selectedClassObj = {
				// class_name: selectedClass + '*',
				confidence: 0
			};
			classList.push(selectedClassObj);
		}
		// selectedClass += '*';
	}
	return classList;
};

app.get('/api/favorites/learned/:db_name', function(request, response) {
	logger.debug('Get learned type method invoked.. ');
	let db = cloudant.use(request.params.db_name);
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
			/*
			docList.sort(function(a, b) {
			return b.ts - a.ts;
		});*/
		// response.send(docList);
	}
	else {
		logger.error('Error getting view results', err);
		response.status(500).send(`Error getting view results: ${err.message}`);
	}
});
});

app.get('/api/favorites/unclassified/:db_name', function(request, response) {
	logger.debug('Get unclassified type method invoked.. ');
	let db = cloudant.use(request.params.db_name);
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

			/*
			docList.sort(function(a, b) {
			return b.ts - a.ts;
		});*/
		// response.send(docList);
	}
	else {
		logger.error('Error getting view results', err);
		response.status(500).send(`Error getting view results: ${err.message}`);
	}
});
});


app.get('/api/favorites/approved/:db_name', function(request, response) {
	logger.debug('Get approved method invoked.. ');
	let db = cloudant.use(request.params.db_name);
	db.view('getByType', 'getByApproved', {keys: [['learned', true], ['unclassified', true]], include_docs: true}, function(err, body) {
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
			db.view('getByType', 'getByApproved', {keys: [['learned', false]]}, function(err, body) {
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
			/*
			docList.sort(function(a, b) {
			return b.approved - a.approved;
		});*/
		// response.send(docList);
	}
	else {
		logger.error(err);
		response.status(500).send(`Error getting view results: ${err.message}`);
	}
});
});

app.get('/api/favorites/stats/:db_name', function(request, response) {
	logger.debug('Get stats');
	let numClassified = -1;
	let numNotClassified = -1;
	let db = cloudant.use(request.params.db_name);
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

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
	let port = app.get('port');
	logger.info(`Express server listening on port ${port}`);
});

module.exports = app;
