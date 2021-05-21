__author__ = 'Horleryheancarh'

// Imports
const fastify = require('fastify')
const socketio = require('fastify-socket.io')
const { join } = require('path')

// 
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

// Presets
const app = fastify({ logger: true })
const PORT = 3000 || process.env.PORT
const botName = 'Chatapp Bot'

app.register(socketio)
// Set static folder
app.register(require('fastify-static'), {
  root: join(__dirname, 'static'),
})


// Socketio 
app.ready(err => {
  if (err) throw err

  app.io.on('connect', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room)

      socket.join(user.room);
      
      // Welcome message
      socket.emit('message', formatMessage(botName, `Welcome to Chatapp`))

      // Broadcast message for new user
      socket.to(user.room).emit(
        'message', 
        formatMessage(botName, `${user.username} has joined the room`))
      
      
      // Send Users and Room Info
      app.io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    
    })
    
    // Listen for chatMessage
    socket.on('chatMessage', message => {
      // Getting message sender
      const user = getCurrentUser(socket.id)

      // Emit message to frontend
      app.io.to(user.room).emit('message', formatMessage(user.username, message))
    })

    // When client disconnects
    socket.on('disconnect', () => {
      // Getting leaving user
      const user = userLeave(socket.id)

      if (user) {
        // Emit exit messsage
        socket.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the room`))

        // Send Users and Room Info
        socket.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        })
      }
    })
  })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
