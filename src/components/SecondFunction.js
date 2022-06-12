import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getDateString } from "../helpers/helpers";

const satellites = {
  byDate: {},
  byYear: {},
};
const SecondFunction = () => {
  // [selectedYear, selectedMonth, selectedDay]
  const [selectedValue, setSelectedValue] = useState({
    year: 0,
    month: 0,
    day: 0,
  });
  const [selects, setSelects] = useState(() => ({
    year: [],
    month: new Array(13).fill(0).map((_, i) => i),
    day: new Array(31).fill(0).map((_, i) => i),
  }));
  const [apiResponse, setApiResponse] = useState({
    loading: true,
    error: null,
  });
  const [userRequestedData, setUserRequestedData] = useState("");
  const getData = useCallback(() => {
    const { year, month, day } = selectedValue;

    let data;

    if (year !== 0 && month !== 0 && day !== 0) {
      // specific date selected
      data = satellites.byDate[getDateString(selectedValue)];
    } else if (year !== 0 && month + day === 0) {
      // specific year selected
      data = satellites.byYear[selectedValue.year];
    } else if (day === 0 && year !== 0 && month !== 0) {
      // some combination of year + month, like 2020-07
      data = satellites.byYear[year][month];
    }
    setUserRequestedData(data || "Nothing Found");
  }, [selectedValue]);
  const callApi = useCallback(async () => {
    const { data } = await axios.get("https://api.spacexdata.com/v4/starlink");
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
      const [year, month] = launchDate
        .split("-")
        .map((d) => Number.parseInt(d));
      if (year < minYear) {
        minYear = year;
      }
      if (year > maxYear) {
        maxYear = year;
      }
      if (year in satellites.byYear) {
        if (month in satellites.byYear[year]) {
          // already added a bunch of satellites for this year
          satellites.byYear[year][month].push(satellite);
        } else {
          satellites.byYear[year][month] = [];
          satellites.byYear[year][month].push(satellite);
        }
      } else {
        satellites.byYear[year] = {
          [month]: [],
        };
        satellites.byYear[year][month].push(satellite);
      }
      if (launchDate in satellites.byDate) {
        satellites.byDate[launchDate].push(satellite);
      } else {
        satellites.byDate[launchDate] = [satellite];
      }
    }
    console.log(satellites);
    setSelects((old) => ({
      ...old,
      year: new Array(maxYear - minYear + 2)
        .fill(0)
        .map((_, i) => (i === 0 ? 0 : minYear - 1 + i)),
    }));
  }, []);
  useEffect(() => {
    (async () => {
      try {
        await callApi();
        setApiResponse({ loading: false, error: null });
      } catch (error) {
        setApiResponse({ loading: false, error: error.message });
      }
    })();
  }, []);
  if (apiResponse.loading) {
    return <div>Loading....</div>;
  }
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "350px",
          justifyContent: "space-between",
        }}
      >
        {Object.entries(selects).map(([key, value]) => {
          return (
            <select
              style={{
                width: "75px",
                textAlign: "center",
                boxSizing: "border-box",
              }}
              key={key}
              onChange={(e) =>
                setSelectedValue((old) => ({
                  ...old,
                  [key]: Number.parseInt(e.target.value),
                }))
              }
            >
              {value.map((val) => (
                <option key={val}>{val}</option>
              ))}
            </select>
          );
        })}
        <button onClick={getData}>Get Data</button>
      </div>
      <div style={{ marginTop: "3rem" }}>
        <pre>
          {typeof userRequestedData === "string"
            ? userRequestedData
            : JSON.stringify(userRequestedData, null, 4)}
        </pre>
      </div>
    </div>
  );
};
export default SecondFunction;
