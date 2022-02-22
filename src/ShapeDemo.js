import React, { Component } from 'react';
import { Circle, Layer, Stage } from './react-konva';
import Konva from 'konva';

function ShapeDemo(props) {
    const [scale, setScale] = React.useState(1);
    const [size, setSize] = React.useState({
        width: 1440,
        height: 1000,
        virtualWidth: 1000
    });

    const zoomScale = React.useCallback(scaleBy => {
        setScale(scale * scaleBy);
    }, [scale]);
    const containerRef = React.useRef(null);
    const stageRef = React.useRef(null);
    const [virtualWidth, setVirtualWidth] = React.useState(1000);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                backgroundColor: 'lightgrey',
                width: '100vw',
                height: '100wh'
            }}>
            {/* <button onClick={() => zoomScale(1.5)}>放大</button>
            <button style={{ margin: 10 }} onClick={() => zoomScale(0.6)}>缩小</button> */}
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
                scaleX={scale}
                scaleY={scale}
                onDblClick={props.addShape}
            >
                <Layer>
                    {props.components.map(p => {
                        return <Circle
                            key={`${p.x}_${p.y}`}
                            x={p.x}
                            y={p.y}
                            draggable
                            radius={20}
                            fill="red"
                            // onDragEnd={e => props.changeComponent({ x: e.target.x(), y: e.target.y(), id: p.id })}
                        />
                    })}
                </Layer>
            </Stage>
        </div>
    )
}

let hoc = (WrappedComponent) => {
    return class EnhancedComponent extends Component {
        constructor(props) {
            super(props);
            this.state = {
                components: []
            }
        }

        addShape = (e) => {
            let x = e.evt.clientX;
            let y = e.evt.clientY;
            let { components } = this.state;
            components.push({ id: Math.round(Math.random(10) * 10), x, y });
            this.setState({ components });
        }

        changeComponent = ({ x, y, id }) => {
            let { components } = this.state;
            components.map(p => {
                if (p.id === id) {
                    p.x = x;
                    p.y = y;
                }
            })

            this.setState({ components });
        }

        render() {
            return <WrappedComponent
                components={this.state.components}
                addShape={this.addShape}
                changeComponent={this.changeComponent}
            />
        }
    }
}

export default hoc(ShapeDemo);