import React from 'react'
import { useNavigate } from 'react-router-dom'

const Solo = () => {
  const navigate = useNavigate()
  const goToTwoPlayersPage = () => {
    navigate("../game/solo/1vs1")
  }

  return (
    <>
      <div>Solo</div>
      <button onClick={goToTwoPlayersPage}>2 Players</button>
    </>
  )
}

export default Solo