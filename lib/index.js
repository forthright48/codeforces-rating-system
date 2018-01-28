'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * How to use this:
 *
 * 1. Take the party class and for each user, create a party instance.
 *    new Party(username);
 * 2. Create a map of Party->Rating called previousRatings.
 * 3. Create a StandingsRows array, which is standings.
 *    new StandingsRow(party, points)
 *    The StandingsRows array will get sorted anyway. So points is important.
 * 4. Call CodeforcesRatingCalculator2 with previousRatings map and
 *    StandingsRow array.
 */

/**
 * Changes I made
 *
 * 1. Rank is useless for StandingsRow initially since it gets reassigned
 *    anyways.
 * 2. Newcomers is useless too.
 */

var StandingsRow = function () {
  /**
   * @rank  double
   * @party  Party
   * @points  double
   */
  function StandingsRow(party, points) {
    _classCallCheck(this, StandingsRow);

    this.rank = 0.0;
    this.party = party;
    this.points = points;
  }

  _createClass(StandingsRow, [{
    key: 'getRank',
    value: function getRank() {
      return this.rank;
    }
  }, {
    key: 'getParty',
    value: function getParty() {
      return this.party;
    }
  }, {
    key: 'getPoints',
    value: function getPoints() {
      return this.points;
    }
  }]);

  return StandingsRow;
}();

var Party = function Party(username) {
  _classCallCheck(this, Party);

  this.username = username;
};

var CodeforcesRatingCalculator2 = function () {
  function CodeforcesRatingCalculator2() {
    _classCallCheck(this, CodeforcesRatingCalculator2);
  }

  _createClass(CodeforcesRatingCalculator2, [{
    key: 'calculateRatingChanges',

    /**
     * @previousRatings: Map<Party, Integer> -> Map:Party->Integer
     * @standingsRows: List<StandingsRows> -> [StandingsRow]
     * @newcomers: Set<Party>-> {}
     */
    value: function calculateRatingChanges(previousRatings, standingsRows) {
      var contestants = standingsRows.map(function (standingsRow) {
        var rank = standingsRow.getRank();
        var party = standingsRow.getParty();
        return new Contestant(party, rank, standingsRow.getPoints(), previousRatings.get(party));
      });

      this.process(contestants);

      var ratingChanges = new Map();
      contestants.forEach(function (contestant) {
        ratingChanges.set(contestant.party, contestant.delta);
      });
      return ratingChanges;
    }
  }, {
    key: 'process',
    value: function process(contestants) {
      var _this = this;

      if (contestants.length === 0) {
        return;
      }

      this.reassignRanks(contestants);

      contestants = contestants.map(function (a) {
        a.seed = 1;
        contestants.forEach(function (b) {
          if (a !== b) {
            a.seed += _this.getEloWinProbability(b, a);
          }
        });
        return a;
      });

      contestants = contestants.map(function (contestant) {
        var midRank = Math.sqrt(contestant.rank * contestant.seed);
        contestant.needRating = _this.getRatingToRank(contestants, midRank);
        contestant.delta = Math.trunc((contestant.needRating - contestant.rating) / 2);
        return contestant;
      });

      this.sortByRatingDesc(contestants);

      // Total sum should not be more than zero.
      {
        var sum = 0;
        contestants.forEach(function (c) {
          sum += c.delta;
        });
        var inc = Math.trunc(-sum / contestants.length - 1);
        contestants.forEach(function (contestant) {
          contestant.delta += inc;
        });
      }

      // Sum of top-4*sqrt should be adjusted to zero.
      {
        var _sum = 0;
        var zeroSumCount = Math.min(Math.trunc(4 * Math.round(Math.sqrt(contestants.length))), contestants.length);
        for (var i = 0; i < zeroSumCount; i++) {
          _sum += contestants[i].delta;
        }
        var _inc = Math.min(Math.max(Math.trunc(-_sum / zeroSumCount), -10), 0);
        contestants = contestants.map(function (contestant) {
          contestant.delta += _inc;
          return contestant;
        });
      }

      this.validateDeltas(contestants);
    }
  }, {
    key: 'reassignRanks',
    value: function reassignRanks(contestants) {
      this.sortByPointsDesc(contestants);

      contestants = contestants.map(function (contestant) {
        contestant.rank = 0;
        contestant.delta = 0;
        return contestant;
      });

      var first = 0;
      var points = contestants[0].points;
      for (var i = 1; i < contestants.length; ++i) {
        if (contestants[i].points < points) {
          for (var j = first; j < i; ++j) {
            contestants[j].rank = i;
          }
          first = i;
          points = contestants[i].points;
        }
      }
      {
        var rank = contestants.length;
        for (var _j = first; _j < contestants.length; _j++) {
          contestants[_j].rank = rank;
        }
      }
    }
  }, {
    key: 'sortByPointsDesc',
    value: function sortByPointsDesc(contestants) {
      contestants.sort(function (a, b) {
        return b.points - a.points;
      });
    }
  }, {
    key: 'getEloWinProbabilityRating',
    value: function getEloWinProbabilityRating(ra, rb) {
      return 1.0 / (1 + Math.pow(10, (rb - ra) / 400.0));
    }
  }, {
    key: 'getEloWinProbability',
    value: function getEloWinProbability(a, b) {
      return this.getEloWinProbabilityRating(a.rating, b.rating);
    }
  }, {
    key: 'getRatingToRank',
    value: function getRatingToRank(contestants, rank) {
      var left = 1;
      var right = 8000;

      while (right - left > 1) {
        var mid = Math.trunc((left + right) / 2);
        if (this.getSeed(contestants, mid) < rank) {
          right = mid;
        } else {
          left = mid;
        }
      }
      return left;
    }
  }, {
    key: 'getSeed',
    value: function getSeed(contestants, rating) {
      var _this2 = this;

      var extraContestant = new Contestant(null, 0, 0, rating);
      var result = 1;
      contestants.forEach(function (other) {
        result += _this2.getEloWinProbability(other, extraContestant);
      });
      return result;
    }
  }, {
    key: 'sortByRatingDesc',
    value: function sortByRatingDesc(contestants) {
      contestants.sort(function (a, b) {
        return a.rating > b.rating;
      });
    }
  }, {
    key: 'validateDeltas',
    value: function validateDeltas(contestants) {
      this.sortByPointsDesc(contestants);

      for (var i = 0; i < contestants.length; i++) {
        for (var j = i + 1; j < contestants.length; j++) {
          // Contestant i has better place than j

          if (contestants[i].rating > contestants[j].rating) {
            // If a contestant a also has higher rating than j

            // So, a's rating should stay higher than j's.
            if (contestants[i].rating + contestants[i].delta < contestants[j].rating + contestants[j].delta) {
              throw new Error('First rating invariant failed' + contestants[i].party.username + ' vs. ' + contestants[j].party.username + '.');
            }
          }

          if (contestants[i].rating < contestants[j].rating) {
            // a did better than b even though a has lower rating

            // So a should have higher rating change than b
            if (contestants[i].delta < contestants[j].delta) {
              throw new Error('Second rating invariant failed' + contestants[i].party.username + ' vs. ' + contestants[j].party.username + '.');
            }
          }
        }
      }
    }
  }]);

  return CodeforcesRatingCalculator2;
}();

