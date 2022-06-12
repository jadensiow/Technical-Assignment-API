import React, { useState, useCallback } from "react";
import axios from "axios";
import Loader from "./Loader/Loader";
import { processLaunchFailures } from "../helpers/helpers";

export const FirstFunction = () => {
  // Search bar
  const [search, setSearch] = useState("");
  // Sorted Results
  const [results, setResults] = useState(null);
  // Loading condition
  const [{ loading, error }, setApiResponse] = useState({
    loading: false,
    error: null,
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      setApiResponse({ loading: true, error: null });

      try {
        const { data } = await axios.post(
          // https://github.com/r-spacex/SpaceX-API/blob/master/docs/queries.md
          "https://api.spacexdata.com/v4/launchpads/query",
          {
            query: {
              _id: search,
            },
            options: {
              populate: ["launches"],
              sort: {
                date_utc: "descending",
              },
            },
          }
        );
        // To sort data into actual data
        const actualData = {
          launchpad: "",
          all_failures: [],
        };
        processLaunchFailures(actualData, data);
        setApiResponse({ loading: false, error: null });
        setResults(actualData);
      } catch (error) {
        let message = [error.message];

        const {
          response: { data },
        } = error;

        if (
          typeof data === "string" &&
          data.includes("Cast to ObjectId failed for value")
        ) {
          message.push(`Incorrect ID entered`);
        }

        setApiResponse({ loading: false, error: message });
      }
    },
    [search]
  );

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
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h3>Function 1</h3>
        <p>
          Search for an Id of a launchpad and the result will return the failed
          launches.
        </p>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              width: "350px",
              justifyContent: "space-evenly",
              paddingBottom: "1rem",
            }}
          >
            <input
              type="text"
              placeholder="Search"
              name="name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </div>
        </form>
        {loading ? (
          <Loader
            style={{
              display: "flex",
              width: "350px",
              justifyContent: "space-evenly",
            }}
          />
        ) : error !== null ? (
          <div>
            {error.map((e) => (
              <pre style={{ textAlign: "center" }}>{e}</pre>
            ))}
          </div>
        ) : results ? (
          <pre>{JSON.stringify(results, null, 4)}</pre>
        ) : null}
      </div>
    </div>
  );
};
export default FirstFunction;
