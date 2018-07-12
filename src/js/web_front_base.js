/*********************html知识********************/
// 1，html的文件声明作用，不声明有没有影响
// 答案：最新的声明方式<!doctype html>，不声明的话没有任何影响。

// 2，html5的新特性
// 答案：
// 新元素：canvas，
// 多媒体新元素：audio，video，source，embed，track
// 表单新元素：datalist，Keygen，output
// 新的语义和结构元素：article，aside，bdi，command，detail，dialog，
// summary，figure，figcaption，footer，header，mark，nav，progress，ruby，rt，rp，sectio，time，wbr
// 移除的元素：font，dir，frame，frameset，tt，trike，center，applet，basefont

// 新的API：
// 1，Websocket.var s = new Websocket('url',prototype); s.onopen = fn;s.onmessage = fn;s.onclose = fn;
// 2，SSE（Server-Send-Event）（IE不支持）.var s = new EventSource(url);s.onopen = fn;s.onerror = fn; s.onmessge = fn(event){alert(event.data)};
// 3,Worker。检查是否支持（很重要）var w = new Worker('worker.js');w.onmessage = fn(event){alert(event.data)}; stop:w.terminate(); w.onopen = fn;w.onerror = fn;
// 4,应用离线缓存。<html manifest="demo.appcache"> 请注意，manifest 文件需要配置正确的 MIME-type，即 "text/cache-manifest"。必须在 web 服务器上进行配置。
// 5，Web-sql.
// 核心方法 
// 创建数据库：openDatabase('name','version','description','size',callback);
// 事物：database.transaction()
// 执行sql：executeSql()
// 6,localStorage（没有时间限制的数据存储）和sessionStorage（针对一个 session 的数据存储）
// 7，语义元素： 
// 兼容ie：
//  <!--[if lt IE 9]>
// { /* <script src="html5shiv.js"></script> */ }
//  <![endif]--> 
// 兼容其他浏览器：显示为块级元素
//  header, section, footer, aside, nav, article, figure
//  { 
//  display: block; 
//  } 
// 8,地理定位：Geolocation  navigator.geolocation.getCurrentPosition(showPosition，showErrorFn(error){error.code});
// 9,拖放：drag和drop

// 表单元素的新属性
// 1，form： autocomplete novalidate
// 2，input:autocomplete,foucs,min,max,form,height,width,list,mutiple,pattern,required,step
// 3,input类型:color,date,email,url,week,range,search,tel,number,month,year,datetime,datetime-local,url

// 3，html的语义化如何理解
// 答案：一个语义元素能够清楚的描述其意义给浏览器和开发者。
// 无语义 元素实例: <div> 和 <span> - 无需考虑内容
// 语义元素实例: <form>, <table>, <img> ,<footer>,<header>,<nav>,<aside>,<article> - 清楚的定义了它的内容. 

// 4，html的布局
// 答案：常见的布局方案有： 
// 1，两栏布局（左边宽度固定，右边内容自适应）；
// 2，三栏布局：左右宽度固定，中间内容自适应；上下高度固定，中间左右两栏；
// 3，瀑布流布局，利用元素的流特性。


/*********************css知识********************/
// 1，css的选择器有哪些，优先级是怎么样的？
// 答案：id>class>元素>属性

// 2，css的定位问题
// 答案：默认定位 ：static
// 相对定位：relative，相对于自身偏移
// 绝对定位：absolute，相对于最近的一个父级元素（不为static的）进行偏移
// 固定定位：相对于窗口进行偏移

// 3，css实现两栏布局，三栏布局。
// 答案：

// 4，Sass和Less的用法？
// 答案：minix，变量。

// 5，css动画和过度，2D和3D转换
// 答案：
// 定义动画：
// @keyframes myfirst
// {
// from {background: red;}
// to {background: yellow;}
// }

// @-webkit-keyframes myfirst /* Safari and Chrome */
// {
// from {background: red;}
// to {background: yellow;}
// }
// 在元素上使用动画：
// div
// {
// animation: myfirst 5s;
// -webkit-animation: myfirst 5s; /* Safari and Chrome */
// }  

// 过度：
// 指定要添加效果的CSS属性
// 指定效果的持续时间。
// div 
// { 
// transition: width 2s, height 2s, transform 2s; 
// -webkit-transition: width 2s, height 2s, -webkit-transform 2s; 
// }  

// 2D转换：
// transform:rotate(130deg);
// -webkit - transform: rotate(130 deg); /* Safari and Chrome */

// 3D转换 相对于2D多了一个Z轴
// transform:rotateY(130deg) scale，materialX translateX;
// -webkit - transform: rotateY(130 deg); /* Safari and Chrome */


// 6，媒体查询
// 答案：@media not|only mediatype and (expressions) {
// CSS-Code;
// }
// mediatype：print，screen，speech all

// 7，弹性布局
// 答案：
// display：-webkit-flex；
// flex-direction：row|column|row-reserve|columns-reserve
// justify-content: flex-start | flex-end | center | space-between | space-around
// align-items: flex-start | flex-end | center | baseline | stretch
// align-content: flex-start | flex-end | center | space-between | space-around | stretch
// flex-wrap: nowrap|wrap|wrap-reverse|initial|inherit; 
// 属性用于设置弹性元素自身在侧轴（纵轴）方向上的对齐方式。align-self: auto | flex-start | flex-end | center | baseline | stretch
//  属性用于指定弹性子元素如何分配空间。flex：none | [ flex-grow ] || [ flex-shrink ] || [ flex-basis ]

/*********************JS基础********************/
// 1，原型链的理解
// 答案： 

// 2，基础数据类型
// 答案：字符串（String）、数字(Number)、布尔(Boolean)、数组(Array)、对象(Object)、空（Null）、未定义（Undefined）。

// 3，如何判断一个变量是不是数组
// 答案：1，通过Array.isArray();2,通过 instaceof判断

// 4，es6的新特性
// 答案：

// 5，闭包的理解
// 答案：

// 6，this的指向问题
// 答案：

// 7，页面性能优化
// 答案：

// 8，浏览器的兼容性
// 答案：

// 9，变量提升
// 答案：


/*********************http知识********************/
// 1，http和https的区别
// 答案：

// 2，对http的理解
// 答案：

// 3，如何开启http缓存
// 答案：

// 4，http的状态码
// 答案：

/*********************Vue知识********************/
// Vue知识
// 1，双向数据绑定的实现和原理
// 答案：

// 2，钩子函数
// 答案：

// 3，vuex的使用
// 答案：

// 4，vue-router
// 答案：

// 5，父子组建的传值方式
// 答案：

/*********************React知识********************/
// 1，创建组件的方式
// 函数式和class方式

// 2，组件的类型
// 状态组件和无状态组件
// 状态组件：
// 无状态组件一般是纯粹的html展示组件，没有数据状态的依赖

// 3，组件的传值方式
// props

// 4，钩子函数
// 答案：



/*********************Webpack知识********************/
// 1，有哪些配置项
// 2，Webpack和Gulp和Grunt的区别