var Contestant =
/**
 * @party  Party
 * @rank  double
 * @points  double
 * @rating  int
 */
function Contestant(party, rank, points, rating) {
  _classCallCheck(this, Contestant);

  this.party = party;
  this.rank = rank;
  this.points = points;
  this.rating = rating;
};

function getNewRatings(contestants) {
  contestants = contestants.map(function (c) {
    c.party = new Party(c.username);
    return c;
  });

  // previousRatings
  var previousRatings = new Map();
  contestants.forEach(function (c) {
    previousRatings.set(c.party, c.previousRating);
  });

  // standingsRows
  var standingsRows = [];
  var total = contestants.length;

  contestants.forEach(function (c) {
    var points = total - c.position;
    var party = c.party;
    if (points < 0) {
      throw new Error('Position of contestant is higher than length:\n        ' + c.position + ', ' + c.username);
    }
    standingsRows.push(new StandingsRow(party, points));
  });

  var codeforcesRatingCalculator2 = new CodeforcesRatingCalculator2();
  var ratingChanges = codeforcesRatingCalculator2.calculateRatingChanges(previousRatings, standingsRows);

  contestants = contestants.map(function (c) {
    c.delta = ratingChanges.get(c.party);
    c.newRating = c.previousRating + c.delta;
    delete c.party;
    return c;
  });

  return contestants;
}

module.exports = {
  Party: Party,
  StandingsRow: StandingsRow,
  CodeforcesRatingCalculator2: CodeforcesRatingCalculator2,
  getNewRatings: getNewRatings
};