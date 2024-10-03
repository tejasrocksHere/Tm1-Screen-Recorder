let recorder = null;

function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });
  recorder.start();

  recorder.onstop = function () {
    stream.getTracks().forEach((track) => track.stop());
  };

  recorder.ondataavailable = function (event) {
    const blob = event.data;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "screen-recording-HD.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
}

async function getAudioStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100, // High-quality audio
      },
    });
  } catch (err) {
    console.error("Error accessing microphone:", err);
    return null;
  }
}

async function startRecordingWithAudio() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1920 }, // Full HD width
        height: { ideal: 1080 }, // Full HD height
        frameRate: { ideal: 60 }, // 60 FPS for smoother video
      },
      audio: false,
    });

    const audioStream = await getAudioStream();

    if (audioStream) {
      // Combine video stream and microphone audio stream
      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
      onAccessApproved(combinedStream);
    } else {
      onAccessApproved(screenStream); // If no microphone available, record video only
    }
  } catch (err) {
    console.error("Error starting screen recording:", err);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
  if (msg.action === "start_recording_no_audio") {
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 },
        },
        audio: false,
      })
      .then((stream) => {
        onAccessApproved(stream);
        sendRes({ status: "Recording started without audio" });
      })
      .catch((err) => {
        console.error("Error starting screen recording: ", err);
        sendRes({ status: "Failed to start recording" });
      });
  }

  if (msg.action === "start_recording_with_audio") {
    startRecordingWithAudio()
      .then(() => {
        sendRes({ status: "Recording started with HD audio and video" });
      })
      .catch((err) => {
        console.error("Error starting screen recording with audio: ", err);
        sendRes({ status: "Failed to start recording" });
      });
  }

  if (msg.action === "stop_recording") {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      sendRes({ status: "Recording stopped" });
    } else {
      sendRes({ status: "No recording in progress" });
    }
  }
});
