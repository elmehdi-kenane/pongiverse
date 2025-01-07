import CameraAltIcon from "@mui/icons-material/CameraAlt"
import * as ChatIcons from "../../assets/chat/media"
import { useRef } from "react"

const CreateRoomForm = (props) => {

  const fileInputRef = useRef(null)

  const handleContainerClick = () => {
    fileInputRef.current.click()
  }

  return (
    <>
      <div className="create-room-input-container">
        <div className="create-room-icon-wrapper" onClick={handleContainerClick}>
          <img
            src={ChatIcons.PlaceHolder}
            alt="Chat Room Icon"
            className="create-room-icon-placeholder"
          />
          <div className="create-room-change-icon">
            <CameraAltIcon className="create-room-camera-icon" />
            <div>Select Room Icon</div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={props.onChangeIcon}
          />
        </div>
        <div className="create-room-inputs">
          <div className="create-room-name-input-wrapper">
            <input
              type="text"
              className="create-room-name-input"
              placeholder="Enter room name"
              name="name"
              value={props.formData.name}
              onChange={props.onChangeHandler}
              maxLength={20}
            />
            <div className="create-room-name-character-count">
              ({props.formData.name.length}/18)
            </div>
          </div>
          {props.errors.name && (
            <span id="create-room-errors">{props.errors.name}</span>
          )}
          <div className="create-room-topic-input-wrapper">
            <textarea
              className="create-room-topic-input"
              placeholder="Enter room topic"
              name="topic"
              value={props.formData.topic}
              onChange={props.onChangeHandler}
            ></textarea>
            <div className="create-room-topic-character-count">
              ({props.formData.topic.length}/80)
            </div>
          </div>
          {props.errors.topic && (
            <span id="create-room-errors">{props.errors.topic}</span>
          )}
        </div>
      </div>
      <div className="create-room-actions-next">
        <button
          className="create-room-cancel-button"
          onClick={() => props.setStep(1)}
        >
          Previous
        </button>
        {props.roomVisibility === "protected-visibility" ? (
          <button
            className={
              props.formData.name.length > 0 &&
              props.formData.topic.length >= 50
                ? "create-room-next-button-active"
                : "create-room-next-button"
            }
            disabled={
              !(
                props.formData.name.length > 0 &&
                props.formData.topic.length >= 50
              )
            }
            onClick={() => props.setStep(3)}
          >
            Next
          </button>
        ) : (
          <button
            className="create-room-create-button create-room-create-button-active"
            onClick={props.submitHandler}
          >
            Create
          </button>
        )}
      </div>
    </>
  )
}

export default CreateRoomForm
