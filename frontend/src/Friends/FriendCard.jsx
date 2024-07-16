import { useState, useRef, useEffect } from 'react';

import Profile from '../assets/Friends/profile.png';
import ThreeDots from '../assets/Friends/dots-vertical.svg';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';

// I needs to fix two problems:
// - the option-list should kept in the cadre of the friend-section
// - the option-list should unappears if a part of it is hidden

const FriendCard = ({ friendSectionRef, isLastTwoElements, secondUsername}) => {
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const handleClickOutside = (event) => {
        if (menuRef && menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false); // Close the sidebar if the click is outside
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        console.log("isMenuOpen: ", isMenuOpen);
        console.log("buttonRef.current: ", buttonRef.current);
        if (isMenuOpen && buttonRef.current && { friendSectionRef }.current) {
            const menu = buttonRef.current.getBoundingClientRect();
            const friendSection = { friendSectionRef }.current.getBoundingClientRect();
            console.log("button attrs");
            console.log("menu.top: ", menu.top);
            console.log("menu.left: ", menu.left);
            console.log("menu.right: ", menu.right);
            console.log("menu.bottom: ", menu.bottom);
            if (friendSection.top > menu.top)
                console.log("menu is hidden at the TOP");
        }
    }, [isMenuOpen]
    );

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            const scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
            clearTimeout(scrollTimeout);
        };

        const listElement = friendSectionRef.current;
        console.log(listElement);
        if (listElement) {
            listElement.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (listElement) {
                listElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="FriendCard">
            <div className="ProfileName">
                <img src={Profile} alt="Profile" className="Profile" />
                {secondUsername}
            </div>
            {isMenuOpen ?
                <>
                    <button className="FriendBtn detailsOpened" onClick={toggleMenu} ref={buttonRef}>
                        <img src={ThreeDots} alt="ThreeDots" />
                    </button>
                    {/* {console.log("isLastTwoElements: ", isLastTwoElements)} */}
                    <div className={`optionsFriendCard ${isLastTwoElements ? "lastTwoElements" : ""}`} ref={menuRef}>
                        <button>
                            <ChatBubbleIcon />
                            Message
                        </button>
                        <button>
                            <SportsEsportsIcon />
                            Challenge
                        </button>
                        <button>
                            <PersonRemoveIcon />
                            Unfriend
                        </button>
                        <button>
                            <RemoveCircleOutlineIcon />
                            Block
                        </button>
                    </div>
                </>
                :
                <button className="FriendBtn detailsClosed" onClick={toggleMenu}>
                    <img src={ThreeDots} alt="ThreeDots" />
                </button>
            }
        </div>
    )
}

export default FriendCard