import React from 'react'

const NotificationsIcon = ({ notifications, notificationsDropDownisOpen, Icons,           notificationsHandleDropDown }) => {
  return (
    <div id="notifications-icon" onClick={notificationsHandleDropDown}>
        <a href="#">
            <img src={Icons.notification} alt="notifications-icon"/>
        </a>
        {notificationsDropDownisOpen && (
            (notifications.length && (
                <div className='notifications-container'>
                    {
                        notifications.map((notification, index) => {
                            return (
                                <div key={notification.id}
                                className='notifications-dropdown'
                                >
                                <div className='notifications-pic-text'>
                                    <div id='notifications-pic'>
                                        <a href="#">
                                            <img src={Icons.profilepic} alt="profile-pic" />
                                        </a>
                                    </div>
                                    <div id='notifications-text'>
                                        <a href="#">
                                            {notification.notificationText}
                                        </a>
                                    </div>
                                </div>
                                {index != notifications.length - 1 && (<hr></hr>)}
                            </div>
                            );
                        })
                    }
                </div>
        )) || (
            !notifications.length && (
            <div className='no-notifications-dropdown'>
                <div id='dropdown-notifications-title'>
                    Notifications
                </div>
                <div id='dropdown-notifications-separator'>
                    <div id='notifications-line-break'></div>
                </div>
                <div id='dropdown-notifications-body'>
                    There is no notifications for now.
                </div>
            </div>
            )
        )
        )}
    </div>
  )
}

export default NotificationsIcon;