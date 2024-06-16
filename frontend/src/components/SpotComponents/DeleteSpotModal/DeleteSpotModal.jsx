import { useDispatch } from 'react-redux';
import { useModal } from '../../../context/Modal';
import { fetchDeleteSpot } from '../../../store/spots';

const DeleteSpotModal = ({spotId}) => {
    const dispatch = useDispatch()
    const { closeModal } = useModal()


    const handleSubmit = () => {
        dispatch(fetchDeleteSpot(spotId))
            .then(() => {
                closeModal()
            })
    }

    const handleCancel = () => {
        closeModal()
    };

    return (
        <>
            <h1>Confirm Delete</h1>
            <p className='delete-message'>
                Are you sure you want to remove this spot from
                the listings?
            </p>
            <form className='delete-modal-form'>
                <button
                    type='button'
                    className='delete-spot-button delete-yes'
                    onClick={handleSubmit}
                >
                    Yes (Delete Spot)
                </button>
                <button
                    type='button'
                    className='delete-spot-button delete-no'
                    onClick={handleCancel}
                >
                    No (Keep Spot)
                </button>
            </form>
        </>
    )
}

export default DeleteSpotModal;
