// import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useEffect } from "react";
import { useModal } from '../../../context/Modal';
import ReviewFormModal from "../ReviewFormModal/ReviewFormModal";
import DeleteReviewModal from "../DeleteReviewModal/DeleteReviewModal";
import { FaStar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import './Reviews.css'

const Reviews = ({reviews, ownerId, avgStarRating, spotId}) => {
    const { setModalContent } = useModal()
    const sessionUser = useSelector(state => state.session.user)
    let isOwner;
    const numReviews = reviews.length

    useEffect(() => {
        console.log('test')
    }, [reviews])

    let hasReview;
    let isLoggedIn;

    function orderReviews() {
        return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sessionUser && sessionUser.id == ownerId) isOwner = true;
    if (sessionUser && sessionUser.id !== undefined) hasReview = reviews.find(review => review.userId === sessionUser.id)
    if (sessionUser && sessionUser.id !== undefined) isLoggedIn = true;

    const deleteButton = (e, id) => {
        e.stopPropagation()
        e.preventDefault()
        setModalContent(<DeleteReviewModal reviewId={id} />)
    }

    return (
        <div>
            <div className="review-header">
                {avgStarRating ? (
                    <p><FaStar /> {avgStarRating.toFixed(1)} </p>
                ) : ( <FaStar /> )}

                {numReviews ? (
                                <p><LuDot />{numReviews} {
                                    numReviews > 1 ? ('reviews') : ('review')
                                }</p>
                            ) : (
                                <p>New!</p>
                            )}
            </div>
            <div>
                <ul>
                    {!isOwner && !hasReview && isLoggedIn && (
                    <div className="Post-review">
                        <button
                        className="post-review-button"
                        onClick={() => setModalContent(<ReviewFormModal spotId={spotId} />)}
                    >
                        Post Your Review
                    </button>
                    </div> )}
                    {reviews ? (
                    orderReviews().map(review => {
                        return (
                        <li key={review.id} className="review-data">
                            <h3>{review.User.firstName}</h3>
                            <p>{new Date(Date.parse(review.updatedAt)).toLocaleString("en-US", {
                                month: 'long',
                                year: 'numeric'
                                })}
                            </p>
                            <p>{review.review}</p>
                            {sessionUser && sessionUser.id === review.userId  &&
                                <div className="delete-review">
                                    <button
                                        className="go-to-delete-review"
                                        onClick={e => deleteButton(e, review.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            }
                        </li>
                    )})
                    ) : ( <p>Be the first to post a review!</p> )}
                </ul>
            </div>
        </div>
    )
}

export default Reviews
