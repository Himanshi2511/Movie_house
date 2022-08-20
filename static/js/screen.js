//Screen sharing person side's js



const socket = io("ws://localhost:3000");

const peer = new Peer(undefined, { //me
  path: '/peerjs', //from index.js
  host: '/',
  port: '3000'
})


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


navigator.mediaDevices.getDisplayMedia({
  video: {
    cursor: "always"
  },
  audio: {
    echoCancellation: true,
    noiseSuppresion: true
  }
}).then(stream => {

  myVideoStream = stream;
  const package = document.createElement('div');
  package.setAttribute('id', myUserId)
  package.append(myVideo);
  const name = document.createElement('h5')
  name.classList.add("hide");
  package.append(name)
  const videoGrid = document.getElementById('video-main-grid')
  videoGrid.append(package)
  addVideoStream(myVideo, stream, myUserId)

  peer.on('call', function(call) { //set listeners when somebody calls u
    call.answer(stream);
    console.log(call)
    call.on('stream', function(userVideoStream) {
    })
  })

  socket.on('display', function(userId) {
    connectToNewUser(userId, stream)
  })
  socket.emit('startdisplay', myUserId, '')

})
function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream)
  call.on('stream', function(userVideoStream) {
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

socket.on('leavemeet', function(userId) {
  var x = document.getElementById(userId);
  if (x)
    x.remove()
  if (peers[userId]) peers[userId].close()
})

let text = $("input");
$('html').keydown(function(e) {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val(), myUserId, UserName);
    text.val('')
  }
});
