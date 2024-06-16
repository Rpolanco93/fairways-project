import { NavLink, useNavigate } from 'react-router-dom';
import imageComingSoon from './comingsoon.jpeg'
import { useModal } from '../../../context/Modal';
import DeleteSpotModal from '../DeleteSpotModal/DeleteSpotModal';
import './SpotTile.css';

const SpotTile = ({payload}) => {
    const { setModalContent } = useModal()
    const { spots, owner } = payload;
    const navigate = useNavigate()



    const updateButton = (e, id) => {
        e.stopPropagation()
        e.preventDefault()
        navigate(`/spots/${id}/edit`)
    }

    const deleteButton = (e, id) => {
        e.stopPropagation()
        e.preventDefault()
        setModalContent(<DeleteSpotModal spotId={id} />)
    }

    const spotTiles = spots.Spots.map(({id, previewImage, city, state, price, avgRating}) => {
        if (!avgRating) avgRating = 'New';
        if (!previewImage) previewImage = imageComingSoon;
        return (
            <NavLink to={`/spots/${id}`} key={id}>
                <div className="spot-tile">
                    <img src={previewImage} className="preview-img"/>
                    <div>{`${city}, ${state}, ${avgRating}`}</div>
                    <div>
                        <span>{`$${price}`}</span>
                        <label>night</label>
                    </div>
                    {owner ? (
                        <div className='update-delete'>
                            <button className='update-button' onClick={e => updateButton(e, id)}>Update</button>
                            <button className='delete-button' onClick={e => deleteButton(e, id)}>Delete</button>
                        </div>
                    ) : ('')}
                </div>
            </NavLink>
        )
    })

    return (
        <>
            {owner ? (
            <div>
            <h1>Manage Your Spots</h1>
            <button onClick={() => navigate('/spots/new')}>Create a New Spot</button>
            </div>) : ("") }
            <div className="tile-container">
                {spotTiles}
            </div>
        </>
    )
}

export default SpotTile;
