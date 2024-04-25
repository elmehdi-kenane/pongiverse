import React, { useEffect, useRef } from 'react';

const Chat = () => {
  const [value, setValue] = React.useState(false);
  let number = 0

  // useEffect(() => {
  //   valueRef.current = value;
  // }, [value]);

  // const clickHandler = () => {
  //   console.log(number)
  // }

  useEffect(() => {
    // window.addEventListener('click', clickHandler)
    console.log("run")
  }, [value]);

  // useEffect(() => {
  //   number = 1
  // }, []);

  const start = () => {
    setValue(!value)
  }

  return (
    <>
      <div style={{ color: 'white' }}>Chat</div>
      <button onClick={start}>click here</button>
    </>
  )
};

export default Chat;
