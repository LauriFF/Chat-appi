const path = require('path')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000
const socketio = require('socket.io')
const publicRoute = path.join(__dirname, '../public')
const Filter = require('bad-words')
const { generateMessage,generateLocationMessage } =require('./utils/messages')
const {addUser,removeUser,getUser,getUsersinRoom}=require('./utils/users')
const io = socketio(server)

app.use(express.static(publicRoute))


io.on('connection',(socket)=>{
    console.log('new websocket connection')
    
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({ id:socket.id,username,room })
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('viesti',generateMessage('admin','tervetuloa'))
        socket.broadcast.to(user.room).emit('viesti',generateMessage('admin',user.username+' on liittynyt'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersinRoom(user.room)
        })
        callback()
    })

    socket.on('viesti',(viesti,callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()

        if(filter.isProfane(viesti)){
            return callback('ei siveettymyyksiä')
        }
        
        io.to(user.room).emit('viesti',generateMessage(user.username,viesti))
        callback()
    })
    socket.on('locationMessage',(locaatio,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${locaatio.latitude},${locaatio.longitude}`))
        callback()
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('viesti',generateMessage('Admin',`${user.username} on lähtenyt`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersinRoom(user.room)
            })
        }

    })
})

server.listen(port,()=>{
    console.log('serveri pystyssä')
})