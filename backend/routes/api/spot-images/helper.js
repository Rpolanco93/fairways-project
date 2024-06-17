const {SpotImages} = require("../../../db/models");
module.exports = {
    deleteSpotImage: async (id) => {
        await SpotImages.destroy({where: {id: id}})
    },
    deleteAllSpotImages: async (id) => {
        await SpotImages.destroy({where: {spotId: id}})
    }
}