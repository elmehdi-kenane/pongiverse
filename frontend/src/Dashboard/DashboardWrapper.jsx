import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/Group.svg"
import bg from "../assets/Profile/bg1.jpg"

const DashboardContext = createContext();

export default DashboardContext;

export const DashboardWrapper = ({ child }) => {

    const { user } = useContext(AuthContext);

    const [userData, setUserData] = useState(null);
    const [userWins, setUserWins] = useState(0);
    const [userLost, setUserLost] = useState(0);
    const [userGoals, setUserGoals] = useState(0);
    const [userLevel, setUserLevel] = useState(0);


    useEffect(()=>{
        if (userData){
            setUserWins(userData.wins)
            setUserLost(userData.lost)
            setUserGoals(userData.goals)
            setUserLevel(userData.level)
        }
    },[userData])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/profile/getUserData/${user}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const res = await response.json()
                if (response.ok) {
                    console.log("userData :", res.userData)
                    setUserData(res.userData);
                }
                else 
                    console.log(res.error);
            } catch (error) {
                console.log("Error: ", error);
            }
        }
        if (user)
            fetchData()
    }, [user])

    let userInfoData = {
        
    };
    return (
        <DashboardContext.Provider value={userInfoData}> {child} </DashboardContext.Provider>
    )
}
