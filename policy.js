var Policy = (function(){
  "use strict";

  var patternRegex = new RegExp('^(?:\\*|https?)://(?:\\*|(?:\\*[.])[^\\*]*|[^\\*]+)/.*$');

  var validate = function(policy) {
    if(!policy.pattern) return false;
    if(!patternRegex.test(policy.pattern)) return false;

    // validation for URL pattern
    // http://developer.chrome.com/extensions/match_patterns.html
    try {
      var dummy = function(){};
      chrome.webRequest.onBeforeSendHeaders.addListener(
        dummy,
        { urls: [policy.pattern] },
        ["blocking", "requestHeaders"]
      );
      chrome.webRequest.onBeforeSendHeaders.removeListener(dummy);
      return true;
    } catch(e) {
      console.log("unfiltered regex but illegal policy.pattern", policy.pattern);
      return false;
    }
  };

  var ruletypes = {
    noop: {
      label: "noop",
      desc: "nothing to do"
    },
    empty: {
      label: "empty",
      desc: "don't send"
    },
    fixed: {
      label: "fixed",
      desc: "always send fixed string"
    }
  };

  var calculateRuledValue = function(rule) {
    switch(rule.ruletype) {
      case "noop":
        return null;

      case "empty":
        return "";

      case "fixed":
        return rule.value;
    }
  };

  return {
    RULES: ["Referer", "Cookie", "User-Agent"],
    RULETYPES: ruletypes,
    patternRegex: patternRegex,
    validate: validate,
    calculateRuledValue: calculateRuledValue
  };
})();
