import Avatar from './avatar.svg'

const OtherMessage = (props) => {
    return (
        <div className="message-row__other-message">
            <img  className="message-row__other-message__avatar" src={Avatar} alt="" />
            <div className="message-row__other-message__text other-message" >
                {props.content}
            </div>
        </div>
    )
}

export default OtherMessage