# Spline demo

使用 Snap! iframe 库驱动 3D world。 参考 [与 3D world 互操作(以 Spline 为例)](https://wwj718.github.io/post/%E7%BC%96%E7%A8%8B/snap-iframe/#%E4%B8%8E-3d-world-%E4%BA%92%E6%93%8D%E4%BD%9C%E4%BB%A5-spline-%E4%B8%BA%E4%BE%8B)

[Spline 项目地址](https://app.spline.design/file/d3116a73-5d3f-4d78-98ad-46738716488f), 修改自 [Mini House - Conditional Logic](https://app.spline.design/file/8dca6daa-d77b-4c65-85a5-b220b8b66ba0)

## 工作原理

当前项目使用 [splinetool/react-spline](https://github.com/splinetool/react-spline) 与 Spline 项目互操作

使用 postMessage 在 Spline 元素(`import Spline from "@splinetool/react-spline";`) 与 Snap! 之间传递传递消息。

## 开发

当前项目使用 [create-react-app](https://create-react-app.dev/) 创建

`npm start`

## 部署

`npm run build`
