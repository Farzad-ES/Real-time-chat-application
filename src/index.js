const http=require('http')
const path=require('path')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {
    generateMessage,
    generateLocationMessage
}=require('./utils/messages.js')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}=require('./utils/users.js')

const port=process.env.PORT || 3000
const app=express()
const server=http.createServer(app)
const io=socketio(server)

io.on('connection', (socket)=>{
    console.log('New WebSocket connection detected')
    
    socket.on('join', ({ username, room }, callback)=>{
        const {error, user}=addUser({ id:socket.id, username, room })

        if(error){
            return callback(error) 
        }

        socket.join(user.room)

        socket.emit('Message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('Message', generateMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(clientMessage, callback)=>{
        const filter=new Filter()

        if(filter.isProfane(clientMessage)){
            return callback('Profanity is not allowed!')
        }

        const user=getUser(socket.id)

        io.to(user.room).emit('Message', generateMessage(user.username, clientMessage))
        callback()
    })

    socket.on('sendLocation', (coordinations, callback)=>{
        const user=getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coordinations.latitude},${coordinations.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('Message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }       
    })
})

const publicDirectory=path.join(__dirname,'../public')

app.use(express.static(publicDirectory))

server.listen(port, ()=>{
    console.log(`Server is up on port ${port}`)
})