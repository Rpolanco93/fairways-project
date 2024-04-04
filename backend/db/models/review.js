'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(
        models.User
      )

      Review.belongsTo(
        models.Spot
      )

      Review.hasMany(
        models.ReviewImages,
        {
          foreignKey: 'reviewId'
        }
      )

    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    review: {
      type: DataTypes.STRING,
    },
    stars: {
      type: DataTypes.INTEGER,
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
