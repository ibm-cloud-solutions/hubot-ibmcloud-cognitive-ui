/* eslint strict: "off" */
'use strict';

const app = require('../app');
const request = require('supertest')(app);
const mockDBUtils = require('./mock.utils.db.js');
const mockICUtils = require('./mock.utils.ic.js');
const expect = require('chai').expect;

describe('test app.js', function(){

	before(function() {
		mockDBUtils.setupMockery();
		mockICUtils.setupMockery();
	});

	it('access `/training/`, should return 200', function(done) {
		request.get('/training/')
			.expect(200, done);
	});
	it('get `/training/api/dbs/`, should return 200', function(done) {
		request.get('/training/api/dbs/').then(function(res) {
			expect(200);
			done();
		});
	});
	it('get `/training/api/approved/`, should return 200', function(done) {
		request.get('/training/api/approved/nlc/').then(function(res) {
			expect(200);
			expect(res.body.data[0].id).to.eql('291DAC65-AC46-A2B3-85A5-4975F9F02752');
			done();
		});
	});
	it('get `/training/api/learned`, should return 200', function(done) {
		request.get('/training/api/learned/nlc').then(function(res) {
			expect(200);
			expect(res.body.data[0].id).to.eql('6C7E7A0D-CD8A-6393-A62C-A0954BF22FA1');
			done();
		});
	});
	it('get `/training/api/unclassified`, should return 200', function(done) {
		request.get('/training/api/unclassified/nlc').then(function(res) {
			expect(200);
			expect(res.body.data[0].id).to.eql('9ED9075F-E3D7-FD7E-AB83-440B1C4E7461');
			done();
		});
	});

	it('post `/training/api/`, should return 200', function(done) {
		request.post('/training/api/nlc')
			.send('id=44390674-1A94-E09A-C445-E7971E414423&text=hubot%20can%20you%20list%20my%20apps%3F&approved=1469652249102&selectedClass=app.list')
			.expect(200, done);
	});

	it('delete `/training/api/`, should return 200', function(done) {
		request.delete('/training/api/nlc/?id=9ed9075fe3d7fd7eab83440b1c4e7461')
			.expect(200, done);
	});

	it('put `/training/api`, should return 200', function(done) {
		request.put('/training/api/nlc')
			.send('id=9ed9075fe3d7fd7eab83440b1c4e7461&text=can%20you%20list%20my%20apps%3F&approved=1469652249102&selectedClass=app.list')
			.expect(200, done);
	});
	it('get `/api/favorites/stats`, should return 200', function(done) {
		request.get('/api/favorites/stats/nlc').then(function(res) {
			expect(200);
			done();
		});
	});
});
