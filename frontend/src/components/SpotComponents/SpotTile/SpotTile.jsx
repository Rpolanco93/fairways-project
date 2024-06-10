import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import './SpotTile.css';

const SpotTile = ({spot}) => {
    const allSpots = spot.Spots

    const spotTiles = spot.Spots.map(({id, previewImage, city, state, price, avgRating}) => {
        if (!avgRating) avgRating = 0;
        if (!previewImage) previewImage = 'Images coming soon!'
        return (
            <div className="spot-tile">
                <image><NavLink to={`/spots/${id}`}>{previewImage}</NavLink></image>
                <div>{`${city}, ${state}, ${avgRating}`}</div>
                <div>{`$${price} night`}</div>
            </div>
        )
    })

    return (
        <div className="tile-container">
            {spotTiles}
        </div>
    )
}

export default SpotTile;
