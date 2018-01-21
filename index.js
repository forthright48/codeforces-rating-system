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

class StandingsRow {
  /**
   * @rank  double
   * @party  Party
   * @points  double
   */
  constructor(party, points) {
    this.rank = 0.0;
    this.party = party;
    this.points = points;
  }
  get getRank() {
    return this.rank;
  }
  get getParty() {
    return this.party;
  }
  get getPoints() {
    return this.points;
  }
}

class Party {
  constructor(username) {
    this.username = username;
  }
}

class CodeforcesRatingCalculator2 {
  /**
   * @previousRatings: Map<Party, Integer> -> Map:Party->Integer
   * @standingsRows: List<StandingsRows> -> [StandingsRow]
   * @newcomers: Set<Party>-> {}
   */
  calculateRatingChanges(previousRatings, standingsRows) {
    const contestants = standingsRows.map((standingsRow)=> {
      const rank = standingsRow.getRank();
      const party = standingsRow.getParty();
      return new Contestant(
        party, rank, standingsRow.getPoints(), previousRatings.get(party));
    });

    this.process(contestants);

    const ratingChanges = new Map();
    contestants.forEach((contestant)=>{
      ratingChanges[contestant.party] = contestant.delta;
    });
    return ratingChanges;
  }

  process(contestants) {
    if (contestants.length === 0 ) {
      return;
    }

    this.reassignRanks(contestants);

    contestants = contestants.map((a)=>{
      a.seed = 1;
      contestants.forEach((b)=>{
        if ( a !== b ) {
          a.seed += this.getEloWinProbability(b, a);
        }
      });
      return a;
    });

    contestants = contestants.map((contestant)=> {
      const midRank = Math.sqrt(contestant.rank * contestant.seed);
      contestant.needRating = getRatingToRank(contestants, midRank);
      contestant.delta = (contestant.needRating - contestant.rating) / 2;
      return contestant;
    });

    this.sortByRatingDesc(contestants);

    // Total sum should not be more than zero.
    {
      let sum = 0;
      contestants.forEach((c)=>{
        sum += c.delta;
      });
      let inc = -sum / contestants.length - 1;
      contestants.forEach((contestant)=>{
        contestant.delta += inc;
      });
    }

    // Sum of top-4*sqrt should be adjusted to zero.
    {
      let sum = 0;
      const zeroSumCount = Math.min(
        Math.floor(4 * Math.round(Math.sqrt(contestants.length))),
        contestants.length);
      for (let i = 0; i < zeroSumCount; i++) {
          sum += contestants[i].delta;
      }
      const inc = Math.min(Math.max(-sum / zeroSumCount, -10), 0);
      contestants = contestants.map((contestant)=>{
        contestant.delta += inc;
        return contestant;
      });
    }

    this.validateDeltas(contestants);
  }

  reassignRanks(contestants) {
    this.sortByPointsDesc(contestants);

    contestants = contestants.map((contestant)=> {
      contestant.rank = 0;
      contestant.delta = 0;
      return contestant;
    });

    let first = 0;
    let points = contestants[0].points;
    for ( let i = 1; i < contestants.length; ++i ) {
      if (contestants[i].points < points ) {
        for ( let j = first; j < i; ++j ) {
          contestants[j].rank = i;
        }
        first = i;
        points = contestants[i].points;
      }
    }
    {
      let rank = contestants.length;
      for ( let j = first; j < contestants.length; j++ ) {
        contestants[j].rank = rank;
      }
    }
  }

  sortByPointsDesc(contestants) {
    contestants.sort(function(a, b) {
      return a.points > b.points;
    });
  }

  getEloWinProbabilityRating(ra, rb) {
    return 1.0 / (1 + Math.pow(10, (rb - ra) / 400.0));
  }

  getEloWinProbability(a, b) {
    return getEloWinProbabilityRating(a.rating, b.rating);
  }

  getRatingToRank(contestants, rank) {
    let left = 1;
    let right = 8000;

    while (right - left > 1) {
      const mid = (left + right) / 2;
      if (getSeed(contestants, mid) < rank) {
        right = mid;
      } else {
        left = mid;
      }
    }
    return left;
  }

  getSeed(contestants, mid) {
    const extraContestant = new (null, 0, 0, rating);
    let result = 1;
    contestants.forEach((other)=>{
      result += this.getEloWinProbability(other, extraContestant);
    });
    return result;
  }

  sortByRatingDesc(contestants) {
    contestants.sort((a, b)=> {
      return a.rating > b.rating;
    });
  }

  validateDeltas(contestants) {
    this.sortByPointsDesc(contestants);

    for (let i = 0; i < contestants.length; i++) {
      for (let j = i + 1; j < contestants.length; j++) {
        // Contestant i has better place than j

        if (contestants[i].rating > contestants[j].rating) {
          // If a contestant a also has higher rating than j

          // So, a's rating should stay higher than j's.
          if (contestants[i].rating + contestants[i].delta <
            contestants[j].rating + contestants[j].delta) {
            throw new Error('First rating invariant failed' +
            contestants[i].party.username + ' vs. ' +
            contestants[j].party.username + '.');
          }
        }

        if (contestants[i].rating < contestants[j].rating) {
          // a did better than b even though a has lower rating

          // So a should have higher rating change than b
          if ( contestants[i].delta < contestants[j].delta) {
            throw new Error('Second rating invariant failed' +
            contestants[i].party.username + ' vs. ' +
            contestants[j].party.username + '.' );
          }
        }
      }
    }
  }
}

class Contestant {
  /**
   * @party  Party
   * @rank  double
   * @points  double
   * @rating  int
   */
  constructor(party, rank, points, rating) {
    this.party = party;
    this.rank = rank;
    this.points = points;
    this.rating = rating;
  }
}

module.exports = {
  Party,
  StandingsRow,
  CodeforcesRatingCalculator2,
};
