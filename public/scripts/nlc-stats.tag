<!--
/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
-->

<nlc-stats>
	<div>
		<h3 if={ showRate } class='heading heading--small' style='text-align: center'>
			{ successRate }% of the statements have been classified with high confidence
		</h3>
	</div>
	<script>
	const util = require('./util');
	const self = this;
	let showRate = false;
	let successRate;
	let db_name;
	let loadPage = false;
	this.mixin('hub');
	self.observable.on('newDBLoad', function(db){
		self.update({
			loadPage: true,
			db_name: db
		});
		if (self.showRate ){
			self.stats();
		}
	});
	this.observable.on('tab', function(tab){
		if (tab.name === 'statistics'){
			if (self.db_name) {
			self.stats();
		}
		}
		else {
			self.update({
				showRate: false
			})
		}
	});
	self.stats = function(){
		self.update({
			showRate: false
		})
		self.observable.trigger('startSpinning');
		// util.getDBData('/api/favorites/stats/' + self.db_name, self.observable).then(function(res) {
		util.getDBData('stats', self.db_name, self.observable).then(function(res) {
			self.observable.trigger('stopSpinning');
			self.successRate = res.nClassified.toPrecision(4);
			self.update({
				showRate: true
			})
		})
	};
	</script>
</nlc-stats>
