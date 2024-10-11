import { createContext, useEffect, useState, useContext } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import mavPic from "../assets/Profile/Group.svg"
import bg from "../assets/Profile/bg1.jpg"
import toast from 'react-hot-toast';

const SettingsContext = createContext();

export default SettingsContext;

export const SettingsWrapper = ({ child }) => {

    const [userData, setUserData] = useState(null)
    const { user } = useContext(AuthContext);

    const [userPic, setUserPic] = useState(mavPic);
    const [userBg, setUserBg] = useState(bg);
    const [userEmail, setUserEmail] = useState('');
    const [userBio, setUserBio] = useState('');
    const [userLevel, setUserLevel] = useState(null);
    const [userCountry, setUserCountry] = useState(null);

    const notifySuc = (suc) => toast.success(suc);
    const notifyErr = (err) => toast.error(err);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/profile/getUserData/${user}`, {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                    }
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
        // const getUserPic = async (picPath, fnc) => {
        //     try {
        //         const response = await fetch(`http://localhost:8000/api/getImage`, {
        //             method: "POST",
        //             headers: { 'Content-Type': 'application/json', },
        //             body: JSON.stringify({
        //                 image: picPath
        //             })
        //         });
        //         const blob = await response.blob();
        //         fnc(URL.createObjectURL(blob));
        //     } catch (error) {
        //         console.log("Error : ", error)
        //     }
        // }
        if (userData) {
            setUserPic(userData.pic)
            setUserBg(userData.bg)
            setUserBio(userData.bio)
            setUserEmail(userData.email)
            setUserLevel(userData.level)
            setUserCountry(userData.country)
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

        notifySuc:notifySuc,
        notifyErr:notifyErr

    };
    return (
        <SettingsContext.Provider value={userInfoData}> {child} </SettingsContext.Provider>
    )
}
