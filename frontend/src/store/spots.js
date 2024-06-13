import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/getAll';
const GET_SPOT = 'spots/spotId';
const CREATE_SPOT = 'spots/new'
const UPDATE_SPOT = 'spots/spotId/edit';
const DELETE_SPOT = 'spots/spotId/delete';
const GET_SPOT_REVIEWS = 'spots/spotId/reviews'

//actions
const getSpots = (spots) => ({
    type: GET_SPOTS,
    payload: spots
})

const getSpot = (spot) => ({
    type: GET_SPOT,
    payload: spot
})

const getSpotReviews = (spot) => ({
    type: GET_SPOT_REVIEWS,
    payload: spot
})

const createSpot = (spot) => ({
    type: CREATE_SPOT,
    payload: spot
})

//thunk
export const fetchSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots');
    const data = await response.json();
    dispatch(getSpots(data))
    return response
}

export const fetchSpot = (id) => async (dispatch) => {
    const response = await fetch(`/api/spots/${id}`);
    const data = await response.json();
    dispatch(getSpot(data))
    return response;
}

export const fetchSpotReviews = (id) => async (dispatch) => {
    const response = await fetch(`/api/spots/${id}/reviews`);
    const data = await response.json();
    dispatch(getSpotReviews(data));
    return response;
}

export const fetchCreateSpot = (payload) => async (dispatch) => {
    const { ownerId, address,city,state,country,name,description,price } = payload;
    const response = await fetch('/api/spots/', {
        method: 'POST',
        body: JSON.stringify({
            ownerId,
            address,
            city,
            state,
            country,
            name,
            description,
            price
      })
    })
    const data = await response.json();
    dispatch(createSpot(data))
    return response;
}

//reducer
const initialState = {}

const SpotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SPOTS:
            return {...state, allSpots: action.payload};
        case GET_SPOT:
            return {...state, currSpot: action.payload}
        case GET_SPOT_REVIEWS:
            return {...state, reviews: action.payload}
        default:
            return state;
    }
};

export default SpotsReducer;
