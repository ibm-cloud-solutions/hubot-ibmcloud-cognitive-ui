<!--
/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
-->
<nlc-learned>
	<div if={ showTable } class='container container--xlarge'>
		<table if={ showTable } class='table table--striped'>
			<caption class='table__caption'>Learned</caption>
			<thead class='table__head'>
				<tr class='table__row table__row--heading'>
					<th class='table__cell'>Statement</th>
					<th class='table__cell'>Classification</th>
					<th class='table__cell table__cell--small'>Accept</th>
					<th class='table__cell table__cell--small'>Delete</th>
				</tr>
			</thead>
			<tbody class='table__body'>
				<tr each={ doc in data } class='table__row'>
					<td id='text' class='table__cell' contenteditable='true' data-ph='Text' onkeyup='{ editItem }'>{ doc.text }</td>
					<td id='classification' class='table__cell'>
						<input name='{ doc.id }_class' type='text' class='nlc_select' list='{ doc.id }_classes' value='{ doc.selectedClass }'>
							<datalist id='{ doc.id }_classes'>
								<option each={cls in doc.classes} value='{ cls.class_name }'>
								</datalist>
							</td>
							<td class='table__cell table__cell--small'><span class='acceptBtn' onclick={ acceptItem } title='Accept me'></span></td>
							<td class='table__cell table__cell--small'><span class='deleteBtn' onclick={ deleteItem } title='Delete me'></span></td>
						</tr>
					</tbody>
				</table>
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
			let loadPage = false;
			let db_name;
			const limit = 10;

			self.mixin('hub');
			self.observable.on('newDBLoad', function(db){
				self.update({
					loadPage: true,
					db_name: db,
					data: []
				});
				if (showTable){
					self.loadLearned();
				}
			});

			self.observable.on('tab', function(tab){
				if (tab.name === 'learned'){
					showTable = true;
					if (self.db_name) {
						self.loadLearned();
					}
				}
				else {
					showTable = false;
					self.update({
						showTable: false
					})
				}
			});

			self.loadLearned = function() {
				if (self.data.length > 0){
					self.update({
						showTable: true
					});
					self.observable.trigger('refreshPager', self.pager);
				}
				else {
					self.update({
						showTable: false
					});
					self.observable.trigger('startSpinning');
					var url = `/api/favorites/learned/` + self.db_name;
					util.getDBData(url , self.observable, 1, limit).then(function(res) {
						self.observable.trigger('stopSpinning');
						data = res.data;
						self.update({
							showTable: true,
							data: data,
							pager: {
								pages: Math.round(res.numDocs / limit),
								page: 1
							}
						});
						self.observable.trigger('refreshPager', self.pager);
					});
				}
			};

			self.acceptItem = function(ev) {
				let doc = ev.item.doc;
				// get new class value
				doc.newSelectedClass = this[`${doc.id}_class`].value;
				return util.acceptItem(doc, self.db_name,  self.observable).then(() => {
					self.data = [];
					return self.loadLearned();
				});
			};

			self.selectItem = function(ev) {
				let id = ev.item.doc.id;
				document.getElementById(id + '_class_input').value = ev.target.options[ev.target.selectedIndex].text;
				document.getElementById(id + '_idValue').value = ev.target.options[ev.target.selectedIndex].value;
			};

			self.deleteItem = function(ev) {
				let doc = ev.item.doc;
				util.deleteItem(doc, data, self.db_name, self.observable).then(() => {
					self.data = [];
					return self.loadLearned();
				});
			};

			self.editItem = function(ev){
				// change the backing doc
				if (ev.target.id === 'text'){
					ev.item.doc.newText = ev.target.innerText;
				}
			}

			self.observable.on('page', function(page){
				if (self.showTable) {
					self.update({
						showTable: false
					})
					self.observable.trigger('startSpinning');
					util.getDBData(`/api/favorites/learned/` + self.db_name, self.observable, page, limit).then(function(res) {
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
			</script>
</nlc-learned>
