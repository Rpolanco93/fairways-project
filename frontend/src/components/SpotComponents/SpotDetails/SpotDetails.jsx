import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpot } from "../../../store/spots";
import Reviews from "../../ReviewsComponents/Reviews";


const SpotDetails = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spots.currSpot)
    const {id} = useParams()


    useEffect(() => {
        dispatch(fetchSpot(id)).then(() => setIsLoaded(true))
    }, [dispatch])

    // const owner = useSelector(state => state.spots)
    // console.log(owner)
    // const images = useSelector(state => state.spots.currSpot.SpotImages)

    return isLoaded ? (
        <>
        <div>
            <h1>{spot.name}</h1>
            <p>{`${spot.city}, ${spot.state}, ${spot.country}`}</p>
        </div>
        <div>
            <ul>
                {spot.SpotImages.map(image => (
                    <li key={image.id}>{image.url}</li>
                ))}
            </ul>
        </div>
        <div>
            <div>
                <h2>{`Hosted by ${spot.Owner.firstName} ${spot.Owner.lastName}`}</h2>
                <p>{spot.desciption}</p>
            </div>
            <div>
                <div>
                    <h2>{`$${spot.price} night`}</h2>
                    <p>{`${spot.numReviews} reviews`}</p>
                </div>
                <div>
                    <button>Reviews</button>
                </div>
            </div>
        </div>
        <Reviews spot={spot}/>
        </>
    ) : (
        <h1>Loading...</h1>
    )
}

export default SpotDetails;
