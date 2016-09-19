/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */

require('blaze');
require('riotgear');
require('./scripts/app.tag');

const hub = {
	observable: riot.observable()
};

riot.mixin('hub', hub);

riot.route.base('/training/');
riot.mount('app');

riot.route.start(true);
