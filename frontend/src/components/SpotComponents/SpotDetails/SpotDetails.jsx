import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpot } from "../../../store/spots";
import Reviews from "../../ReviewsComponents/Reviews";
import imageComingSoon from './comingsoon.jpeg'


const SpotDetails = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spots.currSpot)
    const {id} = useParams()

    const comingSoon = (e) => alert("Feature Coming Soon...")

    let spotImages;

    if (isLoaded) {
        const getImages = spot.SpotImages.map(image => (
            <img src="{image.url}" />
        ))
    }

    useEffect(() => {
        dispatch(fetchSpot(id)).then(() => setIsLoaded(true))

    }, [dispatch])

    return isLoaded ? (
        <div className="details-page">
        <div className="spot-data">
            <h1>{spot.name}</h1>
            <p>{`${spot.city}, ${spot.state}, ${spot.country}`}</p>
        </div>
        <div className="spot-images">
            {spotImages ? spotImages : <img src={imageComingSoon} />}
        </div>
        <div>
            <div className="host-details">
                <h2>{`Hosted by ${spot.Owner.firstName} ${spot.Owner.lastName}`}</h2>
                <p>{spot.description}</p>
            </div>
            <div className="pricing-reserve">
                <div className="pricing">
                    <h2>{`$${spot.price} night`}</h2>
                    <p>{`${spot.numReviews} reviews`}</p>
                </div>
                <div>
                    <button onClick={comingSoon} className="reserve">Reserve</button>
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
