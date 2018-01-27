# Codeforces Rating System

A javascript implementation of CodeForces Rating system. Translated from [MikeMirzayanov's Code](http://codeforces.com/contest/1/submission/13861109)

# How to install it

```
yarn install codeforces-rating-system
```

# How to use it

```
const {getNewRatings} = require('codeforces-rating-system');

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
  username: 'labib666',
  previousRating: 1500,
}];

console.log(getNewRatings(contestants));

// Output
// [ { position: 1,
//     username: 'forthright48',
//     previousRating: 1500,
//     delta: 100.87528483072916,
//     newRating: 1600.8752848307292 },
//   { position: 2,
//     username: 'flash_7',
//     previousRating: 1500,
//     delta: -51.937642415364586,
//     newRating: 1448.0623575846355 },
//   { position: 2,
//     username: 'labib',
//     previousRating: 1500,
//     delta: -51.937642415364586,
//     newRating: 1448.0623575846355 } ]

```
