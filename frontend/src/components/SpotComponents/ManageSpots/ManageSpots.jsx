import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { fetchManageSpots } from "../../../store/spots";
import SpotTile from "../SpotTile/SpotTile";


const ManageSpots = () => {
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false);
    const spots = useSelector(state => state.spots.mySpots)

    useEffect(() => {
        dispatch(fetchManageSpots()).then(() => setIsLoaded(true))
    }, [dispatch])

    return isLoaded ? (
        <SpotTile payload={{spots, owner: true}} />
    ) : (
        <h1>Loading...</h1>
    )
}

export default ManageSpots;
