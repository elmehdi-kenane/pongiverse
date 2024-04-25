

const JoinChannel = (props) => {
    return (
        <div className="main_page">
            <div className="join-modal">
                <h3 id='modal-header'>Join a Channel</h3>
                <form action="" id="join-form">
                    <input type="text" placeholder="Channel Name" />
                    <input type="text" placeholder="Channel Password" />
                    <div className="join-buttons">
                        <button>JOIN</button>
                        <button onClick={props.onClose}>CANCEL</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default JoinChannel