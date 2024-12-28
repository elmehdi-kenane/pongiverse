import React, { useState, useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthContext from '../navbar-sidebar/Authcontext'
import * as Icons from '../assets/navbar-sidebar'
import GameNotifications from '../GameNotif/GameNotifications'

const Solo = () => {
	const [roomID, setRoomID] = useState(null)
	let { privateCheckAuth, socket, user } = useContext(AuthContext)
	const navigate = useNavigate()
	const [selected, setSelected] = useState(0)

	const quickMatch = () => {
		setSelected(1)
	}

	const friendMatch = () => {
		setSelected(2)
	}

	const createJoinMatch = () => {
		setSelected(3)
	}

	const returnBackwards = () => {
		navigate('../game')
	}

	const nextPage = () => {
		if (selected === 1)
			navigate('../game/solo/1vs1')
		if (selected === 2)
			navigate('../game/solo/2vs2')
		if (selected === 3)
			navigate('../game/solo/computer')
		}

	useEffect(() => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.onmessage = (event) => {
				let data = JSON.parse(event.data)
				let type = data.type
				if (type === 'hmed')
					socket.close()
			}
		}
	}, [socket])

	return (
		<>
			<GameNotifications />
			<div className='soloMode' >
				<div className='soloMode-modes' >
					<div className={(selected === 1) ? 'soloMode-modes-twoPlayers soloMode-modes-twoPlayers-selected' : 'soloMode-modes-twoPlayers'} onClick={quickMatch} >
						<div>
							<img src={Icons.paddleChallenge} alt="quick-match" />
							<div><p>1v1</p></div>
						</div>
						<div>
							<h1>2 Players</h1>
							<p>Engage in an exhilarating one-on-one match, where two players go head-to-head in a competitive showdown, testing their skills, strategy, quick thinking, and resilience.</p>
						</div>
					</div>
					<div className={(selected === 2) ? 'soloMode-modes-fourPlayers soloMode-modes-fourPlayers-selected' : 'soloMode-modes-fourPlayers'} onClick={friendMatch} >
						<div>
							<img src={Icons.paddleChallenge} alt="quick-match" />
							<div><p>2v2</p></div>
						</div>
						<div>
							<h1>4 Players</h1>
							<p>Initiate an exciting match where you and a teammate face off against two opponents simultaneously in an intense 2 vs 2 competition, testing your coordination and strategy skills.</p>
						</div>
					</div>
					<div className={(selected === 3) ? 'soloMode-modes-bot soloMode-modes-bot-selected' : 'soloMode-modes-bot'} onClick={createJoinMatch} >
						<div>
							<img src={Icons.paddleChallenge} alt="quick-match" />
							{/* <div><p>2v2</p></div> */}
							<div id='ai-robot' ><img src={Icons.aiRobot} alt="" /></div>
						</div>
						<div>
							<h1>Bot Player</h1>
							<p>Initiate a match against an AI-controlled bot, testing your skills against a challenging virtual opponent. This mode lets you practice and refine your techniques against a smart adversary.</p>
						</div>
					</div>
				</div>
				<div className='soloMode-cancel-next' >
					<div onClick={returnBackwards} >Back</div>
					<div id={selected ? 'selected' : ''} onClick={nextPage} >Next</div>
				</div>
			</div>
		</>
	)
}

export default Solo