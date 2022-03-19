### 工作原理
Konva 的对象是以一颗树的形式保存的，Konva Tree 主要包括以下几部分：
- Stage 根节点：这是应用的根节点，会创建一个 div 节点，作为事件的接收层，根据事件触发时的坐标来分发出去。一个 Stage 节点可以包含多个 Layer 图层。
- Layer 图层：每一个 Layer 有两个 canvas 渲染器（场景渲染器和图像命中检测渲染器）。场景渲染器输出用户看见的内容，图像命中渲染器在隐藏的 canvas 里用于高性能的检测事件。一个 Layer 可以包含多个 Group 和 Shape。
- Group 组：Group 包含多个 Shape，如果对其进行变换和滤镜，里面所有的 Shape 都会生效。
- Shape图形：指 Text、Rect、Circle 等图形，这些是 Konva 封装好的类。

![image](https://user-images.githubusercontent.com/50393260/159124304-a4aaacc8-d6ad-4e93-8ce3-01c9a9274908.png)

- 问：画布在拖拽或缩放后，鼠标双击产生点的位置出现偏移，如何解决？
- 答：画布拖拽或缩放后，会在相应的onWheel和onDragEnd事件中产生一个scale系数， 在鼠标双击onDblClick方法中，判断scale不为空，则表示经过缩放或拖拽。当前双击的坐标位置（x,y）是在未缩放和拖拽前的画布尺寸下产生的位置，经过与scale和当前stage的坐标位置换算得到实际的坐标，从而解决问题。

在线预览：https://mwjuan.github.io/konva_demo/
