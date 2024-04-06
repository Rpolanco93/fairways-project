'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReviewImages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ReviewImages.belongsTo(
        models.Review,
        {foreignKey: "reviewId"}
      )
    }
  }
  ReviewImages.init({
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reviews',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    previewImage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'ReviewImages',
  });
  return ReviewImages;
};
