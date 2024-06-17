import { useDispatch } from 'react-redux';
import { useModal } from '../../../context/Modal';
import { fetchDeleteReview } from '../../../store/spots';
import './DeleteReviewModal.css'

const DeleteReviewModal = ({reviewId}) => {
    const dispatch = useDispatch()
    const { closeModal } = useModal()


    const handleSubmit = () => {
        dispatch(fetchDeleteReview(reviewId))
            .then(() => {
                closeModal()
            })
    }

    const handleCancel = () => {
        closeModal()
    };

    return (
        <div className='delete-modal'>
            <h1 className='delete-modal-title'>Confirm Delete</h1>
            <p className='delete-message'>
                Are you sure you want to delete this review?
            </p>
            <form className='delete-modal-form'>
                <button
                    type='button'
                    className='delete-review-button delete-yes'
                    onClick={handleSubmit}
                >
                    Yes (Delete Review)
                </button>
                <button
                    type='button'
                    className='delete-review-button delete-no'
                    onClick={handleCancel}
                >
                    No (Keep Review)
                </button>
            </form>
        </div>
    )
}

export default DeleteReviewModal;
