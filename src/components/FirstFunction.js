import React, { useState, useCallback } from "react";
import axios from "axios";

export const FirstFunction = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const { data } = await axios.post(
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

      const actualData = {
        name: "",
        all_failures: [],
      };

      for (const d of data.docs) {
        const { name, launches } = d;

        actualData.name = name;

        for (const { name, success, failures } of launches) {
          if (!success) {
            actualData.all_failures.push({
              name,
              failures: failures.map((f) => f.reason),
            });
          }
        }
      }

      setResults(actualData);
    },
    [search]
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
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
      {results && <pre>{JSON.stringify(results, null, 4)}</pre>}
    </div>
  );
};
export default FirstFunction;
