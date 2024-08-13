import * as ChatIcons from "../../assets/chat/media";


const CreateRoomPassword = (props) => {
    return (
        <>
        <div className="create-room-password-input-container">
          <div className="create-room-selected-icon-wrapper">
            <img
              src={ChatIcons.PlaceHolder}
              alt="Chat Room Icon"
              className="create-room-selected-icon"
            />
            <div className="create-room-info">
              <div className="create-room-name">xaxaxaxaxa</div>
              <div className="create-room-topic">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit est.
              </div>
            </div>
          </div>
          <div className="create-room-password-inputs">
            <input
              type="password"
              className="create-room-password-input"
              placeholder="Enter room password"
              name="password"
              value={props.formData.password}
              onChange={props.onChangeHandler}
            />
            {props.errors.password && (
              <span id="create-room-errors">{props.errors.password}</span>
            )}
            <input
              type="password"
              className="create-room-confirm-password-input"
              placeholder="confirm room password"
              name="confirmPassword"
              value={props.formData.confirmPassword}
              onChange={props.onChangeHandler}
            />
            {props.errors.confirmPassword && (
              <span id="create-room-errors">{props.errors.confirmPassword}</span>
            )}
          </div>
        </div>
        <div className="create-room-password-actions">
          <button
            className="create-room-cancel-button"
            onClick={() => props.setStep(2)}
          >
            Previous
          </button>
          <button
            className="create-room-create-button create-room-create-button-active"
            onClick={props.submitHandler}
          >
            Create
          </button>
        </div>
      </>
    )
}

export default CreateRoomPassword