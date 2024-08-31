export const leaveRoomSubmitHandler = (roomName, user, chatSocket) =>{
    console.log("1")
    if(chatSocket) {
      chatSocket.send(JSON.stringify({
        type: 'leaveRoom',
        message : {
          user : user,
          room: roomName
        }
      }))
    }
  }

