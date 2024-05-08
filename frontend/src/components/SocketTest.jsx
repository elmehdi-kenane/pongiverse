import React, { useEffect, useState } from 'react';

const WebSocketComponent = () => {

	const [mySocket, setMySocket] = useState(null);
	let a = false

	const sendData = () => {
		const dataform = {
			"rida" : "ennaciri",
			"lyes" : "lyes"
		};
		console.log(dataform)
		mySocket.send(JSON.stringify(dataform));
	};

	useEffect(() => {
		const socket = new WebSocket('ws://localhost:8000/ws/myappsocket');
		socket.onopen = () => {
			console.log('WebSocket connected');
			setMySocket(socket);
		};

		socket.onmessage = (event) => {
			console.log('Received message:', event.data);
		};

		socket.onclose = () => {
			console.log('WebSocket disconnected');
		};
		return () => {
			console.log("here")
			if (!a) {
				socket.close();
				a = true
			}
		};
	}, []);

	return (
		<div>
			{mySocket &&
				<button onClick={sendData}>SEND</button>
			}
		</div>
	);
};

export default WebSocketComponent;