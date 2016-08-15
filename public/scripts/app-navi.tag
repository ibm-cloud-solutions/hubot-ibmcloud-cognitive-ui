<!--
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
-->

<app-navi>
	<div class='container container--xlarge'>
		<h1 class='heading heading--small'>
			IBM Cloud Solutions - Language Training Center
		</h1>
		<span class='badge badge--primary' style='float:right'>{ version }</span>
		<div>
			<rg-tabs name='tabs' tabs='{ rgOpts.tabs }' opts='{ rgOpts.opts }'></rg-tabs>
		</div>
	</div>

	<script>
		const util = require('./util');
		const self = this;

		self.version = 'v1.0.0';

		// subscribe to the event hub
		self.mixin('hub');

		/*
		 * TABS
		 */
		self.rgOpts = {
			tabs: {
				type: 'primary|secondary|success|error',
				tabs: [{
					name: 'approved',
					heading: 'Approved'
				}, {
					name: 'learned',
					heading: 'Learned'
				}, {
					name: 'unclassified',
					heading: 'Unclassified',
					active: true
				}, {
					name: 'statistics',
					heading: 'Statistics'
				}]
			}
		};

		// add event handlers
		self.tags.tabs.on('open', function(tab){
			self.observable.trigger('tab', tab);
		});

		self.on('mount', function(){
			// trigger active tab
			self.observable.trigger('tab', {
				name: 'unclassified'
			});
		});

	</script>

</app-navi>
