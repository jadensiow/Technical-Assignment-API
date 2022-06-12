import React, { useState } from "react";
import FirstFunction from "./components/FirstFunction";
import SecondFunction from "./components/SecondFunction";

const App = () => {
  const [tabNumber, setTabNumber] = useState(1);

  return (
    <div className="App">
      <div className="col text-center">
        <h2>Technical Assignment</h2>

        <button onClick={() => setTabNumber(1)}>Function 1</button>
        <button onClick={() => setTabNumber(2)}>Function 2</button>

        <div>{tabNumber === 1 ? <FirstFunction /> : <SecondFunction />}</div>
      </div>{" "}
    </div>
  );
};
export default App;
