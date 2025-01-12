export const cancelFriendRequest = (
  currentUsername,
  secondUsername,
  eventType
) => {
  fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/cancel_friend_request/`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_username: currentUsername,
      to_username: secondUsername,
      event_type: eventType,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
     console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export const confirmFriendRequest = (currentUsername, secondUsername) => {
  fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/confirm_friend_request/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_username: currentUsername,
      to_username: secondUsername,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};


export const handleAddFriendReq = (currentUsername, secondUsername) => {
    fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/add_friend_request/`, {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from_username: currentUsername,
            to_username: secondUsername,
        }),
    })
        .then(response => response.json())
        .then(data => {
        })
        .catch((error) => {
            console.error('Error:', error);
        });
};

// Added by Imad ---
export const handleRemoveFriendship = (user, secondUsername) => {
  fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/remove_friendship/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_username: user,
      to_username: secondUsername,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
     console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export const handleBlockFriend = (user, secondUsername) => {
  fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/block_friend/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from_username: user,
      to_username: secondUsername,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
     console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};