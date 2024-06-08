const GET_SPOTS = 'spots/getAll';
const GET_SPOT = 'spots/spotId';
const UPDATE_SPOT = 'spots/spotId/edit';
const DELETE_SPOT = 'spots/spotId/delete';

//actions
const getSpots = (spots) => ({
    type: GET_SPOTS,
    payload: spots
})

//thunk
export const fetchSpots = () => async (dispatch) => {
    const response = await fetch('/api/spots/');
    const data = await response.json();
    dispatch(getSpots(data))
    return response
}

//reducer
const initialState = {}

const SpotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_SPOTS:
            return {...state, allSpots: action.payload};
        default:
            return state;
    }
};

export default SpotsReducer;
