const getPreviewImage = bookings => {
    return bookings.map(booking => {
        const jsonSpot = booking.toJSON();
        if (jsonSpot.Spot.SpotImages[0]) {
            jsonSpot.Spot.previewImage = jsonSpot.Spot.SpotImages[0].url;
        } else {
            jsonSpot.Spot.previewImage = null;
        }
        delete jsonSpot.Spot.SpotImages
        return jsonSpot;
    })
}

module.exports = {
    getPreviewImage
};