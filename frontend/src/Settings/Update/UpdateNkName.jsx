import React, { useRef, useState, useEffect, useContext } from 'react'
import AuthContext from '../../navbar-sidebar/Authcontext';
import SettingsContext from '../SettingsWrapper';
import EditIcon from '@mui/icons-material/Edit';

function UpdateNkName() {
    const [isUpdate, setIsUpdate] = useState(false);
    const submit = !isUpdate ? "Update" : "Confirm";
    const inputRef = useRef(null);
    const iconRef = useRef(null);

    const { user, setUser} = useContext(AuthContext)
    const { notifySuc, notifyErr } = useContext(SettingsContext)

    useEffect(() => {
        if (inputRef.current)
            inputRef.current.focus();
    }, [isUpdate])
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if ((iconRef.current && !event.composedPath().includes(iconRef.current))
                && (inputRef.current && !event.composedPath().includes(inputRef.current))) { setIsUpdate(false); }
        }
        const handleEsc = (event) => {
            (event.key === 'Escape') && setIsUpdate(false);
        };
        document.body.addEventListener("click", handleOutsideClick)
        document.body.addEventListener('keydown', handleEsc);
        return () => {
            document.body.removeEventListener("click", handleOutsideClick)
            document.body.removeEventListener('keydown', handleEsc);
        }
    }, [])

    const updateUserName = async (newUserName) => {
        try {
            const response = await fetch(`http://${import.meta.env.VITE_IPADDRESS}:8000/profile/updateUserName`, {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: user,
                    new_username: newUserName,
                })
            });
            const res = await response.json()
            if (response.ok) {
                notifySuc(res.case);
                setUser(newUserName)
            }
            else
                notifyErr(res.error);
        } catch (error) {
            notifyErr(error);
            console.log(error);
        }
    }

    const onUpdate = () => {
        if (isUpdate)
            if (inputRef.current.value)
                updateUserName(inputRef.current.value)
        setIsUpdate(!isUpdate);
    }
    const handleInputKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (inputRef.current.value)
                updateUserName(inputRef.current.value)
            setIsUpdate(false);
        }
    }

    return (
        <div className="update">
            <p className='title'> NickName </p>
            {!isUpdate && <p className='update__info'> {user} </p>}
            {isUpdate && <input type="text"
                className="update__input"
                placeholder='Enter new Nickname... '
                maxLength={8}
                onKeyDown={handleInputKeyDown}
                ref={inputRef} />}
            <div className="update__btn" onClick={onUpdate} ref={iconRef}> <p> {submit} </p>
                <EditIcon />
            </div>
        </div>
    )
}

export default UpdateNkName

