const chatForm = document.getElementById('chat-form')
const chatMain = document.querySelector('.chat-main')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
const socket = io()

// Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

// Join room
socket.emit('joinRoom', { username, room })

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  console.log({ room, users })
  outputRoomName(room)
  outputUsers(users)
})

// Get message from server
socket.on('message', message => {
  outputMessage(message)

  // Scroll down
  chatMain.scrollTop = chatMain.scrollHeight
})

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault()

  // Get message from form
  const message = e.target.elements.message.value

  // Emit message to server
  socket.emit('chatMessage', message)

  // Clear Input
  e.target.elements.message.value = ''
  e.target.elements.message.focus()
})

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">
                        ${message.text}
                    </p>
  `
  document.querySelector('.chat-main').appendChild(div)
}

// Add room name to DOM
function outputRoomName(room) {
  console.log(room)
  roomName.innerText = room
}

// Add users to DOM
function outputUsers(users) {
  console.log(users)
  userList.innerHTML = `${ users.map(user => `<li>${user.username}</li>`).join('\n') }`
}