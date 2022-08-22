//Audience side's js




//*********** Start of code required when running on localhost ***********
const socket = io("ws://localhost:3000");

const peer = new Peer(undefined, { //me
  path: '/peerjs', //from index.js
  host: '/',
  port: '3000'
})
//*********** End of code required when running on localhost ***********

const peers = {}
let myUserId;
let myVideo = document.createElement('video')
myVideo.muted = true; //so that we don't hear us
let myVideoStream;
let ctr = 0;

peer.on('open', function(userId) { //generates my id
  myUserId = userId;
  socket.emit('display', MeetId, userId);
})


navigator.mediaDevices.getUserMedia({
  video: false,
  audio: true

}).then(stream => {

  peer.on('call', function(call) { //set listeners when somebody calls u
    call.answer(stream);
    console.log(call)
    const video = document.createElement('video')
    const package = document.createElement('div');
    package.setAttribute('id', call.peer)
    package.append(video);
    const name = document.createElement('h5')
    name.classList.add("hide");
    package.append(name)
    const videoGrid = document.getElementById('video-main-grid')
    videoGrid.append(package)
    call.on('stream', function(userVideoStream) {
      addVideoStream(video, userVideoStream, call.peer)
    })
  })
})


socket.on('leavemeet', function(userId) {
  var x = document.getElementById(userId);
  if (x)
    x.remove()
  if (peers[userId]) peers[userId].close()
})


function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream)
  call.on('stream', function(userVideoStream) {
    console.log('User2' + call.peer)
  })
  call.on('close', () => {

  })
  peers[userId] = call
}

function addVideoStream(video, stream, id) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', function() {
    video.play()
  })
  video.classList.add('display-video')
}
