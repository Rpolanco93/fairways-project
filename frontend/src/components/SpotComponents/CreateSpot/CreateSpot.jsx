import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchCreateSpot } from "../../../store/spots";
import { useNavigate } from "react-router-dom";

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
    const [url, setUrl] = useState('');
    const [previewImage, setPreviewImage] = useState('')
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //functions for onChange
    const updateCountry = (e) => setCountry(e.target.value);
    const updateAddress = (e) => setAddress(e.target.value);
    const updateCity = (e) => setCity(e.target.value);
    const updateState = (e) => setState(e.target.value);
    const updateDescription = (e) => setDescription(e.target.value);
    const updateName = (e) => setName(e.target.value);
    const updatePrice = (e) => setPrice(e.target.value);
    const updateUrl = (e) => setUrl(e.target.value);

    //handle submit and reset form
    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({});
        const newSpot = {
            address,
            city,
            state,
            country,
            name,
            description,
            price
        }

        try {
            await dispatch(fetchCreateSpot(newSpot))
            console.log(newSpot)
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
                <h3>Where's your place located?</h3>
                <p>Guest will only get your exact address once they
                    booked a reservation.
                </p>

                    <label for='country'>Country</label>
                    <input
                        type='text'
                        onChange={updateCountry}
                        value={country}
                        placeholder="Country"
                        name='country'
                    />
                    <label for='address'>Address</label>
                    <input
                        type='text'
                        onChange={updateAddress}
                        value={address}
                        placeholder="Address"
                        name='address'
                    />
                    <label for='city'>City</label>
                    <input
                        type='text'
                        onChange={updateCity}
                        value={city}
                        placeholder="City"
                        name='city'
                    />
                    <label for='state'>State</label>
                    <input
                        type='text'
                        onChange={updateState}
                        value={state}
                        placeholder="State"
                        name='state'
                    />
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
                        onChange={updateDescription}
                        value={description}
                        placeholder="Description"
                        name='description'
                    />

            </div>
            <div className="spot-title">
                <h3>Create a title for your spot</h3>
                <p>
                    Catch guests' attention with a spot title that
                    highlights what makes your place special.
                </p>

                    <input
                        type='text'
                        onChange={updateName}
                        value={name}
                        placeholder="Name"
                        name='name'
                    />

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
                            onChange={updatePrice}
                            value={price}
                            placeholder="Price"
                            name='price'
                        />
                    </p>

            </div>
            <div className="spot-photos">
                <h3>Liven up your spot with photos</h3>
                <p>
                    Submit a link to at least one photo to publish
                    your spot.
                </p>

                    <input
                        type='text'
                        onChange={setUrl}
                        value={url}
                        placeholder="Preview Image URL"
                        name='url'
                    />

            </div>
            <button>Create Spot</button>
            </form>
        </div>
    )
}

export default CreateSpot;
