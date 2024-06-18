import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreateSpot, fetchEditSpot } from "../../../store/spots";
import { useNavigate } from "react-router-dom";
import './SpotForm.css'

const SpotForm = ({spot}) => {
    const [country, setCountry] = useState(spot ? spot.country : '');
    const [address, setAddress] = useState(spot ? spot.address : '');
    const [city, setCity] = useState(spot ? spot.city : '');
    const [state, setState] = useState(spot ? spot.state : '');
    const [lat, setLat] = useState(spot ? spot.lat : '');
    const [lng, setLng] = useState(spot ? spot.lng : '');
    const [description,setDescription] = useState(spot ? spot.description : '');
    const [name, setName] = useState(spot ? spot.name : '');
    const [price, setPrice] = useState(spot ? spot.price : '');
    const [previewImage, setPreviewImage] = useState(spot && spot.SpotImages ? spot.SpotImages[0].url : '');
    const [imageTwo, setImageTwo] = useState('')
    const [imageThree, setImageThree] = useState('')
    const [imageFour, setImageFour] = useState('')
    const [imageFive, setImageFive] = useState('')
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ownerId = useSelector(state => state.session.user.id)

    //form validation
    const validateForm = () => {
        const formErrors = {}
        if (!country) formErrors.country = 'Country is required';
        if (!address) formErrors.address = 'Address is required';
        if (!city) formErrors.city = 'City is required';
        if (!state) formErrors.state = 'State is required';
        if (description.length > 0 && description.length < 30) formErrors.description = 'Description needs 30 or more characters';
        if (description.length > 255) formErrors.description = 'Description must be 255 characters or less';
        if (!name) formErrors.name = 'Name is required';
        if (name.length > 50) formErrors.name = 'Name must be less than 50 characters';
        if (!price) formErrors.price = 'Price per night is required';
        if (price < 0) formErrors.price = 'Price per day must be a positive number';
        return formErrors
    }

    //remove errors
    const updateState = (setFunc, field) => (e) => {
        setFunc(e.target.value)
        const foo = {...errors}
        const funcErrors = validateForm()
        foo[field] = funcErrors[field]
        setErrors(foo)
    }


    //handle submit and reset form
    const handleSubmit = (e) => {
        e.preventDefault()

        const formErrors = validateForm()

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors)
            return alert('Please Fix All Errors.')
        }

        if (!lat) setLat('33');
        if (!lng) setLng('82')


        const spotData = {
            ownerId,
            address,
            city,
            state,
            country,
            name,
            description,
            price: parseFloat(price),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            images: [
                {
                    url: previewImage,
                    preview: true
                },
                {
                    url: imageTwo
                },
                {
                    url: imageThree
                },
                {
                    url: imageFour
                },
                {
                    url: imageFive
                }
            ]
        }

        if (spot) {
            dispatch(fetchEditSpot({...spotData, spotId: spot.id}))
                .then( () =>  navigate(`/spots/${spot.id}`))
                .catch(async res => {
                    const errors = await res.json()
                    setErrors(errors.errors)
                })
            return;
        }


        dispatch(fetchCreateSpot(spotData))
            .then((newSpot) => navigate(`/spots/${newSpot.id}`))
            .catch(async res => {
                const errors = res
                setErrors(errors.errors)
        })

    }


    return (
        <div className="create-spot">
            <form className='spot-form' onSubmit={handleSubmit}>
            <div className="spot-location">
                {spot ? (<h1>Update your Spot</h1>) : (<h1>Create a new Spot</h1>)}
                <h3>Where&apos;s your place located?</h3>
                <p>Guest will only get your exact address once they
                    booked a reservation.
                </p>

                    <label htmlFor='country' className="spotform-label">Country</label>
                    <input
                        type='text'
                        onChange={updateState(setCountry, 'country')}
                        value={country}
                        placeholder="Country"
                        name='country'
                    />
                    {errors.country && (<p className="create-spot-error">{errors.country}</p>)}

                    <label htmlFor='address' className="spotform-label">Street Address</label>
                    <input
                        type='text'
                        onChange={updateState(setAddress, 'address')}
                        value={address}
                        placeholder="Street Address"
                        name='address'
                    />
                    {errors.address && (<p className="create-spot-error">{errors.address}</p>)}

                    <label htmlFor='city' className="spotform-label">City</label>
                    <input
                        type='text'
                        onChange={updateState(setCity, 'city')}
                        value={city}
                        placeholder="City"
                        name='city'
                    />
                    {errors.city && (<p className="create-spot-error">{errors.city}</p>)}

                    <label htmlFor='state' className="spotform-label">State</label>
                    <input
                        type='text'
                        onChange={updateState(setState, 'state')}
                        value={state}
                        placeholder="State"
                        name='state'
                    />
                    {errors.state && (<p className="create-spot-error">{errors.state}</p>)}

                    <label htmlFor='lat' className="spotform-label">Latitude</label>
                    <input
                        type='text'
                        onChange={updateState(setLat, 'lat')}
                        value={lat}
                        placeholder="Lat is optional"
                        name='lat'
                    />
                    <label htmlFor='lng' className="spotform-label">Longitude</label>
                    <input
                        type='text'
                        onChange={updateState(setLng, 'lng')}
                        value={lng}
                        placeholder="Lng is optional"
                        name='lng'
                    />

            </div>
            <div className="spot-description-form">
                <h3>Describe your place to guest</h3>
                <p>
                    Mention the best features of your space,
                    any special amentities like fast wifi or parking,
                    and what you love about the neighborhood.
                </p>

                    <input
                        type='text'
                        onChange={updateState(setDescription, 'description')}
                        value={description}
                        placeholder="Please write at least 30 characters"
                        name='description'
                    />
                {errors.description && (<p className="create-spot-error">{errors.description}</p>)}
            </div>
            <div className="spot-title">
                <h3>Create a title for your spot</h3>
                <p>
                    Catch guests&apos; attention with a spot title that
                    highlights what makes your place special.
                </p>

                    <input
                        type='text'
                        onChange={updateState(setName, 'name')}
                        value={name}
                        placeholder="Name of your spot"
                        name='name'
                    />
                {errors.name && (<p className="create-spot-error">{errors.name}</p>)}
            </div>
            <div className="spot-price">
                <h3>Set a base price for your spot</h3>
                <p>
                    Competitive pricing can help your listing stand
                    out and rank higher in search results
                </p>

                    <p> $
                        <input
                            type='text'
                            onChange={updateState(setPrice, 'price')}
                            value={price}
                            placeholder="Price per night (USD)"
                            name='price'
                        />
                    </p>
                    {errors.price && (<p className="create-spot-error">{errors.price}</p>)}
            </div>
            <div className="spot-photos">
                <h3>Liven up your spot with photos</h3>
                <p>
                    Submit a link to at least one photo to publish
                    your spot.
                </p>

                    <input
                        type='text'
                        onChange={updateState(setPreviewImage, 'preview')}
                        value={previewImage}
                        placeholder="Preview Image URL"
                        name='url'
                        className="image-input"
                    />
                    <input
                        type='text'
                        onChange={updateState(setImageTwo, 'two')}
                        value={imageTwo}
                        placeholder="Image URL"
                        name='image2'
                        className="image-input"
                    />
                    <input
                        type='text'
                        onChange={updateState(setImageThree, 'three')}
                        value={imageThree}
                        placeholder="Image URL"
                        name='image3'
                        className="image-input"
                    />
                    <input
                        type='text'
                        onChange={updateState(setImageFour, 'four')}
                        value={imageFour}
                        placeholder="Image URL"
                        name='image4'
                        className="image-input"
                    />
                    <input
                        type='text'
                        onChange={updateState(setImageFive, 'five')}
                        value={imageFive}
                        placeholder="Image URL"
                        name='image5'
                        className="image-input"
                    />

            </div>
            {spot ? (<button className="spotForm-button">Update your Spot</button>) :
                (<button className="spotForm-button">Create Spot</button>)}
            </form>
        </div>
    )
}

export default SpotForm;
