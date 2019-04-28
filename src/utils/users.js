const users = []

// addUser, removeUser, getUser, GetUsersinRoom

const addUser = ({ id,username,room })=>{
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    // validate the data
    if(!username || !room){
        return{
            error: 'nimi ja huone vaaditaan'
        }
    }

    // Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser){
        return{
            error: 'käyttäjänimi käytössä'
        }
    }

    //store user
    const user = {id,username,room}
    users.push(user)
    return{user}
}

const getUser = (id)=>{
    const user = users.find((user)=>{
        return id === user.id
    })
    return user
}

const getUsersinRoom = (room)=>{
    const usersInRoom = users.filter((user)=>{
        return user.room === room
    })
    return usersInRoom
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id === id)

    if (index !== -1){
        return users.splice(index,1)[0]
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}