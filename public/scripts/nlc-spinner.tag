<!--
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
-->

<nlc-spinner>
	<div if={ showSpinner }>
		<img class='loadingImage' src='../images/loading.gif' style="display: block; margin: 0 auto;"></img>
	</div>
	<script>
		const self = this;
		self.mixin('hub');
		self.observable.on('startSpinning', function(){
			self.update({
				showSpinner: true
			});
		});
		self.observable.on('stopSpinning', function(){
			self.update({
				showSpinner: false
			});
		});
	</script>
</nlc-spinner>
