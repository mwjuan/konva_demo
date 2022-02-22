import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MainStage from "./MainStage";
import ShapeDemo from './ShapeDemo';
import "./styles.css";
import { Tabs } from 'antd';

const { TabPane } = Tabs;

function App() {
  return (
    <div style={{ overflow: 'hidden' }}>
      <Tabs defaultActiveKey='1' centered>
        <TabPane tab='工位预订' key='1'>
          <MainStage
            onSelectSeat={seatId => {
              console.log("selected - " + seatId);
            }}
          />
        </TabPane>
        <TabPane tab='Shape Demo' key='2'>
          <ShapeDemo />
        </TabPane>
      </Tabs>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);