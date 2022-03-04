import React from "react";
import { Stage, Layer } from "./react-konva";
import Section from "./Section";
import SeatPopup from "./SeatPopup";

import * as layout from "./layout";

// 获取工位预订数据函数
const useFetch = url => {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data));
  }, [url]);
  return data;
};

const MainStage = props => {
  // 调用useFetch函数获取工位预订数据
  const jsonData = useFetch("./seats-data.json");
  //初始化ref对象，以便后续使用方便
  const containerRef = React.useRef(null);
  const stageRef = React.useRef(null);

  // 初始化stage尺寸
  const [scale, setScale] = React.useState(1);
  // 初始化自适应stage尺寸
  const [scaleToFit, setScaleToFit] = React.useState(1);

  // 初始化stage宽高
  const [size, setSize] = React.useState({
    width: 1000,
    height: 1000,
    virtualWidth: 1000
  });
  const [virtualWidth, setVirtualWidth] = React.useState(1000);

  // 选中工位id列表
  const [selectedSeatsIds, setSelectedSeatsIds] = React.useState([]);

  // 鼠标悬浮冒泡信息
  const [popup, setPopup] = React.useState({ seat: null });

  // 计算绘图可用空间
  React.useEffect(() => {
    const newSize = {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight
    };
    if (newSize.width !== size.width || newSize.height !== size.height) {
      setSize(newSize);
    }
  });

  // 计算初始尺寸
  React.useEffect(() => {
    if (!stageRef.current) {
      return;
    }
    const stage = stageRef.current;
    const clientRect = stage.getClientRect({ skipTransform: true });

    const scaleToFit = size.width / clientRect.width;
    setScale(scaleToFit);
    setScaleToFit(scaleToFit);
    setVirtualWidth(clientRect.width);
  }, [jsonData, size]);

  // 双击调整尺寸
  const toggleScale = React.useCallback(() => {
    if (scale === 1) {
      setScale(scaleToFit);
    } else {
      setScale(1);
    }
  }, [scale, scaleToFit]);

  let lastSectionPosition = 0;

  // 设置鼠标悬浮信息
  const handleHover = React.useCallback((seat, pos) => {
    setPopup({
      seat: seat,
      position: pos
    });
  }, []);

  // 工位选中事件
  const handleSelect = React.useCallback(
    seatId => {
      const newIds = selectedSeatsIds.concat([seatId]);
      setSelectedSeatsIds(newIds);
    },
    [selectedSeatsIds]
  );

  // 工位反选事件
  const handleDeselect = React.useCallback(
    seatId => {
      const ids = selectedSeatsIds.slice();
      ids.splice(ids.indexOf(seatId), 1);
      setSelectedSeatsIds(ids);
    },
    [selectedSeatsIds]
  );

  // 如果没有原始工位结构，则Loading...
  if (jsonData === null) {
    return <div ref={containerRef}>Loading...</div>;
  }

  // 根据原始工位数据计算整体工位的最大宽度
  const maxSectionWidth = layout.getMaximimSectionWidth(
    jsonData.seats.sections
  );


  // 鼠标滑动事件
  const handleWheel = (e) => {
    e.evt.preventDefault();

    var scaleBy = 1.01;
    const stage = e.target.getStage();

    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();

    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let direction = e.evt.deltaY > 0 ? 1 : -1;

    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
  }

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "lightgrey",
        width: "100vw",
        height: "100vh"
      }}
      ref={containerRef}
    >
      {/* Stage根节点 */}
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        draggable
        dragBoundFunc={pos => {
          pos.x = Math.min(
            size.width / 2,
            Math.max(pos.x, -virtualWidth * scale + size.width / 2)
          );
          pos.y = Math.min(size.height / 2, Math.max(pos.y, -size.height / 2));
          return pos;
        }}
        onWheel={handleWheel}
        onDblTap={toggleScale}
        onDblClick={toggleScale}
        scaleX={scale}
        scaleY={scale}
      >
        {/* Layer图层 */}
        <Layer>
          {jsonData.seats.sections.map((section, index) => {
            const height = layout.getSectionHeight(section);
            const position = lastSectionPosition + layout.SECTIONS_MARGIN;
            lastSectionPosition = position + height;
            const width = layout.getSectionWidth(section);

            const offset = (maxSectionWidth - width) / 2;

            // 工位区块
            return (
              <Section
                x={offset}
                y={position}
                height={height}
                key={index}
                section={section}
                selectedSeatsIds={selectedSeatsIds}
                onHoverSeat={handleHover}
                onSelectSeat={handleSelect}
                onDeselectSeat={handleDeselect}
              />
            );
          })}
        </Layer>
      </Stage>
      {/* 鼠标悬浮冒泡信息 */}
      {popup.seat && (
        <SeatPopup
          position={popup.position}
          seatId={popup.seat}
          onClose={() => {
            setPopup({ seat: null });
          }}
        />
      )}
    </div>
  );
};

export default MainStage;
