const {
  Party, StandingsRow, CodeforcesRatingCalculator2, getNewRatings
} = require('../index.js');

const contestants = [{
  position: 1,
  username: 'forthright48',
  previousRating: 1500,
}, {
  position: 2,
  username: 'flash_7',
  previousRating: 1500,
}, {
  position: 2,
  username: 'labib',
  previousRating: 1500,
}];

console.log(getNewRatings(contestants));
