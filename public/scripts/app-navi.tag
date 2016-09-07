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
		<span class='badge badge--primary' style='float:right'>{ version }</span>
		<div>
			<div class="tabs a-tabs a-tabs--slow tabs--primary" onclick="{ selectedTab }">
				<div class="tabs__headings" >
					<div id="approved" class="tab-heading approved">Approved</div>
					<div id="learned" class="tab-heading learned">Learned</div>
					<div id="unclassified" class="tab-heading unclassified tab-heading--active">Unclassified</div>
					<div id="statistics" class="tab-heading statistics">Statistics</div>
				</div>
			</div>
		</div>
	</div>

	<script>
		const util = require('./util');
		const self = this;

		self.version = 'v1.0.0';

		// subscribe to the event hub
		self.mixin('hub');

		// add event handlers
		// self.tags.tabs.on('open', function(){
		// 	self.observable.trigger('tab', );
		// });

		self.on('mount', function(){
			// trigger active tab
			self.observable.trigger('tab', {
				name: 'unclassified'
			});
		});
		self.selectedTab = function(ev) {
			let val = '.' + ev.target.id;
			document.querySelector('.approved').classList.remove('tab-heading--active');
			document.querySelector('.learned').classList.remove('tab-heading--active');
			document.querySelector('.unclassified').classList.remove('tab-heading--active');
			document.querySelector('.statistics').classList.remove('tab-heading--active');
			document.querySelector(val).classList.add('tab-heading--active');


			self.observable.trigger('tab', {
				name: ev.target.id
			});
		};

	</script>

</app-navi>
