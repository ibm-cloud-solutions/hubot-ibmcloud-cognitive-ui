<!--
/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
-->

<nlc-approved>
	<div class='container container--xlarge'>
		<table if={ showTable } class='table table--striped'>
		  <caption class='table__caption'>Approved</caption>
		  <thead class='table__head'>
		  <tr class='table__row table__row--heading'>
		    <th class='table__cell'>Text</th>
		    <th class='table__cell'>Classification</th>
			<th class='table__cell'>Approval Date</th>
			<th class='table__cell table__cell--small'>Accept</th>
			<th class='table__cell table__cell--small'>Delete</th>
		  </tr>
		  </thead>
		  <tbody class='table__body'>
		  <tr each={ doc in data } class='table__row'>
		    <td id='text' class='table__cell' contenteditable='true' data-ph='Text' onkeyup='{ editItem }'>{ doc.text }</td>
		    <td id='classification' class='table__cell' contenteditable='true' data-ph='Classification' onkeyup='{ editItem }'>{ doc.selectedClass}</td>
			<td class='table__cell'><div if={doc.approved}>{ dateFormat(doc.approved) }</div></td>
			<td class='table__cell table__cell--small'><span class='acceptBtn' onclick={ acceptItem } title='Accept me'></span></td>
			<td class='table__cell table__cell--small'><span class='deleteBtn' onclick={ deleteItem } title='Delete me'></span></td>
		  </tr>
		  </tbody>
		</table>
		<div if={ showTable }>
			<button class="addBtn" onclick={ addItem } title="add record">
				<img src="images/add.png" alt="add">
			</button>
		</div>
	</div>
	<script>
		const util = require('./util');
		const self = this;
		let data = [];
		let showTable = false;
		let pager = {
			page: 1,
			pages: 1
		}
		const limit = 10;

		self.mixin('hub');
		self.observable.on('tab', (tab) => {
			if (tab.name === 'approved'){
				showTable = true;
				self.loadApproved();
			}
			else {
				showTable = false;
				self.update({
					showTable: showTable,
					data: data
				})
			}
		});

		self.acceptItem = function(ev) {
			return util.acceptItem(ev.item.doc, self.observable).then(() => {
				self.update({
					showTable: showTable,
					data: data
				});
			});
		};

		self.dateFormat = require('dateformat');

		self.loadApproved = function() {
			if (data.length > 0){
				self.update({
					showTable: showTable,
					data: data
				});
				self.observable.trigger('refreshPager', self.pager);
			}
			else {
				self.observable.trigger('startSpinning');
				util.getDBData('/api/favorites/approved', self.observable).then((res) => {
					self.observable.trigger('stopSpinning');
					data = res.data;
					self.update({
						showTable: showTable,
						data: data,
						pager: {
							pages: Math.round(res.numDocs / limit),
							page: 1
						}
					});
					self.observable.trigger('refreshPager', self.pager);
				});
			}
    }
		self.observable.on('page', function(page){
			if (self.showTable) {
				self.update({
					showTable: false
				})
				self.observable.trigger('startSpinning');
				util.getDBData(`/api/favorites/approved`, self.observable, page, limit).then(function(res) {
					data = res.data;
					self.observable.trigger('stopSpinning');
					self.update({
						showTable: true,
						data: data,
						pager: {
							pages: Math.round(res.numDocs / limit),
							page: page
						}
					});
				});
			}
		});

		self.addItem = function(ev) {
			data.push({});
			self.update({
				showTable: showTable,
				data: data
			})
		};

		self.deleteItem = function(ev) {
			let doc = ev.item.doc
			util.deleteItem(doc, data, self.observable).then(() => {
				data = [];
				return self.loadApproved();
			});
		};

		self.editItem = function(ev){
			// change the backing doc
			if (ev.target.id === 'text'){
				ev.item.doc.newText = ev.target.innerText;
			}
			else {
				ev.item.doc.newSelectedClass = ev.target.innerText;
			}
		}
	</script>
</nlc-approved>
