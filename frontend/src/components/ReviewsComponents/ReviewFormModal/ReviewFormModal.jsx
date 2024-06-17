import { useDispatch } from 'react-redux';
import { useModal } from '../../../context/Modal';
import { fetchCreateReview } from '../../../store/spots';
import { useState, useEffect } from 'react';
import './ReviewFormModal.css'

const ReviewFormModal = ({spotId}) => {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [review, setReview] = useState('');
    const [stars, setStars] = useState(null)
    const [hover, setHover] = useState(null)
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setButtonDisabled(review.length < 10 || stars === null);
    }, [review, stars]);

    useEffect(() => {
        return () => {
            setReview("");
            setStars(null);
            setErrors({});
            setButtonDisabled(true);
        }
    }, [closeModal]);

    const updateState = (setFunc) => (e) => {
        setFunc(e.target.value)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setErrors({})

        const payload = {
            spotId,
            review,
            stars
        }

        return dispatch(fetchCreateReview(payload))
            .then(() => {
                closeModal()
            })
            .catch(async res => {
                const data = await res.json();
                if (data && data.errors) {
                    setErrors(data.errors)
                }
            })
    }


    return (
        <div className='submit-review-modal'>
            <h1 className='review-modal-title'>How was your stay?</h1>
            {errors.message && <p className='review-error-message'>{errors.message}</p>}
            <form className='review-modal-form'>
                <input
                    type='textarea'
                    onChange={updateState(setReview)}
                    value={review}
                    placeholder="Leave your review here.."
                    name='review-description'
                    className='review-box'
                >
                </input>
                <div className="review_rating">
                    {[...Array(5)].map((_, index) => {
                    const currentRating = index + 1;
                    return (
                    <label key={index}>
                        <input
                            type="radio"
                            name="rating"
                            value={currentRating}
                            onClick={() => setStars(currentRating)}
                        />
                        <span
                            className="review_star"
                            style={{ color: currentRating <= (hover || stars) ? '#ffc107' : 'grey' }}
                            onMouseEnter={() => setHover(currentRating)}
                            onMouseLeave={() => setHover(null)}
                        >
                            &#9733;
                        </span>
                    </label>
                    );
                    })}
                <label className="stars-label">Stars</label>
                </div>
                <button
                    type='submit'
                    className='submit-review-button'
                    onClick={handleSubmit}
                    disabled={buttonDisabled}
                >
                    Submit Your Review
                </button>
            </form>
        </div>
    )
}
export default ReviewFormModal;
