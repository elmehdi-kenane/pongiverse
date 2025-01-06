import * as ChatIcons from "../../assets/chat/media"

const CreateRoomVisibilityOptions = (props) => {
  return (
    <>
      <div className="create-room-visibility-options">
        <div
          className={
            props.roomVisibility === "public-visibility"
              ? "create-room-option create-room-option-selected"
              : "create-room-option"
          }
          onClick={() => props.setRoomVisibility("public-visibility")}
        >
          <img
            src={ChatIcons.publicVisibility}
            alt="Public"
            className="public-option-icon visibility-option-icon"
          />
          <div className="create-room-option-text">Public</div>
        </div>
        <div
          className={
            props.roomVisibility === "private-visibility"
              ? "create-room-option create-room-option-selected"
              : "create-room-option"
          }
          onClick={() => props.setRoomVisibility("private-visibility")}
        >
          <img
            src={ChatIcons.privateVisibility}
            alt="Private"
            className="private-option-icon visibility-option-icon"
          />
          <div className="create-room-option-text">Private</div>
        </div>
      </div>
      <div className="create-room-actions">
        <button className="create-room-cancel-button" onClick={props.onClose}>
          Cancel
        </button>
        <button
          className="create-room-next-button-active"
          onClick={() => props.setStep(2)}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default CreateRoomVisibilityOptions
