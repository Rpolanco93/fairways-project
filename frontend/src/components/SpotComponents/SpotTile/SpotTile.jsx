import { NavLink } from 'react-router-dom';
import imageComingSoon from './comingsoon.jpeg'
import './SpotTile.css';

const SpotTile = ({spot}) => {
    const spotTiles = spot.Spots.map(({id, previewImage, city, state, price, avgRating}) => {
        if (!avgRating) avgRating = 0;
        if (!previewImage) previewImage = imageComingSoon;
        return (
            <NavLink to={`/spots/${id}`}>
                <div className="spot-tile">
                    <img src={previewImage} className="preview-img"/>
                    <div>{`${city}, ${state}, ${avgRating}`}</div>
                    <div>{`$${price} night`}</div>
                </div>
            </NavLink>
        )
    })

    return (
        <div className="tile-container">
            {spotTiles}
        </div>
    )
}

export default SpotTile;
