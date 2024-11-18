import React from 'react'
import ProfileUserGames1vs1 from './ProfileUserGames1vs1';

const MatchHeaderStates = () => {
  const matchHeader = ["Matches", "Date", "Score", "Hit", "Accuracy", "Rating"]
  
  return (
    <div className="match__states head--height">
      {matchHeader.map((state, key) => {
          return (
            <h4 key={key} className="match__head"> {state} </h4>
          )
        }
      )}
    </div>
  )
}

function ProfileUserGames() {

  return (
    <div className='userstate_matches purple--glass'>
      <div className='userstate-header'><h1> Match History </h1> </div>
      <MatchHeaderStates />
      <ProfileUserGames1vs1 />
    </div>
  )
}

export default ProfileUserGames