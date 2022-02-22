import React from "react";
import { Circle, Star, Ring, Rect } from "./react-konva";
import { SEAT_SIZE } from "./layout";

function getColor(isBooked, isSelected) {
  if (isSelected) {
    return "red";
  } else if (isBooked) {
    return "lightgrey";
  } else {
    return "#1b728d";
  }
}

const Seat = props => {
  const isBooked = props.data.status === "booked";

  return (
    <Star
     // Star 
      numPoints={5}
      innerRadius={5}
      outerRadius={3}

      //Rect
      // width={8}
      // height={8}
      // strokeWidth={1}
      // stroke="lightgrey"
      // cornerRadius={5}

      x={props.x}
      y={props.y}
      radius={SEAT_SIZE / 2}
      fill={getColor(isBooked, props.isSelected)}
      strokeWidth={1}
      onMouseEnter={e => {
        e.target._clearCache();
        props.onHover(props.data.name, e.target.getAbsolutePosition());
        const container = e.target.getStage().container();
        if (isBooked) {
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
        if (isBooked) {
          return;
        }
        if (props.isSelected) {
          props.onDeselect(props.data.name);
        } else {
          props.onSelect(props.data.name);
        }
      }}
      onTap={e => {
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
