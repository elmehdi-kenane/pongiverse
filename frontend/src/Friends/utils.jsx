export const CancelFriendRequest = (currentUsername, secondUsername) => {
    fetch('http://localhost:8000/friends/cancel_friend_request/', {
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
};