import React,  { useContext, useEffect, useState, useRef }  from 'react'
import AuthContext from '../navbar-sidebar/Authcontext'
import { useNavigate } from 'react-router-dom';
import * as Icons from '../assets/navbar-sidebar'

const OneVersusOne = () => {
    let { privateCheckAuth, socket, user,
        socketRecreated, setSocketRecreated, allGameFriends,
        loading, userImages} = useContext(AuthContext)
    const [selected, setSelected] = useState(0)
    const navigate = useNavigate()

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
        navigate('../game/solo')
    }

    const nextPage = () => {
        console.log(socket, socket.readyState === WebSocket.OPEN, user)
        if (selected === 1) {
            navigate('../game/solo/1vs1/random')
        }
        if (selected === 2) {
            navigate('../game/solo/1vs1/friends')
        }
        if (selected === 3) {
            navigate('../game/solo/1vs1/create-or-join')
        }
    }

    return (
        <div className='duelMode' >
            <div className='duelMode-modes' >
                <div className={(selected === 1) ? 'duelMode-modes-quickMatch duelMode-modes-quickMatch-selected' : 'duelMode-modes-quickMatch'} onClick={quickMatch} >
                    <div>
                        <img src={Icons.quickMatch} alt="quick-match" />
                    </div>
                    <h1>Play a Quick Match</h1>
                    <p>Jump into action with a quick match mode where you are randomly paired with another player for a 1 vs 1 game. Enjoy a fast and exciting experience without the wait!</p>
                </div>
                <div className={(selected === 2) ? 'duelMode-modes-friendMatch duelMode-modes-friendMatch-selected' : 'duelMode-modes-friendMatch'} onClick={friendMatch} >
                    <div> 
                        <img src={Icons.friendMatch} alt="friend-match" />
                    </div>
                    <h1>Play with friends</h1>
                    <p>Challenge your friend to a 1 vs 1 game in Friends Match mode. Invite a friend to join you for a competitive and fun-filled match,ensuring  a personalized gaming experience!</p>
                </div>
                <div className={(selected === 3) ? 'duelMode-modes-createJoinMatch duelMode-modes-createJoinMatch-selected' : 'duelMode-modes-createJoinMatch'} onClick={createJoinMatch} >
                    <div className='createJoinMatch__icon' >
                        <div>
                            <img src={Icons.createMatch} alt="create-match" />
                        </div>
                        <img src={Icons.paddleCreateJoin} alt="create-join-match" />
                        <div>
                            <img src={Icons.joinMatch} alt="join-match" />
                        </div>
                    </div>
                    <h1>Create or Join Match</h1>
                    <p>Start a new game or join an existing one in Create/Join Match mode. Create a room and wait for other player to join, or jump into an available match for flexible and instant gameplay.</p>
                </div>
            </div>
            <div className='duelMode-cancel-next' >
                <div onClick={returnBackwards} >Back</div>
                <div id={selected ? 'selected' : ''} onClick={nextPage} >Next</div>
            </div>
        </div>
    )
}

export default OneVersusOne