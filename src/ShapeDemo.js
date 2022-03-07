import React, { Component } from 'react';
import Konva from 'konva';
import bg from './bg.png';
import bgSvg from './1.svg';
import { Stage, Layer, Circle } from 'react-konva';
import URLImage from './URLImage';
import { notification, Modal } from 'antd';
import _ from 'lodash';
import './styles.css';
const { confirm } = Modal;

class ShapeDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stageScale: 1,
            stageX: 0,
            stageY: 0,
            components: [],
            image: null,
            results: [],
            currentShape: null,
            stroke: 'transparent'
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
            id,
            fill: '#009848'
        };

        if (!this.state.newScale) {
            components.push({ x, y, id, fill: '#009848' })
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
        this.setState({ stroke: 'transparent' })
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

    onContextMenu = (e) => {
        e.evt.preventDefault();
        let stage = e.target.getStage();
        if (e.target === stage) {
            return;
        }
        let currentShape = e.target;
        if (currentShape.attrs.type !== 'pot') return;
        this.setState({ currentShape })
        confirm({
            title: '确认删除此标点吗？',
            cancelText: '取消',
            okText: '确定',
            onOk: () => this.deletePot(),
            onCancel() { }
        });
    }

    deletePot = () => {
        let { components, currentShape } = this.state;
        if (!currentShape) return;
        _.remove(components, p => p.id === currentShape.attrs.id);
        this.setState({ components })
        var menuNode = document.getElementById('menu');
        menuNode.style.display = 'none';
    }

    onMouseOver = (e) => {
        e.evt.preventDefault();
        let currentShape = e.target;
        if (currentShape.attrs.type !== 'pot') return;
        let { components } = this.state;

        _.map(components, p => {
            if (p.id === currentShape.attrs.id) {
                p.fill = '#FF0000';
            }
        })
        this.setState({ components })
    }

    onMouseLeave = (e) => {
        e.evt.preventDefault();
        let currentShape = e.target;
        if (currentShape.attrs.type !== 'pot') return;
        let { components } = this.state;

        _.map(components, p => {
            if (p.id === currentShape.attrs.id) {
                p.fill = '#009848';
            }
        })
        this.setState({ components })
    }

    stageOnDragStart = (e) => {
        e.evt.preventDefault();
        let currentShape = e.target;
        if (currentShape.attrs.type === 'pot') return;
        this.setState({ stroke: 'red' })
    }
    shapeOnDragStart = (e) => {
        e.evt.preventDefault();
    }

    render() {
        return <div style={{
            width: 1440,
            height: 800
        }}>
            <div id="menu" style={{ display: 'none', position: 'absolute', zIndex: 999 }}>
                <button id="delete-button" onClick={this.deletePot}>Delete</button>
            </div>
            <button onClick={this.show}>获取所有坐标信息</button>
            <Stage
                onDragStart={this.stageOnDragStart}
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
                onDragEnd={this.onDragEnd}  //鼠标拖拽事件
                onContextMenu={this.onContextMenu}
            >
                <Layer>
                    {/* 背景图，支持png、svg格式 */}
                    <URLImage src={bg} x={170} stroke={this.state.stroke} />
                    {/* 遍历标点列表 */}
                    {this.state.components.map(p => {
                        // 设置标点形状为Circle，还可以设置为Rect、Ring、Star
                        return <Circle
                            onDragStart={this.shapeOnDragStart}
                            onMouseOver={this.onMouseOver}
                            onMouseLeave={this.onMouseLeave}
                            type='pot'
                            key={p.id}
                            style={{ width: 30, height: 30 }}
                            id={p.id}
                            x={p.x}
                            y={p.y}
                            draggable //设置是否允许拖拽
                            radius={16}
                            fill={p.fill}
                            strokeWidth={8}
                            stroke={'#fff'}
                        />
                    })}
                </Layer>
            </Stage>
        </div>
    }
}

export default ShapeDemo;