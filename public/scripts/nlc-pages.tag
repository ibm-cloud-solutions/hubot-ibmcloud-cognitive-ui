<!--
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
-->

<nlc-pages>
	<div if={ showPages }>
		<rg-pagination name='pager' pagination='{ rgOpts.pagination }'></rg-pagination>
	</div>

	<script>
		const util = require('./util');
		const self = this;

		self.mixin('hub');
		self.rgOpts = {
	      pagination: {
	          pages: 1,
	          page: 1
	      }
    };
		self.observable.on('tab', function(tab){
			if (tab.name === 'approved' || tab.name === 'learned' || tab.name === 'unclassified'){
				self.update({
					showPages: true
				})
			}
			else {
				self.update({
					showPages: false
				})
			}
		});

		self.observable.on('refreshPager', function(pager) {
			self.update({
				rgOpts: {
					pagination: {
						pages: pager.pages,
						page: pager.page
					}
				}
			});
		})

    self.tags.pager.on('page', function(page){
				self.observable.trigger('page', page);
    });

	</script>
</nlc-pages>
