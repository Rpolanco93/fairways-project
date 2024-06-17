module.exports = {
    addSpotImage: async (spot, url, previewImage = false) => {
        if (url == '') return;
        const image = (await spot.createSpotImage({url, previewImage})).toJSON()

        return {
            id: image.id,
            url: image.url,
            preview: image.previewImage
        };
    }
}
