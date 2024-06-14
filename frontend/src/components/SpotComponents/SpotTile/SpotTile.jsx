import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchSpot } from '../../../store/spots';
import imageComingSoon from './comingsoon.jpeg'
import './SpotTile.css';
import { useState } from 'react';

const SpotTile = ({payload}) => {
    const { spots, owner } = payload;
    const [errors, setErrors] = useState()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const editSpotButton = (id) => {
        try {
            dispatch(fetchSpot(id));
            navigate(`/spots/${id}/edit`);
        } catch (res) {
            async (res) => {
                const data = await res.json();
                if (data && data.errors) setErrors(data.errors);
                return errors;
              }
        }
    }

    const spotTiles = spots.Spots.map(({id, previewImage, city, state, price, avgRating}) => {
        if (!avgRating) avgRating = 0;
        if (!previewImage) previewImage = imageComingSoon;
        return (
            <>
            <NavLink to={`/spots/${id}`} key={id}>
                <div className="spot-tile">
                    <img src={previewImage} className="preview-img"/>
                    <div>{`${city}, ${state}, ${avgRating}`}</div>
                    <div>{`$${price} night`}</div>
                    {owner ? (
                        <div className='update-delete'>
                            <button className='update-button' onClick={() => editSpotButton(id)}>Update</button>
                            <button className='delete-button' onClick={() => navigate('USE MODAL')}>Delete</button>
                        </div>
                    ) : ('')}
                </div>
            </NavLink>
            </>
        )
    })

    return owner ? (
        <>
            <h1>Manage Your Spots</h1>
            <button onClick={() => navigate('/spots/new')}>Create a New Spot</button>
            <div className="tile-container">
                {spotTiles}
            </div>
        </>
    ) : (
        <div className="tile-container">
            {spotTiles}
        </div>
    )
}

export default SpotTile;
