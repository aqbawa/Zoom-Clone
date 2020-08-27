let MyVideoStream;
const socket = io("/");
const videoGrid = document.getElementById("video-Grid");

const MyVideo = document.createElement("video");
MyVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    MyVideoStream = stream;
    addVideoStream(MyVideo, stream);
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
    let text = $("input");
    $("html").keydown((e) => {
      if (e.which == 13 && text.val().lenght != 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = MyVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    MyVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    MyVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
  <i class="fas fa-microphone"></i>
  <span>Mute</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
  <i class="unmute fas fa-microphone-slash"></i>
  <span>Unmute</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const PlayStop = () => {
  let enabled = MyVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    MyVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    MyVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i>
  <span>Stop Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
const setPlayVideo = () => {
  const html = `<i class=" stop fas fa-video-slash"></i>
  <span>Play Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
