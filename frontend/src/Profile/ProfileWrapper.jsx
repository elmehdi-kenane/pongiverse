import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/Group.svg"
import bg from "../assets/Profile/bg1.jpg"
import { useParams } from 'react-router-dom';

const ProfileContext = createContext();

export default ProfileContext;

export const ProfileWrapper = ({ child }) => {

    const [userData, setUserData] = useState(null)
    const { user } = useContext(AuthContext);
    
    const {userId} = useParams();
    const [userPic, setUserPic] = useState(mavPic);
    const [userBg, setUserBg] = useState(bg);
    const [userEmail, setUserEmail] = useState('');
    const [userBio, setUserBio] = useState('');
    const [userLevel, setUserLevel] = useState(null);
    const [userCountry, setUserCountry] = useState(null);

    const [checkUser, setCheckUser] = useState(true);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch('http://localhost:8000/profile/getUserData', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: userId
                    })
                });
                const res = await response.json()
                if (response.ok) {
                    // console.log("Response userData : ", res.userData);
                    setUserData(res.userData);
                }
                else{
                    setCheckUser(false);
                    console.log("Error : ", res.error);
                }
            } catch (error) {
                console.log("Error: ", error);
            }
        }
        if (userId)
            getUserData();
    }, [userId])

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
            setUserBio(userData.bio)
            setUserEmail(userData.email)
            setUserLevel(userData.level)
            setUserCountry(userData.country)
        }
    }, [userData])

    let userInfoData = {
        userId:userId,
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

        checkUser:checkUser,
        setCheckUser:setCheckUser,
    };
    return (
        <ProfileContext.Provider value={userInfoData}> {child} </ProfileContext.Provider>
    )
}
