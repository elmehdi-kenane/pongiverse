
import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import { useNavigate } from "react-router-dom"

const BlockPopUp = ({ setShowBlockPopup, setDirects, selectedDirect, user, setSelectedDirect, setSelectedItem}) => {
    const navigate = useNavigate()
    const blockUser = async () => {
        setShowBlockPopup(false)
        try{
            const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/friends/block_friend/`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from_username: user,
                    to_username: selectedDirect.name,
                }),
            })
            const data = await response.json()
            if(response.ok){
                setDirects((prev) => {
                    return prev.filter((direct) => direct.name !== selectedDirect.name)
                })
                setSelectedDirect({
                    id: "",
                    name: "",
                    avatar: "",
                    status: "",
                })
                setSelectedItem("")
            } else
                navigate('/signin')
        }
        catch(err){
            console.log(err)
        }
    }
    return (
        <div className="blockPopUp">
        <div className="blockPopUp__container">
            <div className="blockPopUp__header">
            <h3>Block User</h3>
            <button onClick={() => setShowBlockPopup(false)}>
                <CloseIcon />
            </button>
            </div>
            <div className="blockPopUp__body">
            <p>Are you sure you want to block this user?</p>
            </div>
            <div className="blockPopUp__footer">
            <button onClick={() => setShowBlockPopup(false)}>Cancel</button>
            <button onClick={blockUser}>Block</button>
            </div>
        </div>
        </div>
    )
    }
export default BlockPopUp