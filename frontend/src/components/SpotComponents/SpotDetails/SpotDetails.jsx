import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpot } from "../../../store/spots";
import { FaStar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import Reviews from "../../ReviewsComponents/Reviews";
import imageComingSoon from './comingsoon.jpeg'
import './SpotDetails.css'


const SpotDetails = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spots.currSpot)
    const {id} = useParams()

    const comingSoon = () => alert("Feature Coming Soon...")

    let spotImages;

    if (isLoaded) {
        spotImages = spot.SpotImages.map(image => (
            <img src={image.url} key={image.id}/>
        ))
    }

    useEffect(() => {
        dispatch(fetchSpot(id)).then(() => setIsLoaded(true))

    }, [dispatch, id])

    return isLoaded ? (
        <div className="details-page">
        <div className="spot-data">
            <h1>{spot.name}</h1>
            <p>{`${spot.city}, ${spot.state}, ${spot.country}`}</p>
        </div>
        <div className="spot-images">
            {spotImages ? spotImages : <img src={imageComingSoon} />}
        </div>
        <div className="spot-description">
            <div className="host-details">
                <h2>{`Hosted by ${spot.Owner.firstName} ${spot.Owner.lastName}`}</h2>
                <p>{spot.description}</p>
            </div>
            <div className="pricing-reserve">
                <div className="pricing">
                    <h2>{`$${spot.price.toFixed(2)} night`}</h2>
                    <div className="spot-rating">
                            {spot.avgStarRating ? (
                                <p><FaStar /> {(spot.avgStarRating).toFixed(1)}</p>
                            ) : (<FaStar />)}
                            {spot.numReviews ? (
                                <p><LuDot />{spot.numReviews} {
                                    spot.numReviews > 1 ? ('reviews') : ('review')
                                }</p>
                            ) : (
                                <p>New!</p>
                            )}
                        </div>
                </div>
                <div className="reserve">
                    <button onClick={comingSoon} className="reserve-button">Reserve</button>
                </div>
            </div>
        </div>
        <Reviews spot={spot}/>
        </div>
    ) : (
        <h1>Loading...</h1>
    )
}

export default SpotDetails;
