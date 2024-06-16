import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchSpotReviews } from "../../../store/spots";
import { FaStar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import './Reviews.css'

const Reviews = ({spot}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const dispatch = useDispatch();
    const reviews = useSelector(state => state.spots.reviews)
    const sessionUser = useSelector(state => state.session.user)
    const ownerId = spot.Owner.id
    let isOwner;
    const months = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    }

    console.log(months['04'])

    useEffect(() => {
        dispatch(fetchSpotReviews(spot.id)).then(() => setIsLoaded(true))
    }, [dispatch, spot.id])


    if (sessionUser && sessionUser.id == ownerId) isOwner = true;



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
                    reviews.Reviews.map(review => {
                        let year = review.createdAt.split('-')[0]
                        let month = months[review.createdAt.split('-')[1]]
                        return (
                        <li key={review.id} className="review-data">
                            <h3>{review.User.firstName}</h3>
                            <p>{`${month} ${year}`}</p>
                            <p>{review.review}</p>
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
