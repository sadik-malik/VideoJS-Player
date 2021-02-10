// Supported Formats List along with some sample videos
const formats = [
  ".m3u8",
  ".mpd", // https://s3.amazonaws.com/_bc_dml/example-content/sintel_dash/sintel_vod.mpd
  ".mp4", // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4
  ".webm", // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-webm-file.webm
  ".ogv", // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-ogv-file.ogv
  ".mov" // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mov-file.mov
]

// state
const state = {
  enabled: true
}

// actions
const toggle_extension = () => {
  state.enabled = !state.enabled
  state.enabled ? chrome.browserAction.setIcon({path:"icons/icon128.png"}) : chrome.browserAction.setIcon({path:"icons/icon128_disabled.png"})
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){ 
    switch(request.type){
      case 'getState':
        return sendResponse(state)
      case 'toggle-extension':
        toggle_extension()
        return sendResponse(state.enabled)
      default:
        return
    }
  }
);

chrome.commands.onCommand.addListener(function(command) {
  if(command === 'toggle-extension'){
    toggle_extension()
  }
});


// Genearte URL/Path Pattern For Formats
const extPatternPaths = (formats) => {
  return formats.map(format => `*://*/*${format}*`)
}

// Capturing URL Input
chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    const isFormatSupported = (url, formats) => {
      const resourceURL = url.split("?")[0].split("#")[0]
      for(const format of formats){
        if(resourceURL.endsWith(format)){
          return true
        }
      }
      return false
    }
    if (state.enabled && isFormatSupported(info.url, formats)) {     
      var playerUrl = chrome.runtime.getURL('player/player.html') + "#" + info.url
      if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
        chrome.tabs.update(info.tabId, {url: playerUrl});
        return {cancel: true}
      } else {
        return { redirectUrl:  playerUrl }
      }
    }
  },
  {urls: extPatternPaths(formats), types:["main_frame"]},
  ["blocking"]
);

// Capturing Omnibox Input
chrome.omnibox.onInputEntered.addListener(function (input){
    // if extension is disabled using enabled property
    // then it will get enable again if omnibox onInputEntered is triggered
    if(!state.enabled){
      toggle_extension()
    }
    var playerUrl = chrome.runtime.getURL('player/player.html') + "#" + input;
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, {url: playerUrl});
    });
});