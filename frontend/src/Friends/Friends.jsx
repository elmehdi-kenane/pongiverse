import React from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";

const Friends = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await fetch(
        `http://localhost:8000/users/friends/${user}`,
        {
          method: "GET",
        }
      );
      const res = await response.json();
      console.log(res);
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
