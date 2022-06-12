import axios from "axios";

export const processLaunchFailures = (actualData, data) => {
  for (const d of data.docs) {
    const { name, launches } = d;

    actualData.launchpad = name;

    for (const { name, success, failures } of launches) {
      if (!success) {
        // Push failed launches
        actualData.all_failures.push({
          name,
          failures: failures.map((f) => f.reason),
        });
      }
    }
  }
  return actualData;
};

export const getDateString = ({ year, month, day }) =>
  `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;

export const querySatellitesData = (selectedValue, satellites) => {
  const { year, month, day } = selectedValue;

  if (year + month + day === 0) {
    return "Please select a value";
  }

  if (year === 0 && month !== 0) {
    return "Please select the year";
  }

  if (month === 0 && day !== 0) {
    return "Please select the month";
  }

  if (year === 0 && month === 0 && day !== 0) {
    return "Please select month and year";
  }

  let data = [];

  if (year !== 0 && month !== 0 && day !== 0) {
    // specific date selected
    data = satellites.byDate[getDateString(selectedValue)];
  } else if (year !== 0 && month + day === 0) {
    // specific year selected
    data = satellites.byYear[year];
  } else if (day === 0 && year !== 0 && month !== 0) {
    // some combination of year + month, like 2020-07
    data = satellites.byMonth[`${year}-${month}`];
  }

  return data;
};

export const getSatellitesData = async () => {
  const { data } = await axios.get("https://api.spacexdata.com/v4/starlink");

  return data;
};

export const processSatellitesData = (data) => {
  const satellites = {
    byDate: {},
    byYear: {},
    byMonth: {},
  };

  let minYear = Number.POSITIVE_INFINITY;
  let maxYear = Number.NEGATIVE_INFINITY;

  for (const satellite of data) {
    const {
      spaceTrack: { LAUNCH_DATE: launchDate },
    } = satellite;

    // store using year, month and the entire date

    if (!launchDate) {
      continue;
    }

    const [year, month] = launchDate.split("-").map((d) => Number.parseInt(d));

    if (year < minYear) {
      minYear = year;
    }

    if (year > maxYear) {
      maxYear = year;
    }

    if (year in satellites.byYear) {
      satellites.byYear[year].push(satellite);
    } else {
      satellites.byYear[year] = [satellite];
    }

    const monthText = `${year}-${month}`;

    if (monthText in satellites.byMonth) {
      satellites.byMonth[monthText].push(satellite);
    } else {
      satellites.byMonth[monthText] = [satellite];
    }

    if (launchDate in satellites.byDate) {
      satellites.byDate[launchDate].push(satellite);
    } else {
      satellites.byDate[launchDate] = [satellite];
    }
  }

  return { minYear, maxYear, satellites };
};
