import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchSpotReviews } from "../../../store/spots";

const Reviews = ({spot}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const dispatch = useDispatch();
    const reviews = useSelector(state => state.spots.reviews)

    useEffect(() => {
        dispatch(fetchSpotReviews(spot.id)).then(() => setIsLoaded(true))
    }, [dispatch])

    return isLoaded ? (
        <div>
            <div>
                <p>star pic</p>
                <p>{spot.avgStarRating} - </p>
                <p>{`${spot.numReviews} reviews`}</p>
            </div>
            <div>
                <ul>
                    {reviews.Reviews.map(review => (
                        <li key={review.id}>
                            <h3>{review.User.firstName}</h3>
                            <p>insert date here</p>
                            <p>{review.review}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    ) : (
        <h1>Loading....</h1>
    )
}

export default Reviews
