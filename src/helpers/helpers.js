export const processLaunchFailures = (actualData, data) => {
  for (const d of data.docs) {
    const { name, launches } = d;

    actualData.name = name;

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
