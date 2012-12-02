/*global chrome, Policy */
var Datastore = (function(){
  "use strict";

  var storage = localStorage;
  var key = "fakes.json";

  var save = function(policies) {
    policies = policies.filter(function(policy){
      return Policy.validate(policy);
    });
    storage.setItem(key, JSON.stringify(policies));
    chrome.extension.sendMessage("DataUpdated");
  };

  var load = function() {
    return JSON.parse(storage.getItem(key)) || [];
  };

  var remove = function(index) {
    var data = load();
    data.splice(index, 1);
    save(data);
  };

  var swap = function(a, b) {
    var data = load();
    var tmp = data[a];
    data[a] = data[b];
    data[b] = tmp;
    save(data);
  };

  return {
    save: save,
    load: load,
    remove: remove,
    swap: swap
  };

})();
