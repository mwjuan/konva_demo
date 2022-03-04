import React from "react";
import { Circle, Star, Ring, Rect } from "./react-konva";
import { SEAT_SIZE } from "./layout";

//根据预订状态显示工位颜色
function getColor(isBooked, isSelected) {
  if (isSelected) {
    return "red";
  } else if (isBooked) {
    return "lightgrey";
  } else {
    return "#1b728d";
  }
}

// 设置工位信息
const Seat = props => {
  const isBooked = props.data.status === "booked";

  return (
    // 工位形状，还可以设置为Star、Rect、Ring
    <Circle
      //Star
      // numPoints={5}
      // innerRadius={5}
      // outerRadius={3}

      //Rect
      // width={8}
      // height={8}
      // strokeWidth={1}
      // stroke="lightgrey"
      // cornerRadius={5}

      x={props.x}  // 标点x坐标
      y={props.y}  // 标点y坐标
      radius={SEAT_SIZE / 2}  //圆角度数
      fill={getColor(isBooked, props.isSelected)} //填充色
      strokeWidth={1}
      onMouseEnter={e => {
        e.target._clearCache();
        // 鼠标悬浮显示工位信息
        props.onHover(props.data.name, e.target.getAbsolutePosition());
        const container = e.target.getStage().container();
        if (isBooked) {
          // 若该工位已预订则鼠标样式为不可点击
          container.style.cursor = "not-allowed";
        } else {
          container.style.cursor = "pointer";
        }
      }}
      onMouseLeave={e => {
        props.onHover(null);
        const container = e.target.getStage().container();
        container.style.cursor = "";
      }}
      onClick={e => {
        if (isBooked) {  //该工位已被预订则
          return;
        }
        if (props.isSelected) { // 点击已选中状态的工位则取消勾选，反之则选中工位
          props.onDeselect(props.data.name);
        } else {
          props.onSelect(props.data.name);
        }
      }}
      onTap={e => {  // tab键功能同鼠标点击事件
        if (isBooked) {
          return;
        }
        if (props.isSelected) {
          props.onDeselect(props.data.name);
        } else {
          props.onSelect(props.data.name);
        }
      }}
    />
  );
};

export default Seat;