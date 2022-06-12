import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  getSatellitesData,
  processSatellitesData,
  querySatellitesData,
} from "../Helpers/helpers";
import Loader from "./Loader/Loader";

let satellites;

const SecondFunction = (props) => {
  // [selectedYear, selectedMonth, selectedDay]
  const [selectedValue, setSelectedValue] = useState({
    year: 0,
    month: 0,
    day: 0,
  });
  const { storeQueryDataOnParent, setStoreQueryDataOnParent } = props;

  const [page, setPage] = useState(1);

  const [selects, setSelects] = useState(() => ({
    year: !storeQueryDataOnParent
      ? []
      : new Array(
          storeQueryDataOnParent.maxYear - storeQueryDataOnParent.minYear + 2
        )
          .fill(0)
          .map((_, i) =>
            i === 0 ? 0 : storeQueryDataOnParent.minYear - 1 + i
          ),
    month: new Array(13).fill(0).map((_, i) => i),
    day: new Array(31).fill(0).map((_, i) => i),
  }));

  const [apiResponse, setApiResponse] = useState({
    loading: !storeQueryDataOnParent,
    error: null,
  });
  const [userRequestedData, setUserRequestedData] = useState("");

  const pageSize = useRef(20);
  const numPages = useRef(0);

  const queryData = useCallback(() => {
    const data = querySatellitesData(selectedValue, satellites);

    if (data && typeof data !== "string") {
      numPages.current =
        Math.floor(data.length / pageSize.current) +
        (data.length < pageSize.current ? 1 : 0);
    }

    setPage(1);
    setUserRequestedData(data || "Nothing Found");
  }, [selectedValue]);

  const callApi = useCallback(async () => {
    const data = await getSatellitesData();
    const { minYear, maxYear, satellites: s } = processSatellitesData(data);

    setStoreQueryDataOnParent({ minYear, maxYear, satellites: s });

    setSelects((old) => ({
      ...old,
      year: new Array(maxYear - minYear + 2)
        .fill(0)
        .map((_, i) => (i === 0 ? 0 : minYear - 1 + i)),
    }));
  }, [setStoreQueryDataOnParent]);

  useEffect(() => {
    if (storeQueryDataOnParent !== null) {
      satellites = storeQueryDataOnParent.satellites;
      setApiResponse({ loading: false, error: null });
      return;
    } else {
      (async () => {
        try {
          await callApi();
          setApiResponse({ loading: false, error: null });
        } catch (error) {
          setApiResponse({ loading: false, error: error.message });
        }
      })();
    }
  }, [callApi, storeQueryDataOnParent]);

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
      <h3>Function 2</h3>
      <p>
        Input a date and will return the starlink satellites launched. If zero
        is input for month or date, it represents everything is selected
      </p>
      <div
        style={{
          display: "flex",
          width: "400px",
          justifyContent: apiResponse.loading ? "center" : "space-between",
        }}
      >
        {apiResponse.loading ? (
          <Loader />
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            {Object.entries(selects).map(([key, value]) => {
              return (
                <div key={key}>
                  <label>
                    {key[0].toUpperCase() + key.slice(1).toLowerCase()}
                  </label>
                  <select
                    style={{
                      width: "75px",
                      textAlign: "center",
                      boxSizing: "border-box",
                      marginTop: "0.5rem",
                    }}
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
                </div>
              );
            })}
            <div>
              <button onClick={queryData}>Get Data</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "3rem" }}>
        <pre>
          {typeof userRequestedData === "string"
            ? userRequestedData
            : JSON.stringify(
                userRequestedData.slice(
                  (page - 1) * pageSize.current,
                  page * pageSize.current
                ),
                null,
                4
              )}
        </pre>
      </div>

      {typeof userRequestedData !== "string" && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          <button
            style={{ width: "70px" }}
            onClick={() => setPage((old) => (old - 1 > 0 ? old - 1 : old))}
          >
            Previous
          </button>
          <p>
            {page} / {Math.ceil(numPages.current)}
          </p>
          <button
            style={{ width: "70px" }}
            onClick={() =>
              setPage((old) => (old + 1 <= numPages.current ? old + 1 : old))
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SecondFunction;
