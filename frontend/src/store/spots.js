import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/getAll';
const GET_SPOT = 'spots/spotId';
const GET_MY_SPOTS = 'spots/current'
const CREATE_SPOT = 'spots/new'
const DELETE_SPOT = 'spots/spotId/delete';
const GET_SPOT_REVIEWS = 'spots/spotId/reviews'
const CREATE_REVIEW = 'spots/spotId/createReviews'
const DELETE_REVIEW = 'reviews/reviewId'

//actions
const getSpots = (spots) => ({
    type: GET_SPOTS,
    payload: spots
})

const getMySpots = (spots) => ({
    type: GET_MY_SPOTS,
    payload: spots
})

const getSpot = (spot) => ({
    type: GET_SPOT,
    payload: spot
})

const getSpotReviews = (reviews) => ({
    type: GET_SPOT_REVIEWS,
    payload: reviews
})

const createSpot = (spot) => ({
    type: CREATE_SPOT,
    payload: spot
})

// const deleteSpot = (spotId) => ({
//     type: DELETE_SPOT,
//     payload: spotId
// })

// const createReview = (review) => ({
//     type: CREATE_REVIEW,
//     payload: review
// })

// const deleteReview = (reviewId) => ({
//     type: DELETE_REVIEW,
//     payload: reviewId
// })

//thunk
export const fetchSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots');
    const data = await response.json();
    dispatch(getSpots(data))
    return response
}

export const fetchManageSpots = () => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/current`);
    const data = await response.json();
    dispatch(getMySpots({...data}))
    return response
}

export const fetchSpot = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${id}`);
    const data = await response.json();
    dispatch(getSpot(data))
    return response;
}

export const fetchCreateSpot = (payload) => async (dispatch) => {

    const response = await csrfFetch('/api/spots', {
        method: 'POST',
        body: JSON.stringify(payload)
    })
    const data = await response.json();
    dispatch(createSpot(data))
    return data;
}

export const fetchEditSpot = (payload) => async (dispatch) => {
    const { spotId } = payload;
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    })
    const data = await response.json();
    dispatch(createSpot(data))
    return response;
}

export const fetchDeleteSpot = (spotId) => async () => {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'DELETE'
    });

    return response
}

export const fetchSpotReviews = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${id}/reviews`);
    const data = await response.json();
    dispatch(getSpotReviews(data));
    return response;
}

export const fetchCreateReview = (payload) => async () => {
    const { spotId, review, stars  } = payload;
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
            review,
            stars
      })
    })

    return response;
}

export const fetchDeleteReview = (reviewId) => async () => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
    });

    return response
}


//reducer
const initialState = {
    allSpots: {},
    currSpot: null,
    mySpots: {},
    reviews: {},
    images: {}
};

const SpotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SPOTS:
            return {...state, allSpots: action.payload};
        case GET_SPOT:
            return {...state, currSpot: action.payload};
        case GET_MY_SPOTS:
            return {...state, mySpots: {...action.payload}};
        case GET_SPOT_REVIEWS:{
            const newState = { ...state, reviews: {} };
            action.payload.Reviews.forEach(review => {
                newState.reviews[review.id] = review;
            })
            return newState
        }
        case CREATE_SPOT: {
            const newState = {...state}
            newState.allSpots[action.payload.id] = action.payload
            return newState
        }
        case DELETE_SPOT: {
            // async () => await removeSpotFromStore()
            // return {...state}
            let newAllSpots;
            let newMySpots;
            const spotId = action.payload

            if (state.allSpots) {
                const data = {...state.allSpots.Spots}
                let Spots = Object.values(data)
                let index;
                for (let i = 0; i < Spots.length; i++) {
                    if (Spots[i].id == spotId) index = i
                }
                Spots.splice(index, 1)
                newAllSpots = Object.assign({}, Spots)
            }

            if (state.mySpots) {
                const data = {...state.mySpot.Spots}
                let Spots = Object.values(data)
                let index;
                for (let i = 0; i < Spots.length; i++) {
                    if (Spots[i].id == spotId) index = i
                }
                Spots.splice(index, 1)
                newMySpots = Object.assign({}, Spots)
            }

            return {...state, allSpots: newAllSpots, mySpots: newMySpots}
        }
        case CREATE_REVIEW:{
            const newState = {...state}
            newState.reviews = newState.reviews ? {...newState.reviews} : {}
            newState.reviews[action.payload.id] = action.payload
            return newState
        }
        case DELETE_REVIEW: {
            const reviewId = action.payload
            const newState = {...state}
            newState.reviews = newState.reviews ? {...newState.reviews} : {}
            delete newState.reviews[reviewId]
            return newState
        }
        default:
            return state;
    }
};

export default SpotsReducer;
