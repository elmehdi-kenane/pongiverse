import Profile from '../assets/Friends/profile.png';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { colors } from '@mui/material';

const NotificationPopupCard = ({ secondUsername }) => {
    return (
        <div className="NotificationPopupCard">
            <div className='NotificationPopupHeader'>
                <img src={Profile} alt="Profile" />
                <p>
                    <span className="NotificationPopupUsername">{secondUsername}</span> sent you a friend request
                </p>
            </div>
            <div>
                <button>
                    <CheckCircleIcon sx={{ fontSize: 25 }} className='CheckCircleIcon'></CheckCircleIcon>
                </button>
                <button>
                    <CancelOutlinedIcon sx={{ fontSize: 30 }} className='CancelOutlinedIcon'></CancelOutlinedIcon>
                </button>
            </div>
        </div>
    )
}

export default NotificationPopupCard