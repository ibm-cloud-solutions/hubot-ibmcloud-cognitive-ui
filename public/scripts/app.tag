<!--
/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
-->

require('./app-navi.tag');
require('./nlc-error.tag');
require('./nlc-spinner.tag');
require('./nlc-approved.tag');
require('./nlc-learned.tag');
require('./nlc-unclassified.tag');
require('./nlc-stats.tag');
require('./nlc-pages.tag');
require('./db-login.tag');

<app>
	<div class='container container--xlarge'>
		<h1 class='heading heading--small'>
			IBM Cloud Solutions - Language Training Center
		</h1>
	</div>
	<db-login/>
	<app-navi/>
	<nlc-error/>
	<nlc-spinner/>
	<nlc-approved/>
	<nlc-learned/>
	<nlc-unclassified/>
	<nlc-stats/>
	<nlc-pages/>
</app>
