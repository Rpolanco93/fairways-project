import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { fetchSpot } from "../../../store/spots";
import SpotForm from "../SpotForm";
import { useParams } from "react-router-dom";

const EditSpot = () => {
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false)
    const {id} = useParams()
    const spot = useSelector(state => state.spots.currSpot)
    console.log('edit spot', spot)


    useEffect(() => {
        dispatch(fetchSpot(id)).then(setIsLoaded(true))
    }, [dispatch, id])

    return isLoaded ? (
        <SpotForm spot={spot} />
    ) : (
        <h1>Loading...</h1>
    )
}

export default EditSpot;
