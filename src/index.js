import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainStage from "./MainStage";
import "./styles.css";

function App() {
  return (
    <div>
      <span>工位预订</span>
      <MainStage
        onSelectSeat={seatId => {
          console.log("selected - " + seatId);
        }}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);