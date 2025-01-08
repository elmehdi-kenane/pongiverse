import React from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";

const Friends = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  let a = 0
  
  useEffect(() => {
    const getUsers = async () => {
        const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/profile/${user}`, {
          method: 'GET'
        })
        const res = await response.json()
        setUsers(res)
        // document.write(res)
    }
    if (user)
      getUsers()
  }, [user])

  // const addFriend = async (myuser) => {
  //   const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/users/add/${user}`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       user : myuser,
  //     })
  //   })
  //   const res = await response.json()
  // }

  useEffect(() => {
    const getUsers = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/friends/${user}`,
        {
          method: "GET",
        }
      );
      const res = await response.json();
      setUsers(res.friends);
    };
    if (user) getUsers();
  }, [user]);

  return (
    <div style={{ color: "white" }}>
      Friends
      <ul>
        {users.map((myuser) => (
          <li>{myuser}</li>
        ))}
      </ul>
    </div>
  );
};

export default Friends;
