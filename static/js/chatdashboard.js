//Dashboard chat's js

const socket = io('/')
socket.emit('entermeet', MeetId, '', UserName);

let text = $("#chat-message");
$('html').keydown(function(e) {
  if (e.which == 13) {
    if (text.val().length !== 0) {
      socket.emit('message', text.val(), '', UserName);
      text.val('')
    }
  }
});
//This listens for messages and adds it.
socket.on("message", function(message, userId, userName) {
    $(".notifications").append(`<li class="message"><small><b>${userName}</b></small><br/>${message}</li>`);
  scrollToBottom()
})
function scrollToBottom() {
  var d = $('.all-notification');
  d.scrollTop(d.prop("scrollHeight"));
}
