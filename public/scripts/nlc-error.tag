<!--
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
-->

<nlc-error>
	<div if={ showError } class='alerts'>
		<div class='alerts__alert alerts__alert--error'>
			<button class='button button--close' onclick='{ onclick }'>×</button>
			{ error }
		</div>
	</div>
	<script>
		const util = require('./util');
		const self = this;
		this.mixin('hub');
		this.observable.on('error', function(errMsg){
			self.update({
				showError: true,
				error: errMsg
			});
		});

		this.onclick = function(e){
			self.update({
				showError: false
			})
		}
	</script>
</nlc-error>
