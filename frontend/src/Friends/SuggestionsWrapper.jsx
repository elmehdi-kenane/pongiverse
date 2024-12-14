import AuthContext from '../navbar-sidebar/Authcontext'
import { useContext } from 'react'
import SuggestionFriendCard from "./SuggestionFriendCard.jsx";
import useEmblaCarousel from 'embla-carousel-react'
import {
    PrevButton,
    NextButton,
    usePrevNextButtons
} from './EmblaCarouselArrowButtons'
export const SuggestionsWrapper = ({ friendSuggestions }) => {
    const { user } = useContext(AuthContext);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })

    const {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    } = usePrevNextButtons(emblaApi)
    return (
      <>
        <h3 className="FriendsPageHeader SuggestionsHeader">
          {user} Suggestions
        </h3>
        {friendSuggestions.length === 0 && (
          <div className="friendSuggestionsEmpty">
            friend suggestions Empty :/
          </div>
        )}
        <div
          className={`embla ${
            friendSuggestions.length === 0 ? "emblaUndisplayble" : ""
          }`}
        >
          <div className="embla__viewport" ref={emblaRef}>
            <div
              className={`embla__container ${
                prevBtnDisabled && nextBtnDisabled
                  ? "embla__container_centered"
                  : ""
              }`}
            >
              {friendSuggestions.length !== 0 &&
                friendSuggestions.map((SuggestionUser) => (
                  <SuggestionFriendCard
                    key={SuggestionUser.second_username}
                    username={SuggestionUser.second_username}
                    avatar={SuggestionUser.avatar}
                    level={SuggestionUser.level}
                    total_xp={SuggestionUser.total_xp}
                  ></SuggestionFriendCard>
                ))}
            </div>
            <div
              className={`embla__buttons ${
                prevBtnDisabled && nextBtnDisabled ? "disableEmblaBtns" : ""
              }`}
            >
              <PrevButton
                onClick={onPrevButtonClick}
                disabled={prevBtnDisabled}
              >
                Prev
              </PrevButton>
              <NextButton
                onClick={onNextButtonClick}
                disabled={nextBtnDisabled}
              >
                Next
              </NextButton>
            </div>
          </div>
        </div>
      </>
    );
}