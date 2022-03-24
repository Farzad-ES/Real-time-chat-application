const users=[]

const addUser=({ id, username, room })=>{
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    if((!username) || (!room)){
        return {
            error:'Username and room are required'
        }
    }

    const existingUser=users.find((user)=>{
        return (user.username===username) && (user.room===room)
    })

    if(existingUser){
        return {
            error:'Username is already taken'
        }
    }

    const user={ id, username, room }
    users.push(user)
    return { user }
}

const removeUser=(id)=>{
    const userIndex=users.findIndex((user)=> user.id===id)

    if(userIndex !== -1){
        return users.splice(userIndex, 1)[0]
    }
}

const getUser=(id)=>{
    const desiredUser=users.find((user)=> user.id===id)
    return desiredUser
}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    const usersWithSameRoom=users.filter((user)=> user.room===room)
    return usersWithSameRoom
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}