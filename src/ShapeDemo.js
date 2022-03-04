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

    // 鼠标滑动事件
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

    // 鼠标双击事件
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

    // 鼠标拖拽时间
    onDragEnd = (e) => {
        e.evt.preventDefault();
        // 拖拽后Stage的区域坐标发生变化，重新计算坐标点位置
        this.handleWheel(e, 1);
    }

    // 获取坐标按钮点击事件
    show = () => {
        notification.open({
            message: '坐标信息',
            description:
                <div>
                    {
                        _.map(this.state.components, p => {
                            return <p> x:{p.x}    y:{p.y}</p>
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
                onWheel={this.handleWheel}  // 鼠标滑动事件
                onDblClick={this.onDblClick} // 鼠标双击事件
                onDragEnd={this.onDragEnd}  //鼠标拖拽时间
            >
                <Layer>
                    {/* 背景图，支持png、svg格式 */}
                    <URLImage src={bg} x={170} />
                    {/* 遍历标点列表 */}
                    {this.state.components.map(p => {
                        // 设置标点形状为Circle，还可以设置为Rect、Ring、Star
                        return <Circle
                            style={{ width: 30, height: 30, background: 'red' }}
                            id={p.id}
                            x={p.x}
                            y={p.y}
                            draggable //设置是否允许拖拽
                            radius={12}
                            fill='#009848'
                        />
                    })}
                </Layer>
            </Stage>
        </div>
    }
}

export default ShapeDemo;