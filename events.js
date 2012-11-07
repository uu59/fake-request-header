var data, reRules;

function setupEventMonitor() {
  data = Datastore.load();
  rePatterns = data.map(function(policy){ return new RegExp(policy.pattern.replace(/\*/g, ".*")); });

  chrome.webRequest.onBeforeSendHeaders.addListener(
    beforeEventCallback,
    {
      urls: data.map(function(rule){ return rule.pattern; })
    },
    ["blocking", "requestHeaders"]
  );
}

function beforeEventCallback(details){
  var matchedUrl = details.url;
  var index = 0;
  rePatterns.some(function(pattern){
    ++index;
    return pattern.test(matchedUrl);
  });
  var policy = data[index - 1];
  var targetHeaders = Object.keys(policy.rules);
  var sendHeaders = details.requestHeaders;

  targetHeaders.forEach(function(name){
    var value = Policy.calculateRuledValue(policy.rules[name]);
    if(value === null) {
      // "noop"
      return;
    }

    sendHeaders = sendHeaders.filter(function(head){
      return head.name != name;
    });

    if(value && value.length > 0) {
      // only push "fixed"
      sendHeaders.push({
        name: name,
        value: value
      });
    }
  });

  return {
    requestHeaders: sendHeaders
  };
}

chrome.extension.onMessage.addListener(
  function(message){
    if(message == "DataUpdated") {
      chrome.webRequest.onBeforeSendHeaders.removeListener(beforeEventCallback);
      setupEventMonitor();
    }
  }
);

setupEventMonitor();
