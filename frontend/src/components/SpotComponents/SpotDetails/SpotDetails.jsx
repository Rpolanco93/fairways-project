import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpot } from "../../../store/spots";
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
                    <h2>{`$${spot.price}`}</h2>
                    <p className="pricing-ptags">night</p>
                    <p>{`${spot.numReviews} reviews`}</p>
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
