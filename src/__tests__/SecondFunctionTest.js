import {
  getSatellitesData,
  processSatellitesData,
  querySatellitesData,
} from "../helpers/helpers";
import axios from "axios";

jest.setTimeout(30_000);

describe("Test second function", () => {
  let satellites;

  // List of data from query request
  const getStarlinkDataFromQuery = async (query) => {
    const { data } = await axios.post(
      "https://api.spacexdata.com/v4/starlink/query",
      {
        query,
        options: {
          limit: 5000,
        },
      }
    );

    return data.docs;
  };

  beforeAll(async () => {
    const data = await getSatellitesData();
    const resp = processSatellitesData(data);
    satellites = resp.satellites;
  });

  test("To check when picking an exact date (2019-11-11), result is processed correctly", async () => {
    // test case 1
    const ourData = querySatellitesData(
      { year: 2019, month: 11, day: 11 },
      satellites
    );

    const actualData = await getStarlinkDataFromQuery({
      "spaceTrack.LAUNCH_DATE": { $eq: "2019-11-11" },
    });

    expect(ourData.length === actualData.length).toBe(true);
  });

  test("To check when a day is not picked (2019-11), result is processed correctly", async () => {
    // test case 1
    const ourData = querySatellitesData(
      { year: 2019, month: 11, day: 0 },
      satellites
    );

    const actualData = await getStarlinkDataFromQuery({
      "spaceTrack.LAUNCH_DATE": { $regex: "2019-11" },
    });

    expect(ourData.length === actualData.length).toBe(true);
  });

  test("To check when only a year is picked (2019), result is processed correctly", async () => {
    // test case 1
    const ourData = querySatellitesData(
      { year: 2019, month: 0, day: 0 },
      satellites
    );

    const actualData = await getStarlinkDataFromQuery({
      "spaceTrack.LAUNCH_DATE": { $regex: "2019" },
    });

    expect(ourData.length === actualData.length).toBe(true);
  });
});
