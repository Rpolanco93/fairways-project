'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SpotImages.belongsTo(
        models.Spot,
      )
    }
  }
  SpotImages.init({
    spotId: DataTypes.INTEGER,
    url: DataTypes.STRING,
    previewImage: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'SpotImages',
  });
  return SpotImages;
};
