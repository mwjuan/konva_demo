import React, { Component } from 'react';
import Konva from 'konva';
import bg from './bg.png';
import bgSvg from './1.svg';
import { Stage, Layer, Circle } from 'react-konva';
import URLImage from './URLImage';
import { notification } from 'antd';
import _ from 'lodash';

class ShapeDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stageScale: 1,
            stageX: 0,
            stageY: 0,
            components: [],
            image: null,
            results: []
        }
    }

    handleWheel = (e, scaleBy) => {
        e.evt.preventDefault();

        var scaleBy = scaleBy ? scaleBy : 1.01;
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
        this.setState({ newScale })
    }

    onDblClick = (e) => {
        e.evt.preventDefault();
        let { components } = this.state;

        let stage = e.target.getStage();
        var pointer = stage.getPointerPosition();
        let x = pointer.x;
        let y = pointer.y;
        let id = Math.random() * 100;

        var mousePointTo = {
            x: (pointer.x - stage.x()) / this.state.newScale,
            y: (pointer.y - stage.y()) / this.state.newScale,
            id
        };

        if (!this.state.newScale) {
            components.push({ x, y, id })
        } else {
            components.push(mousePointTo)
        }
        this.setState({ components })
    }

    onDragEnd = (e) => {
        e.evt.preventDefault();
        this.handleWheel(e, 1);
    }

    show = () => {
        notification.open({
            message: '坐标信息',
            description:
                <div>
                    {
                        _.map(this.state.components, p => {
                            return <p>id:{p.id}    x:{p.x}    y:{p.y}</p>
                        })
                    }
                </div>
        });
    }

    render() {
        return <div style={{
            width: 1440,
            height: 800
        }}>
            <button onClick={this.show}>获取所有坐标信息</button>
            <Stage
                style={{ background: 'lightgray' }}
                draggable
                width={1440}
                height={800}
                x={this.state.stageX}
                y={this.state.stageY}
                scaleX={this.state.stageScale}
                scaleY={this.state.stageScale}
                onWheel={this.handleWheel}
                onDblClick={this.onDblClick}
                onDragEnd={this.onDragEnd}
            >
                <Layer>
                    <URLImage src={bg} x={170} />
                    {this.state.components.map(p => {
                        return <div style={{ width: 30, height: 30, borderRadius: 12, background: 'red' }}>
                            <Circle
                                style={{ width: 30, height: 30, background: 'red' }}
                                id={p.id}
                                x={p.x}
                                y={p.y}
                                draggable
                                radius={12}
                                fill='#009848'
                                draggable={true}
                            />
                        </div>
                    })}
                </Layer>
            </Stage>
        </div>
    }
}

export default ShapeDemo;