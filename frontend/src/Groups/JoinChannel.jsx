

const JoinChannel = (props) => {
    return (
        <div className="join-modal">
            <div className="join-modal__container">
                <h3 id='join-modal__tittle'>Join a Channel</h3>
                <form action="" className="join-modal__form">
                    <input type="text" placeholder="Channel Name" />
                    <input type="text" placeholder="Channel Password" />
                    <div className="join-modal__buttons join-modal__buttons--active">
                        <button className="join">JOIN</button>
                        <button onClick={props.onClose} className="cancel">CANCEL</button>
                    </div>
                </form>
            </div>
        </div>
)
}

export default JoinChannel