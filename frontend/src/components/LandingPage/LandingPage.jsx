import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { fetchSpots } from "../../store/spots";
import SpotTile from "../SpotComponents/SpotTile/SpotTile";


const LandingPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const dispatch = useDispatch()
    const spots = useSelector(state => state.spots.allSpots)

    useEffect(() => {
        dispatch(fetchSpots()).then(() => setIsLoaded(true))
    }, [dispatch])

    return isLoaded ? (
            <SpotTile spot={spots} />
    ) : (
        <h1>Loading....</h1>
    )
}

export default LandingPage;
