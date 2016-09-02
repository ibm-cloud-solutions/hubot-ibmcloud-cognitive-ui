<!--
/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
-->
<db-login>
  <div class='container container--xlarge'>
    <div>
      <form name="login">
        Database <select id="db" onchange={ onchange } >
      </select>
    </form>
  </div>
</div>
<script>
const util = require('./util');
const self = this;
self.mixin('hub');

self.loadList = function(){
  util.getDBs(self.observable).then((dbs) => {
    var sel = document.getElementById("db");
    dbs.forEach(function(i){
      var opt = document.createElement('option');
      opt.innerHTML = i;
      opt.value = i;
      sel.appendChild(opt);
    });
    self.observable.trigger('newDBLoad', document.getElementById("db").value);
  });
};
self.loadList();
self.onchange = function(ev) {
//  self.observable.trigger('page',1);
  self.observable.trigger('newDBLoad', document.getElementById("db").value);

};
</script>

</db-login>
