document.addEventListener("DOMContentLoaded", () => {
  const startNoAudio = document.querySelector("#start_video_no_audio");
  const startWithAudio = document.querySelector("#start_video_with_audio");
  const stopVideo = document.querySelector("#stop_video");

  const sendMessageToTab = (action) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log(response);
        }
      });
    });
  };

  // Event listeners for the buttons
  startNoAudio.addEventListener("click", () =>
    sendMessageToTab("start_recording_no_audio")
  );
  startWithAudio.addEventListener("click", () =>
    sendMessageToTab("start_recording_with_audio")
  );
  stopVideo.addEventListener("click", () => sendMessageToTab("stop_recording"));
});
