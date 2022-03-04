import React from 'react';
import { Rect, Group, Text } from './react-konva';
import SubSection from './SubSection';

import {
  SECTION_TOP_PADDING,
  getSectionWidth,
  getSubsectionWidth,
} from './layout';

export default React.memo(
  ({
    section,
    height,
    x,
    y,
    onHoverSeat,
    onSelectSeat,
    onDeselectSeat,
    selectedSeatsIds,
  }) => {
    const containerRef = React.useRef();

    // caching will boost rendering
    // we just need to recache on some changes
    React.useEffect(() => {
      containerRef.current.cache();
    }, [section, selectedSeatsIds]);
    const width = getSectionWidth(section);
    let lastSubsectionX = 0;

    // 白色区块整体为一个Group组，包含一个Rect长方形
    return (
      <Group y={y} x={x} ref={containerRef}>
        <Rect
          width={width}
          height={height}
          fill="white"
          strokeWidth={1}
          stroke="lightgrey"
          cornerRadius={5}
        />
        {section.subsections.map((subsection) => {
          const subWidth = getSubsectionWidth(subsection);
          const pos = lastSubsectionX;
          lastSubsectionX += subWidth;

          // Rect长方形中包含一个Group
          return (
            <SubSection
              x={pos}
              y={SECTION_TOP_PADDING}
              key={subsection.name}
              data={subsection}
              width={subWidth}
              height={height}
              onHoverSeat={onHoverSeat}
              onSelectSeat={onSelectSeat}
              onDeselectSeat={onDeselectSeat}
              selectedSeatsIds={selectedSeatsIds}
            />
          );
        })}

         {/* 显示工位区块名称 */}
        <Text
          text={section.name}
          height={SECTION_TOP_PADDING}
          width={width}
          align="center"
          verticalAlign="middle"
          fontSize={20}
        />
      </Group>
    );
  }
);
