import React from 'react'
import { useNavigate } from 'react-router-dom'

const Modes = () => {
  const navigate = useNavigate()

  const goToSoloPage = () => {
    navigate("../game/solo")
  }

  return (
    <>
        <div>Modes</div>
        <button onClick={goToSoloPage}>Play solo match</button>
    </>
  )
}

export default Modes