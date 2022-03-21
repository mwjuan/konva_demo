import React, { Component } from 'react';
import Konva from 'konva';
import bg from './bg.svg';
import { Stage, Layer, Circle } from 'react-konva';
import URLImage from './URLImage';
import { notification, Modal, Button, Input } from 'antd';
import _ from 'lodash';
import './styles.css';
import shortid from 'shortid';

const { confirm } = Modal;
var GUIDELINE_OFFSET = 5;
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
            stroke: 'transparent',
            selectedShape: null,
            value: null,
            newPos: { x: 0, y: 0 }
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
        if (oldScale > 1.5 && direction === 1) return;
        if (oldScale < 0.5 && direction === -1) return;

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
        this.setState({ newScale, newPos })
    }

    // 鼠标双击事件
    onDblClick = (e) => {
        e.evt.preventDefault();
        let { components } = this.state;

        let stage = e.target.getStage();
        var pointer = stage.getPointerPosition();
        let x = pointer.x;
        let y = pointer.y;
        let id = shortid();

        let fill = '#009848';
        let code = shortid();
        var mousePointTo = {
            x: (pointer.x - stage.x()) / this.state.newScale,
            y: (pointer.y - stage.y()) / this.state.newScale,
            id,
            fill,
            code
        };

        if (!this.state.newScale) {
            components.push({ x, y, id, fill, code })
        } else {
            components.push(mousePointTo)
        }
        this.setState({ components })
    }

    // 鼠标拖拽事件
    onDragEnd = async (e) => {
        e.evt.preventDefault();
        // 拖拽后Stage的区域坐标发生变化，重新计算坐标点位置
        this.handleWheel(e, 1);
        this.setState({
            stroke: 'transparent',
            stageX: e.target.attrs.type === 'pot' ? 0 : e.target.attrs.x,
            stageY: e.target.attrs.type === 'pot' ? 0 : e.target.attrs.y
        })
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

    deletePot = () => {
        let { components, selectedShape } = this.state;
        if (!selectedShape) return;
        _.remove(components, p => p.id === selectedShape.id);
        this.setState({ components }, () => {
            this.onCloseShapeClick();
        })
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

    getLineGuideStops(skipShape, stage) {
        // we can snap to stage borders and the center of the stage
        var vertical = [0, stage.width() / 2, stage.width()];
        var horizontal = [0, stage.height() / 2, stage.height()];

        // and we snap over edges and center of each object on the canvas
        stage.find('.object').forEach(guideItem => {
            if (guideItem === skipShape) {
                return;
            }

            var box = guideItem.getClientRect();
            // and we can snap to all edges of shapes
            vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
            horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
        });

        return {
            vertical: vertical.flat(),
            horizontal: horizontal.flat()
        };
    }

    getObjectSnappingEdges(node) {
        var box = node.getClientRect();
        return {
            vertical: [
                {
                    guide: Math.round(box.x),
                    offset: Math.round(node.x() - box.x),
                    snap: 'start'
                },
                {
                    guide: Math.round(box.x + box.width / 2),
                    offset: Math.round(node.x() - box.x - box.width / 2),
                    snap: 'center'
                },
                {
                    guide: Math.round(box.x + box.width),
                    offset: Math.round(node.x() - box.x - box.width),
                    snap: 'end'
                }
            ],
            horizontal: [
                {
                    guide: Math.round(box.y),
                    offset: Math.round(node.y() - box.y),
                    snap: 'start'
                },
                {
                    guide: Math.round(box.y + box.height / 2),
                    offset: Math.round(node.y() - box.y - box.height / 2),
                    snap: 'center'
                },
                {
                    guide: Math.round(box.y + box.height),
                    offset: Math.round(node.y() - box.y - box.height),
                    snap: 'end'
                }
            ]
        };
    }

    getGuides = (lineGuideStops, itemBounds) => {
        var resultV = [];
        var resultH = [];

        lineGuideStops.vertical.forEach(lineGuide => {
            itemBounds.vertical.forEach(itemBound => {
                var diff = Math.abs(lineGuide - itemBound.guide);
                // if the distance between guild line and object snap point is close we can consider this for snapping
                if (diff < GUIDELINE_OFFSET) {
                    resultV.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset
                    });
                }
            });
        });

        lineGuideStops.horizontal.forEach(lineGuide => {
            itemBounds.horizontal.forEach(itemBound => {
                var diff = Math.abs(lineGuide - itemBound.guide);
                if (diff < GUIDELINE_OFFSET) {
                    resultH.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset
                    });
                }
            });
        });

        var guides = [];

        // find closest snap
        var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
        var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
        if (minV) {
            guides.push({
                lineGuide: minV.lineGuide,
                offset: minV.offset,
                orientation: 'V',
                snap: minV.snap
            });
        }
        if (minH) {
            guides.push({
                lineGuide: minH.lineGuide,
                offset: minH.offset,
                orientation: 'H',
                snap: minH.snap
            });
        }
        return guides;
    }

    drawGuides = (guides, layer, scaleX, scaleY) => {
        guides.forEach(lg => {
            let opt = {
                stroke: "rgb(0, 161, 255)",
                strokeWidth: 1,
                name: "guid-line",
                dash: [4, 6],
            };
            if (lg.orientation === 'H') {
                opt["points"] = [
                    -6000, (lg.lineGuide - this.state.newPos.y) / scaleY,
                    6000, (lg.lineGuide - this.state.newPos.y) / scaleY
                ];
                var line = new Konva.Line(opt);
                layer.add(line);
                layer.batchDraw();
            } else if (lg.orientation === 'V') {
                opt["points"] = [
                    (lg.lineGuide - this.state.newPos.x) / scaleX,
                    -6000,
                    (lg.lineGuide - this.state.newPos.x) / scaleX,
                    6000,
                ];
                let line = new Konva.Line(opt);
                layer.add(line);
                layer.batchDraw();
            }
        });
    }

    onDragMoveLayer = (e) => {
        e.evt.preventDefault();
        let layer = e.target.getLayer();
        let stage = e.target.getStage();

        // clear all previous lines on the screen
        _.each(layer.find('.guid-line'), p => {
            p.destroy();
        })

        let scaleX = stage.scaleX(), scaleY = stage.scaleY();
        // find possible snapping lines
        var lineGuideStops = this.getLineGuideStops(e.target, stage);
        // find snapping points of current object
        var itemBounds = this.getObjectSnappingEdges(e.target);

        // now find where can we snap current object
        var guides = this.getGuides(lineGuideStops, itemBounds);

        // do nothing of no snapping
        if (!guides.length) {
            return;
        }

        this.drawGuides(guides, layer, scaleX, scaleY);

        // now force object position
        guides.forEach(lg => {
            switch (lg.snap) {
                case 'start': {
                    switch (lg.orientation) {
                        case 'V': {
                            e.target.x(lg.lineGuide + lg.offset);
                            break;
                        }
                        case 'H': {
                            e.target.y(lg.lineGuide + lg.offset);
                            break;
                        }
                    }
                    break;
                }
                case 'center': {
                    switch (lg.orientation) {
                        case 'V': {
                            e.target.x(lg.lineGuide + lg.offset);
                            break;
                        }
                        case 'H': {
                            e.target.y(lg.lineGuide + lg.offset);
                            break;
                        }
                    }
                    break;
                }
                case 'end': {
                    switch (lg.orientation) {
                        case 'V': {
                            e.target.x(lg.lineGuide + lg.offset);
                            break;
                        }
                        case 'H': {
                            e.target.y(lg.lineGuide + lg.offset);
                            break;
                        }
                    }
                    break;
                }
            }
        });
    }

    onDragEndLayer = (e) => {
        e.evt.preventDefault();
        let layer = e.target.getLayer();
        // clear all previous lines on the screen
        _.each(layer.find('.guid-line'), p => {
            p.destroy();
        })
        layer.batchDraw();
    }

    onShapeClick = (e) => {
        e.evt.preventDefault();
        let shape = e.target.attrs;
        let { components, selectedShape } = this.state;
        if (selectedShape) {
            notification.close(selectedShape.id)
        }

        selectedShape = _.find(components, p => p.id === shape.id);
        _.map(components, p => {
            p.selected = p.id === shape.id;
        })

        this.setState({ components, selectedShape })
        const args = {
            key: selectedShape.id,
            message: '编辑标点',
            description: <div style={{ display: 'flex', flexDirection: 'column' }}>
                id：{selectedShape.id}
                <div style={{ display: 'flex', alignItems: 'center' }}>编号： <Input defaultValue={selectedShape.code} onChange={element => this.onBookingTimeChange(element.target.value)} style={{ width: 220 }} /></div>
                <div style={{ display: 'flex', flexDirection: 'row', marginTop: 10 }}>
                    <Button size='small' type='primary' onClick={this.deletePot}>删除</Button>
                    <Button size='small' style={{ marginLeft: 10 }} onClick={this.onSave}>保存</Button>
                </div>
            </div>,
            onClose: this.onCloseShapeClick,
            duration: 0,
        };
        notification.open(args);
    }

    onBookingTimeChange = (value) => {
        this.setState({ value })
    }

    onSave = () => {
        let { components, selectedShape, value } = this.state;
        _.map(components, p => {
            if (p.id === selectedShape.id) {
                p.code = value;
                p.selected = false;
            }
        })

        notification.destroy();
        this.setState({ components, value: null, selectedShape: null })
    }

    onCloseShapeClick = () => {
        let { components } = this.state;
        _.map(components, p => {
            p.selected = false
        })

        notification.destroy();
        this.setState({ components, selectedShape: null })
    }

    onCircleDragEnd = (e) => {
        e.evt.preventDefault();
        let pointer = e.target.attrs;
        _.map(this.state.components, p => {
            if (p.id === pointer.id) {
                p.x = pointer.x;
                p.y = pointer.y;
            }
        })
    }

    render() {
        return <div style={{
            width: 1440,
            height: 800
        }}>
            <button onClick={this.show}>获取所有坐标信息</button>
            <Stage
                onDragStart={this.stageOnDragStart}
                style={{ background: 'lightgray' }}
                draggable
                width={window.innerWidth}
                height={window.innerHeight}
                // x={this.state.stageX}
                // y={this.state.stageY}
                scaleX={this.state.stageScale}
                scaleY={this.state.stageScale}
                onWheel={this.handleWheel}  // 鼠标滑动事件
                onDblClick={this.onDblClick} // 鼠标双击事件
                onDragEnd={this.onDragEnd}  //鼠标拖拽事件
            >
                <Layer
                    onDragMove={this.onDragMoveLayer}
                    onDragEnd={this.onDragEndLayer}
                >
                    {/* 背景图，支持png、svg格式 */}
                    <URLImage src={bg} x={170} stroke={this.state.stroke} />
                    {/* 遍历标点列表 */}
                    {this.state.components.map(p => {
                        // 设置标点形状为Circle，还可以设置为Rect、Ring、Star
                        return <Circle
                            onClick={this.onShapeClick}
                            onMouseOver={this.onMouseOver}
                            onMouseLeave={this.onMouseLeave}
                            onDragEnd={this.onCircleDragEnd}
                            type='pot'
                            key={p.id}
                            id={p.id}
                            x={p.x}
                            y={p.y}
                            draggable //设置是否允许拖拽
                            radius={16}
                            fill={p.fill}
                            strokeWidth={8}
                            stroke={p.selected ? '#FFFF00' : '#fff'}
                            name='object'
                        />
                    })}
                </Layer>
            </Stage>
        </div>
    }
}

export default ShapeDemo;