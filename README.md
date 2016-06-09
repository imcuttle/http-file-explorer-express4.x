# HTTP文件浏览 Version2

## 改进
之前做的[HTTP浏览](http://moyuyc.github.io/2016/05/28/node-express-jade%E5%AE%9E%E7%8E%B0HTTP%E6%96%87%E4%BB%B6%E6%B5%8F%E8%A7%88%E5%99%A8/)是使用express2.x版本做的...，因为参考书比较旧了。
1. `express2.x`中没有`express4.x`中的`res.sendFile()`方法，之前发送文件是使用的`stream.pipe()`方法，导致不支持继续下载，而且用户不能知道下载进度，在线音乐视频播放也不能选择时间跳跃欣赏。`res.sendFile()`方法可以将本地文件以静态资源发送给用户，所有问题迎刃而解。
2. 旧版本不支持`java/c/cpp/js/css/html`等代码文件和`md/markdown`文件在线查看，所以进行改进。
3. 利用`Bootstrap responsive utils`和`Bootstrap grid system`进行响应式布局。
4. 监控`root.txt`文件，改变root后无需重启服务器。
5. 去除对`q.js`依赖，使用原生`Promise`

## 说明
- `root.txt` :共享文件夹路径
- `app.js` :入口

## 使用
1.       npm install
2.       npm start
3.       http://localhost:3500/ 