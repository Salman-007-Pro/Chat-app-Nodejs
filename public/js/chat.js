const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

//templates
const $messagesTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate =
  document.querySelector('#location-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  //height of last message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of message container
  const containerHeight = $messages.scrollHeight;

  //how far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset)
    $messages.scrollTop = $messages.scrollHeight;

  console.log(scrollOffset);
  console.log(containerHeight);
  console.log(visibleHeight);
  console.log(newMessageMargin);
  console.log(newMessageHeight);
};

socket.on('message', (message) => {
  const html = Mustache.render($messagesTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm:ss a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', ({ url, createdAt, username }) => {
  console.log(url);
  const html = Mustache.render($locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format('h:mm:ss a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  //disable
  $messageFormButton.setAttribute('disabled', 'true');

  const message = $messageFormInput.value;

  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) return console.error(error);
    console.log('The message was delivered');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  //disable
  $sendLocationButton.setAttribute('disabled', 'true');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
      () => {
        $sendLocationButton.removeAttribute('disabled');
        console.log('location Shared!!');
      }
    );
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
// socket.on('counterUpdated',(count)=>{
//     console.log("Counter Successfully updated: ",count)
//     document.getElementById("content").innerHTML="Counter: "+count
// });

// document.querySelector("#btn").addEventListener("click",()=>{
//    socket.emit('counterIncreament');
// })

// document.querySelector('#btn1').addEventListener('click', () => {
//   socket.emit('counterDecreament');
// });
