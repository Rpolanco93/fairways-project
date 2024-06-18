import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpots } from "../../store/spots";
import SpotTile from "../SpotComponents/SpotTile/SpotTile";
import './LandingPage.css'


const LandingPage = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const dispatch = useDispatch()
    const spots = useSelector(state => state.spots.allSpots)

    useEffect(() => {
        dispatch(fetchSpots()).then(() => setIsLoaded(true))
    }, [dispatch])

    return isLoaded ? (
        <div className="landing-page">
            <SpotTile payload={{spots}} />
        </div>
    ) : (
        <h1>Loading....</h1>
    )
}

export default LandingPage;
