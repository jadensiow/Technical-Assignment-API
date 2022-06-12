# Description

This program has 2 functions available with unit tests. The details are included in Assignment.md

# Install

To run this, npm is required

```
npm install

```

After completed, just do a npm start

# Technical decisions

## Function 1

When the First Component loads, it will take in the id from the submitted search and query for the results. The results searched are the details of the launches sorted in a descending order of their launch time.

The data received is unorganised and it is sent to `processLaunchFailures` function for processing.

After the data is processed and is in the required format, it is displayed

> ### Axios post of the query

The data is queried by sending the post request in the format below. We populate launches beforehand in order to not query all the launches separately.

```ts
const { data } = await axios.post(
  "https://api.spacexdata.com/v4/launchpads/query",
  {
    query: {
      // Search is the submitted Id to query for
      _id: search,
    },
    options: {
      // Populate is to retrieve the launches information
      populate: ["launches"],
      // Sort according to descending date
      sort: {
        date_utc: "descending",
      },
    },
  }
);
```

<!-- The query result is return as an object. -->

> ### Function `processLaunchFailures`

This function is taking in 2 object parameters. The first is an object that will be populated with the processed and formatted data (`actualData`) and the second is the data from the query (`data`).

The name of the launch is first copied into `actualData`. Then we loop over the launches array and only add the rquired fields into `actualData`.

## Function 1 test

A mock post result is written and it will go through the function `processLaunchFailures`. This is to ensure the result will be copied correctly into the the empty format of the variables that need to be shown on the page (`actualData`).
A mock page result is shown and compared with `actualData`.

## Function 2

When the Second Component first loads, all the starlink data is queried and returned by the `getSatellitesData` function.

The data returned is unorganised, and it is sent to the `processSatelliteData` function for processing.

Data can then be queried by calling the `querySatelliteData` function.

> ### Function `processSatelliteData`

Since we want constant time lookups, that unprocessed satellite data is stored in an object called `satellites` which has the following type:

```ts
interface satellites {
  // stores all the satellites by year, with the year as key and an array
  // of satellites launched in that year as value
  // { 2018: [<All satellites launched in 2018>], ... }
  byYear: {};

  // stores all satellites by a year-month combination
  // { '2018-1': [<All satellites launched in January 2018>], ... }
  byMonth: {};

  // stores all satellites launched on each date for constant time lookup
  // { '2018-1-12': [<All satellites launched on 12th January 2018>] }
  byDate: {};
}
```

The above object is returned to the calling function.

An HTML `<select></select>` is shown on the interface in order for the user and us to be able to unambiguously determine what data is requested. Here user can select the Year, Month, and Date that they wish to get the data for.

Since we need a year range to show on the interface, the `processSatelliteData` also returns the earliest year a satellite was launched and the latest year a satellite was launched.

> ### Function `querySatellitesData`

This function is fed the user's input in the following format:

```ts
{
  year: number;
  month: number;
  day: number;
}
```

1. `year` can range from `minYear` and `maxYear`, where `minYear` is the earliest year a satellite was launched and `maxYear` is the latest year a satellite was launched.

2. `month` ranges from `1-12`

3. `day` ranges from `1-31`

Each input can also be 0, which would mean that the option is not selected.

    Query Examples

    1. year = 2018, month = 12, day = 1
    Get all satellites launched on 1st December 2018

    2. year = 2018, month = 3, day = 0
    Get all satellites launched in March 2018

    3. year = 2018, month = 0, day = 0
    Get all satellites launched in 2018

    4. year = 0, month = 3, day = 2
    Invalid query, as we do not support getting data for each month for every year

Basic result pagination is also implemented as rendering all the data at once is not performant.

## Function 2 test

There are 3 test cases used to test for the 3 different date formats.

    Query Examples

    1. year = 2019, month = 11, day = 11
    Get all satellites launched on 11th November 2018

    2. year = 2019, month = 11, day = 0
    Get all satellites launched in November 2019

    3. year = 2019, month = 0, day = 0
    Get all satellites launched in 2019

Initially get all the satellies data, process it and store it in memory.

Then cases are defined in the format `year-month-day`, `year-month`, `year`

A function `getStarlinkDataFromQuery` is used to retrieve a the data for a given format. Since the `launchDate` field is of type `String`, `regex` query is used to match the correct substring.

The test is successful if the lenght of the output given by our function is equal to the length of the ouput directly queried from the API.
