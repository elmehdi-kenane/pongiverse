import React, { useState } from "react";
import { useContext, useEffect, useRef } from "react";
import AuthContext from "../navbar-sidebar/Authcontext";
import { formatDistanceToNowStrict } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useScrollTrigger } from "@mui/material";
import { trimStringWithEllipsis } from "../GameNotif/GameNotifications";

const NotificationsIcon = ({
  notificationsDropDownisOpen,
  Icons,
  setNotificationsDropDownisOpen,
}) => {
  const {
    user,
    notifications,
    setNotifications,
    setIsNotificationsRead,
    isNotificationsRead,
  } = useContext(AuthContext);
  const [isShowMore, setIsShowMore] = useState(false);
  const notificationDropDownRef = useRef(null);
  const notificationIconRef = useRef(null);
  const navigate = useNavigate();
  const handleClickOutside = (event) => {
    if (
      notificationDropDownRef &&
      notificationDropDownRef.current &&
      !notificationDropDownRef.current.contains(event.target)
    ) {
      setNotificationsDropDownisOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_IPADDRESS
          }:8000/navBar/get_notifications/${user}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.status === 401)
          navigate('/signin')
        const res = await response.json();
        if (res) {
          console.log("notifications", res);

          setNotifications(
            res.map((item) => {
              trimStringWithEllipsis(item.notification_text);
              return {
                ...item,
                notification_text: trimStringWithEllipsis(
                  item.notification_text
                ),
              };
            })
          );
        }
      } catch (error) {
        console.error("Error in getNotifications:", error.message || error);
      }
    };
    if (user) {
      getNotifications();
    } else console.log("user problem", user);
  }, [user]);

  const handleClearAllNotifications = () => {
    fetch(
      `http://${import.meta.env.VITE_IPADDRESS
      }:8000/navBar/clear_all_notifications/`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user,
        }),
      }
    );
    setNotifications([]);
    setIsShowMore(false);
  };

  return (
    <div id="notifications-icon" ref={notificationDropDownRef}>
      <img
        src={Icons.notification}
        alt="notifications-icon"
        ref={notificationIconRef}
        onClick={() => {
          setNotificationsDropDownisOpen(!notificationsDropDownisOpen);
          setIsNotificationsRead(true);
        }}
      />
      {isNotificationsRead === false && (
        <div className="notifications-unread"></div>
      )}
      {notificationsDropDownisOpen &&
        (notifications.length > 0 ? (
          <div className="notifications-container">
            <div className="notifications-items">
              {isShowMore === true
                ? notifications.map((notification, index) => {
                  return (
                    <Link
                      key={index}
                      className="notification-item"
                      to={notification.url_redirection}
                      onClick={() => {
                        setNotificationsDropDownisOpen(false);
                      }}
                    >
                      <img
                        src={notification.avatar}
                        alt="profile-pic"
                        className="profile-pic"
                      />
                      <p className="notification-text">
                        {notification.notification_text}
                      </p>
                      <p className="SentFriendReqCardSendAt">
                        {formatDistanceToNowStrict(
                          new Date(notification.send_at),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </Link>
                  );
                })
                : notifications.slice(0, 5).map((notification, index) => {
                  return (
                    <Link
                      key={index}
                      className="notification-item"
                      to={notification.url_redirection}
                      onClick={() => {
                        setNotificationsDropDownisOpen(false);
                      }}
                    >
                      <img
                        src={notification.avatar}
                        alt="profile-pic"
                        className="profile-pic"
                      />
                      <p className="notification-text">
                        {notification.notification_text}
                      </p>
                      <p className="SentFriendReqCardSendAt">
                        {formatDistanceToNowStrict(
                          new Date(notification.send_at),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </Link>
                  );
                })}
            </div>
            <hr></hr>
            <div className="manageNotificationsBtns">
              <button onClick={handleClearAllNotifications}>
                Clear All Notifications
              </button>
              <button
                disabled={notifications.length <= 5 ? true : false}
                onClick={() => setIsShowMore(!isShowMore)}
              >
                Show {isShowMore === true ? "Less" : "More"}
              </button>
            </div>
          </div>
        ) : (
          <div className="no-notifications-dropdown">
            <div id="dropdown-notifications-title">Notifications</div>
            <div id="dropdown-notifications-separator">
              <div id="notifications-line-break"></div>
            </div>
            <div id="dropdown-notifications-body">
              There is no notifications for now.
            </div>
          </div>
        ))}
    </div>
  );
};

export default NotificationsIcon;
