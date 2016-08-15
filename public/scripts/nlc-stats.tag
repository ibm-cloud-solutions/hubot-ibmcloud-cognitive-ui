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
			{ successRate }% correctly classified
		</h3>
	</div>
	<script>
		const util = require('./util');
		const self = this;
		this.mixin('hub');
		this.observable.on('tab', function(tab){
			if (tab.name === 'statistics'){
				self.observable.trigger('startSpinning');
				util.getDBData('/api/favorites/stats', self.observable).then(function(res) {
					self.observable.trigger('stopSpinning');
					self.successRate = res.nClassified.toPrecision(4);
					self.update({
						showRate: true
					})
				})
			}
			else {
				self.update({
					showRate: false
				})
			}
		});
	</script>
</nlc-stats>
