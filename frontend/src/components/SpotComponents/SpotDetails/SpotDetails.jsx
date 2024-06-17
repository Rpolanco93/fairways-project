import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpot, fetchSpotReviews } from "../../../store/spots";
import { FaStar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import Reviews from "../../ReviewsComponents/Reviews";
import imageComingSoon from './comingsoon.jpeg'
import './SpotDetails.css'


const SpotDetails = () => {
    const [isLoaded, setIsLoaded] = useState(false)
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spots.currSpot)
    const reviews = useSelector(state => state.spots.reviews)
    const {id} = useParams()
    const comingSoon = () => alert("Feature Coming Soon...")
    const numReviews = Object.values(reviews)
    let previewImage;
    let spotImages = [];

    if (isLoaded) {
        spot.SpotImages.map(image => {
            if (image.preview) {
                return previewImage = <img src={image.url} key={image.id} height={'100'} width={'100'} />
            }

            if (image.url !== '') {
                spotImages.push(<img src={image.url} key={image.id} height={'100'} width={'100'} />)
            }
        })
    }

    useEffect(() => {
        Promise.all(
            [dispatch(fetchSpot(id)),
            dispatch(fetchSpotReviews(id))]
        )
        .then(() => setIsLoaded(true))

    }, [dispatch, id])



    return isLoaded ? (
        <div className="details-page">
        <div className="spot-data">
            <h1>{spot.name}</h1>
            <p>{`${spot.city}, ${spot.state}, ${spot.country}`}</p>
        </div>
        <div className="spot-images">
            <div className="preview-image-div">
                {previewImage ? previewImage : <img src={imageComingSoon} height={'100'} width={'100'}/>}
            </div>
            {spotImages && (
                <div className="other-images">
                    {spotImages}
                </div>
            )}
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
                                <p><LuDot />{numReviews.length} {
                                    numReviews.length > 1 ? ('reviews') : ('review')
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
        <Reviews reviews={Object.values(reviews)} ownerId={spot.ownerId} spotId={id} avgStarRating={spot.avgStarRating}/>
        </div>
    ) : (
        <h1>Loading...</h1>
    )
}

export default SpotDetails;
