import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { fetchSpots } from "../../store/spots";


const LandingPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const dispatch = useDispatch()
    const spots = useSelector(state => state.spots.allSpots)

    useEffect(() => {
        dispatch(fetchSpots()).then(() => setIsLoaded(true))
    }, [dispatch])

    return isLoaded ? (
            <ul>
                {spots.Spots.map(({id, previewImage, city, state, price, avgRating}) => {
                    if (!avgRating) avgRating = 0;
                    if (!previewImage) previewImage = 'Images coming soon!'
                    return (
                    <li key={id}>
                        <image><NavLink to={`/spots/${id}`}>{previewImage}</NavLink></image>
                        <div>{`${city}, ${state}, ${avgRating}`}</div>
                        <div>{`$${price} night`}</div>
                    </li>
                )})}
            </ul>
    ) : (
        <h1>Loading....</h1>
    )
}

export default LandingPage;
