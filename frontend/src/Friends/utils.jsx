export const cancelFriendRequest = (
  currentUsername,
  secondUsername,
  eventType
) => {
  fetch("http://localhost:8000/friends/cancel_friend_request/", {
    method: "POST",
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
  fetch("http://localhost:8000/friends/confirm_friend_request/", {
    method: "POST",
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
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};


export const handleAddFriendReq = (currentUsername, secondUsername, setFriendRequestBtn) => {
    fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/friends/add_friend_request/`, {
        method: 'POST',
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
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    setFriendRequestBtn(true);
};