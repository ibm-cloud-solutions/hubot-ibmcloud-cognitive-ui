/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
import 'whatwg-fetch';
const self = this;

function handleErrors(response, observable) {
	if (!response.ok) {
		if (observable){
			observable.trigger('error', response.statusText);
		}
	}
	return response;
}

module.exports.getDBs = function(observable) {
	return fetch('/training/api/dbs/')
	.then((response) => handleErrors(response, observable))
	.then((response) => {
		return response.json();
	})
	.catch(function(e) {
		console.log('getDBs failed');
		console.log(e);
	});
};

module.exports.loadRequestedDB = function(db, observable) {
	return fetch('/training/api/loadDB/' + db)
	.then((response) => handleErrors(response, observable))
	.then((response) => {
		return response.json;
	})
	.catch(function(e) {
		console.log('loadRequestedDB failed');
	});
};

module.exports.getDBData = function(type, db, observable, page, limit){
	let path = `/training/api/favorites/${type}/${db}`;
	if (page && limit) {
		path = `${path}?page=${page}&limit=${limit}`;
	}
	return fetch(path)
	.then((response) => handleErrors(response, observable))
	.then((response) => {
		return response.json();
	})
	.catch(function(e){
		console.log('getDBData failed');
	});
};

module.exports.putDBData = function(url, data, observable){
	return fetch(url, {
		method: 'put',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	.then((response) => handleErrors(response, observable))
	.then((response) => {
		return response;
	}).catch(function(e) {
		console.log('putDBData failed');
	});
};

module.exports.postDBData = function(url, data, observable){
	return fetch(url, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then((response) => handleErrors(response, observable))
	.then((response) => {
		return response;
	}).catch(function(e){
		console.log('postDBData failed');
	});
};

module.exports.deleteDBData = function(url, id, observable){
	return fetch(url + '?id=' + id, {
		method: 'delete'
	}).then((response) => handleErrors(response, observable))
	.then(function(response) {
		return response;
	}).catch(function(e){
		console.log('postDBData failed');
	});
};

module.exports.deleteItem = function(doc, data, db_name, observable){
	return new Promise((resolve, reject) => {
		const newData = data.filter(function(el){
			if (el.id){
				return (el.id !== doc.id);
			}
			else {
				if ((el.newText === doc.newText)
				&& (el.newSelectedClass === doc.newSelectedClass)){
					return false;
				}
				else {
					return true;
				}
			}
		});

		if (doc.id){
			return self.deleteDBData('/api/favorites/' + db_name, doc.id, observable).then(() => {
				resolve(newData);
			});
		}
		else {
			resolve(newData);
		}
	});
};

module.exports.acceptItem = function(doc, db_name, observable) {
	doc.approved = Date.now();
	if (doc.newText){
		doc.text = doc.newText;
		delete doc.newText;
	}
	if (doc.newSelectedClass){
		doc.selectedClass = doc.newSelectedClass;
		delete doc.newSelectedClass;
	}
	if (doc.id){
		return self.putDBData('/api/favorites/' + db_name, doc, observable);
	}
	else {
		return self.postDBData('/api/favorites/' + db_name, doc, observable);
	}
};
