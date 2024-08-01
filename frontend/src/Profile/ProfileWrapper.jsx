import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../Settings/assets/Group.svg"
import bg from "./assets/bg1.jpg"

const ProfileContext = createContext();

export default ProfileContext;

export const ProfileWrapper = ({ child }) => {

    const [userData, setUserData] = useState(null)

    const { user } = useContext(AuthContext);
    const [userPic, setUserPic] = useState(mavPic);
    const [userBg, setUserBg] = useState(bg);
    const [userEmail, setUserEmail] = useState(null);
    // const [userPwd, setUserPwd] = useState(null);
    const [userBio, setUserBio] = useState(null);
    const [userLevel, setUserLevel] = useState(null);
    const [userCountry, setUserCountry] = useState("Morocco");

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch('http://localhost:8000/profile/getUserData', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: user
                    })
                });
                const res = await response.json()
                if (response.ok) {
                    // console.log("Response userData : ", res.userData);
                    setUserData(res.userData);
                }
                else
                    console.log("Error : ", res.error);
            } catch (error) {
                console.log("Error: ", error);
            }
        }
        if (user)
            getUserData();
    }, [user])

    useEffect(() => {
        const getUserPic = async (picPath, fnc) => {
            try {
                const response = await fetch(`http://localhost:8000/api/getImage`, {
                    method: "POST",
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify({
                        image: picPath
                    })
                });
                const blob = await response.blob();
                fnc(URL.createObjectURL(blob));
            } catch (error) {
                console.log("Error : ", error)
            }
        }
        if (userData){
            getUserPic(userData.pic, setUserPic)
            getUserPic(userData.bg, setUserBg)
            setUserEmail(userData.email)
            setUserBio(userData.bio)
            // setUserPwd(userData.password)
            setUserLevel(userData.level)
        }
    }, [userData])

    let userInfoData = {
        userPic: userPic,
        setUserPic: setUserPic,
        userBg: userBg,
        setUserBg: setUserBg,
        userEmail: userEmail,
        setUserEmail: setUserEmail,
        userBio: userBio,
        setUserBio: setUserBio,
        userLevel: userLevel,
        setUserLevel: setUserLevel,
        userCountry: userCountry,
        setUserCountry: setUserCountry,

    };
    return (
        <ProfileContext.Provider value={userInfoData}> {child} </ProfileContext.Provider>
    )
}
