import React, { useContext, useState } from 'react'
import DoneIcon from '@mui/icons-material/Done';
import AuthContext from '../../navbar-sidebar/Authcontext';
import ProfileContext from '../ProfileWrapper';
import { handleBlockFriend } from '../../Friends/utils';
import { useNavigate } from 'react-router-dom';

function ReportFooter() {

  const { user, setIsReport } = useContext(AuthContext);
  const [isBlock, setIsBlock] = useState(false);
  const { userId, isFriend, reportValue } = useContext(ProfileContext);
  const navigate = useNavigate();

  const handleBlockClick = () => {
    setIsBlock(!isBlock);
  }
  const HandleCancelReport = () => {
    setIsReport(false);
  }
  const handleReportSubmit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PROTOCOL}://${import.meta.env.VITE_IPADDRESS}:${import.meta.env.VITE_PORT}/profile/reportUser`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportedUsername: userId,
          reportMessage: reportValue,
        }),
      });

      const res = await response.json()
      if (response.ok) {
      }
      else if (response.status === 401) {
        navigate('/signin');
      } else
        console.error(res.error);
    } catch (error) {
      console.error("Error: ", error);
    }

    if (isBlock && isFriend === 'true') {
      handleBlockFriend(user, userId)
      navigate('/mainpage/dashboard');
    }
    setIsReport(false);
  }

  return (
    <div className='report__footer'>
      <button className="block-user" onClick={handleBlockClick}>
        <DoneIcon className={!isBlock ? 'block-icon' : 'block-icon valid-bg'} />
        <p> Block {userId} ? </p>
      </button>
      <div className="report-submit">
        <button className='submit-button submit__cancel' onClick={HandleCancelReport}> Cancel </button>
        <button
          className={(reportValue != null) ? 'submit-button submit__report' : 'submit-button need-report'}
          onClick={reportValue && handleReportSubmit}
        > Report </button>
      </div>
    </div>
  )
}

export default ReportFooter
