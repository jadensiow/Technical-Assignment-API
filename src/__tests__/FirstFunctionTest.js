import { processLaunchFailures } from "../helpers/helpers";

describe("Test first function", () => {
  test("Ensure data is processed correctly from the POST request", async () => {
    // Return result from POST request
    const dataPostRequest = {
      docs: [
        {
          name: "test new launch",
          full_name: "test launching",
          region: "California",
          launches: [
            {
              id: "test ID1",
              name: "new test 1",
              success: true,
              failures: [],
              date_utc: "2010-12-04T18:45:00.000Z",
            },

            {
              id: "test ID2",
              name: "new test 2",
              success: false,
              failures: [
                {
                  time: 18,
                  altitude: 455,
                  reason: "Rocket failed to detach",
                },
              ],
              date_utc: "2010-06-04T18:45:00.000Z",
            },

            {
              id: "test ID3",
              name: "new test 3",
              success: false,
              failures: [
                {
                  time: 120,
                  altitude: 20,
                  reason: "Booster failed",
                },
              ],
              date_utc: "2010-03-05T18:45:00.000Z",
            },
          ],
          id: "testID",
        },
      ],
    };

    // Mock result of the correct result
    const mockResult = {
      launchpad: "test new launch",
      all_failures: [
        { name: "new test 2", failures: ["Rocket failed"] },
        { name: "new test 3", failures: ["Booster failed"] },
      ],
    };

    const actualData = {
      name: "",
      all_failures: [],
    };

    processLaunchFailures(actualData, dataPostRequest);

    expect(mockResult.launchpad === actualData.launchpad).toBe(true);
    expect(
      mockResult.all_failures[1].failures[0] ===
        actualData.all_failures[1].failures[0]
    ).toBe(true);
  });
});
