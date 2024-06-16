import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchSpotReviews } from "../../../store/spots";
import { useModal } from '../../../context/Modal';
import DeleteReviewModal from "../DeleteReviewModal/DeleteReviewModal";
import { FaStar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import './Reviews.css'

const Reviews = ({spot}) => {
    const { setModalContent } = useModal()
    const [isLoaded, setIsLoaded] = useState(false);
    const dispatch = useDispatch();
    const reviews = useSelector(state => state.spots.reviews)
    const sessionUser = useSelector(state => state.session.user)
    const ownerId = spot.Owner.id
    let isOwner;

    console.log(reviews)

    function orderReviews() {
        let unordered = Object.values(reviews)
        let ordered = unordered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return ordered
    }

    useEffect(() => {
        dispatch(fetchSpotReviews(spot.id)).then(() => setIsLoaded(true))
    }, [dispatch, spot.id])


    if (sessionUser && sessionUser.id == ownerId) isOwner = true;

    const deleteButton = (e, id) => {
        e.stopPropagation()
        e.preventDefault()
        setModalContent(<DeleteReviewModal reviewId={id} />)
    }

    return isLoaded ? (
        <div>
            <div className="review-header">
                {spot.avgStarRating ? (
                    <p><FaStar /> {spot.avgStarRating.toFixed(1)} </p>
                ) : ( <FaStar /> )}

                {spot.numReviews ? (
                                <p><LuDot />{spot.numReviews} {
                                    spot.numReviews > 1 ? ('reviews') : ('review')
                                }</p>
                            ) : (
                                <p>New!</p>
                            )}
            </div>
            <div>
                <ul>
                    {!isOwner && (
                    <div className="Post-review">
                        <button
                        className="post-review-button"
                        onClick={() => alert("Function Coming Soon!")}
                    >
                        Post Your Review
                    </button>
                    </div> )}
                    {spot.numReviews ? (
                    orderReviews().map(review => {
                        return (
                        <li key={review.id} className="review-data">
                            <h3>{review.User.firstName}</h3>
                            <p>{new Date(Date.parse(review.updatedAt)).toLocaleString("en-US", {
                                month: 'long',
                                year: 'numeric'
                                })}
                            </p>
                            <p>{review.review}</p>
                            {ownerId == review.id &&
                                <div className="delete-review">
                                    <button
                                        className="go-to-delete-review"
                                        onClick={e => deleteButton(e, review.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            }
                        </li>
                    )})
                    ) : ( <p>Be the first to post a review!</p> )}
                </ul>
            </div>
        </div>
    ) : (
        <h1>Loading....</h1>
    )
}

export default Reviews
