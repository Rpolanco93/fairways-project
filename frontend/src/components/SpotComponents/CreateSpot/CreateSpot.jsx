import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCreateSpot } from "../../../store/spots";
import { useNavigate } from "react-router-dom";
import './CreateSpot.css';

const CreateSpot = () => {
    const [country, setCountry] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    // const [lat, setLat] = useState('');
    // const [lng, setLng] = useState('');
    const [description,setDescription] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState("");
    const [previewImage, setPreviewImage] = useState('');
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
        if (description.length < 30) formErrors.description = 'Description needs 30 or more characters';
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
        if (errors[field]) {
            setErrors((currErrors) => {
                const newErrors = {...currErrors};
                delete newErrors[field]
                return newErrors
            })
        }
    }


    //handle submit and reset form
    const handleSubmit = async (e) => {
        e.preventDefault()
        const formErrors = validateForm()

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors)
            return alert('Please Fix All Errors.')
        }


        const spotData = {
            ownerId,
            address,
            city,
            state,
            country,
            name,
            description,
            price: parseFloat(price)
        }

        try {
            const newSpot = await dispatch(fetchCreateSpot(spotData));
            navigate(`/spots/${newSpot.id}`)
        } catch (res) {
            async (res) => {
                const data = await res.json();
                if (data && data.errors) setErrors(data.errors);
              }
        }
    }


    return (
        <div className="create-spot">
            <form onSubmit={handleSubmit}>
            <div className="spot-location">
                <h1>Create a new Spot</h1>
                <h3>Where&apos;s your place located?</h3>
                <p>Guest will only get your exact address once they
                    booked a reservation.
                </p>

                    <label htmlFor='country'>Country</label>
                    <input
                        type='text'
                        onChange={updateState(setCountry, 'country')}
                        value={country}
                        placeholder="Country"
                        name='country'
                    />
                    {errors.country && (<p className="create-spot-error">{errors.country}</p>)}

                    <label htmlFor='address'>Address</label>
                    <input
                        type='text'
                        onChange={updateState(setAddress, 'address')}
                        value={address}
                        placeholder="Address"
                        name='address'
                    />
                    {errors.address && (<p className="create-spot-error">{errors.address}</p>)}

                    <label htmlFor='city'>City</label>
                    <input
                        type='text'
                        onChange={updateState(setCity, 'city')}
                        value={city}
                        placeholder="City"
                        name='city'
                    />
                    {errors.city && (<p className="create-spot-error">{errors.city}</p>)}

                    <label htmlFor='state'>State</label>
                    <input
                        type='text'
                        onChange={updateState(setState, 'state')}
                        value={state}
                        placeholder="State"
                        name='state'
                    />
                    {errors.state && (<p className="create-spot-error">{errors.state}</p>)}

                    {/* <label for='lat'>Latitude</label>
                    <input type='text'></input>
                    <label for='lng'>Longitude</label>
                    <input type='text'></input> */}

            </div>
            <div className="spot-description">
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
                        placeholder="Description"
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
                        placeholder="Name"
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
                            placeholder="Price"
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
                        onChange={setPreviewImage}
                        value={previewImage}
                        placeholder="Preview Image URL"
                        name='url'
                    />
                    <input
                        type='text'
                        onChange={setImageTwo}
                        value={imageTwo}
                        placeholder="Image URL"
                        name='image2'
                    />
                    <input
                        type='text'
                        onChange={setImageThree}
                        value={imageThree}
                        placeholder="Image URL"
                        name='image3'
                    />
                    <input
                        type='text'
                        onChange={setImageFour}
                        value={imageFour}
                        placeholder="Image URL"
                        name='image4'
                    />
                    <input
                        type='text'
                        onChange={setImageFive}
                        value={imageFive}
                        placeholder="Image URL"
                        name='image5'
                    />

            </div>
            <button>Create Spot</button>
            </form>
        </div>
    )
}

export default CreateSpot;
