import { useState } from "react";
import arrowToTop from "../assets/LandingPage/arrowToTop.svg";
import arrowToBottom from "../assets/LandingPage/arrowToBottom.svg";

const DescriptionCard = ({ title, shortText, longText }) => {
    const [readMore, setReadMore] = useState(false);

    const handleReadMoreBtn = () => {
        setReadMore(!readMore);
    }
	return (
		<div className='DescriptionLandingPage'>
			<h1>{title}</h1>
            {
                <div>
                    {readMore ? longText : shortText}
                </div>
            }
            <button onClick={handleReadMoreBtn} className="read-btn">{readMore ? "Read Less" : "Read More"}
                <img src={readMore ? arrowToTop : arrowToBottom} alt="arrow" />
            </button>
		</div>
	)
}

export default DescriptionCard;