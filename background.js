// Supported Formats List along with some sample videos
const formats = [
  ".m3u8",
  ".mpd", // https://s3.amazonaws.com/_bc_dml/example-content/sintel_dash/sintel_vod.mpd
  ".mp4", // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4
  ".webm", // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-webm-file.webm
  ".ogv", // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-ogv-file.ogv
  ".mov", // https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mov-file.mov
  ".mp3",
];

// State
const state = {
  enabled: true,
};

// Actions for mutating extension behaviour
const setEnabled = (newState = true) => {
  state.enabled = newState;
  state.enabled
    ? chrome.browserAction.setIcon({ path: "icons/icon128.png" })
    : chrome.browserAction.setIcon({ path: "icons/icon128_disabled.png" });
};

// Creating Options in contextMenus
chrome.contextMenus.create({
  contexts: ["browser_action"],
  id: "enable-disable",
  title: "Enable/Disable Extension",
  type: "checkbox",
  checked: state.enabled,
});

// Handling click on contextMenus Items
chrome.contextMenus.onClicked.addListener((item) => {
  const { menuItemId, checked } = item;
  if (menuItemId === "enable-disable") {
    setEnabled(checked);
  }
});

// Listening to keyboard shortcuts commands specified in manifest.json
chrome.commands.onCommand.addListener(function (command) {
  if (command === "toggle-extension") {
    setEnabled(!state.enabled);
  }
});

// Utility Function
// Genearte URL/Path Pattern For Formats
const extPatternPaths = (formats) => {
  return formats.map((format) => `*://*/*${format}*`);
};

// Capturing URL Input
chrome.webRequest.onBeforeRequest.addListener(
  function (info) {
    const isFormatSupported = (url, formats) => {
      const resourceURL = url.split("?")[0].split("#")[0];
      for (const format of formats) {
        if (resourceURL.endsWith(format)) {
          return true;
        }
      }
      return false;
    };
    if (state.enabled && isFormatSupported(info.url, formats)) {
      var playerUrl =
        chrome.runtime.getURL("player/player.html") + "#" + info.url;
      if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        chrome.tabs.update(info.tabId, { url: playerUrl });
        return { cancel: true };
      } else {
        return { redirectUrl: playerUrl };
      }
    }
  },
  { urls: extPatternPaths(formats), types: ["main_frame"] },
  ["blocking"]
);

// Capturing Omnibox Input
chrome.omnibox.onInputEntered.addListener(function (input) {
  // if extension is disabled using enabled property
  // then it will get enable again if omnibox onInputEntered is triggered
  if (!state.enabled) {
    setEnabled(true);
  }
  var playerUrl = chrome.runtime.getURL("player/player.html") + "#" + input;
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.tabs.update(tabs[0].id, { url: playerUrl });
  });
});
