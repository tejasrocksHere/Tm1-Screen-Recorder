// Inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^https/.test(tab.url)) {
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ["./content.js"],
      })
      .then(() => {
        console.log("We have injected the content script");
      })
      .catch((err) => {
        console.error("Failed to inject script: ", err);
      });
  }
});


// chrome.runtime.onMessage.addListerner((req,sender,sendResp)=>{

// })