
const app = require('../app');
const request = require('supertest')(app);
const mockDBUtils = require('./mock.utils.db.js');
const mockICUtils = require('./mock.utils.ic.js');

// const chai = require('chai');
const expect = require('chai').expect;
// const sinonChai = require('sinon-chai');
// chai.use(sinonChai);

describe('test cloudant', function(){

	before(function() {
		mockDBUtils.setupMockery();
		mockICUtils.setupMockery();
	});

	it('access `/`, should return 200', function(done) {
		request.get('/')
			.expect(200, done);
	});

	it('get `/api/favorites/approved`, should return 200', function(done) {
		request.get('/api/favorites/approved').then(function(res) {
			expect(200);
			expect(res.body.data[0].id).to.eql('291DAC65-AC46-A2B3-85A5-4975F9F02752');
			done();
		});
	});
	it('get `/api/favorites/learned`, should return 200', function(done) {
		request.get('/api/favorites/learned').then(function(res) {
			expect(200);
			expect(res.body.data[0].id).to.eql('6C7E7A0D-CD8A-6393-A62C-A0954BF22FA1');
			done();
		});
	});
	it('get `/api/favorites/unclassified`, should return 200', function(done) {
		request.get('/api/favorites/unclassified').then(function(res) {
			expect(200);
			expect(res.body.data[0].id).to.eql('9ED9075F-E3D7-FD7E-AB83-440B1C4E7461');
			done();
		});
	});

	it('post `/api/favorites`, should return 200', function(done) {
		request.post('/api/favorites')
			.send('id=44390674-1A94-E09A-C445-E7971E414423&text=hubot%20can%20you%20list%20my%20apps%3F&approved=1469652249102&selectedClass=app.list')
			.expect(200, done);
	});

	it('delete `/api/favorites`, should return 200', function(done) {
		request.delete('/api/favorites?id=9ed9075fe3d7fd7eab83440b1c4e7461')
			.expect(200, done);
	});

	it('put `/api/favorites`, should return 200', function(done) {
		request.put('/api/favorites')
			.send('id=9ed9075fe3d7fd7eab83440b1c4e7461&text=can%20you%20list%20my%20apps%3F&approved=1469652249102&selectedClass=app.list')
			.expect(200, done);
	});
});
