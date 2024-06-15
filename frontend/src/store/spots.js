import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/getAll';
const GET_SPOT = 'spots/spotId';
const GET_MY_SPOTS = 'spots/current'
const CREATE_SPOT = 'spots/new'
const DELETE_SPOT = 'spots/spotId/delete';
const GET_SPOT_REVIEWS = 'spots/spotId/reviews'

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

const getSpotReviews = (spot) => ({
    type: GET_SPOT_REVIEWS,
    payload: {...spot}
})

const createSpot = (spot) => ({
    type: CREATE_SPOT,
    payload: spot
})

const deleteSpot = (spotId) => ({
    type: DELETE_SPOT,
    payload: spotId
})

//helper for organizing return data
const sortObj = (obj) => {
    console.log('helper func', obj)
}

//thunk
export const fetchSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots');
    const data = await response.json();
    sortObj(data)
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

export const fetchSpotReviews = (id) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${id}/reviews`);
    const data = await response.json();
    dispatch(getSpotReviews(data));
    return response;
}

export const fetchCreateSpot = (payload) => async (dispatch) => {
    const { ownerId, address,city,state,country,name,description,price } = payload;
    const response = await csrfFetch('/api/spots', {
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
    return data;
}

export const fetchEditSpot = (payload) => async (dispatch) => {
    const { spotId, ownerId, address,city,state,country,name,description,price } = payload;
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'PUT',
        body: JSON.stringify({
            spotId,
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

export const fetchDeleteSpot = (spotId) => async (dispatch) => {
    // const response = await csrfFetch(`/api/spots/${spotId}`, {
    //     method: 'DELETE'
    // });

    // if (response.ok) {
    //     dispatch(deleteSpot(spotId))
    // }
    dispatch(deleteSpot(spotId))
}

//helper for reducer
const removeSpotFromStore = async (newState, spotId) => {
    if (newState.allSpots) {
        console.log(newState.allSpots, spotId)
        // let index;
        // let allSpots = newState.allSpots
        // let spotsArr = Object.values(allSpots)
        // // console.log('before splice ', spotsArr)
        // for (let i = 0; i < spotsArr.length; i++ ) {
        //     let spot = spotsArr[i]
        //     if (spot.id == spotId) index = i
        // }
        // spotsArr.splice(index)
        // // console.log('after splice', spotsArr)
        // newState = {...newState}
    }

    return newState
}



//reducer
const initialState = {}

const SpotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SPOTS:
            return {...state, allSpots: action.payload};
        case GET_SPOT:
            return {...state, currSpot: action.payload};
        case GET_MY_SPOTS:
            return {...state, mySpots: action.payload};
        case GET_SPOT_REVIEWS:
            return {...state, reviews: action.payload}
        case CREATE_SPOT: {
            const newState = {...state}
            newState.allSpots[action.payload.id] = action.payload
            return newState
        }
        case DELETE_SPOT: {
            return removeSpotFromStore({...state}, action.payload)
        }

        default:
            return state;
    }
};

export default SpotsReducer;
