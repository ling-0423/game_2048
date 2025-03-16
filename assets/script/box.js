// 定义方块颜色映射 - 使用2048游戏经典配色
const color = {
    // 空方块的颜色 - 灰褐色
    0: cc.color(205, 193, 180, 255),    
    // 数字2的颜色 - 浅米色
    2: cc.color(238, 228, 218, 255),    
    // 数字4的颜色 - 淡橙色
    4: cc.color(237, 224, 200, 255),    
    // 数字8的颜色 - 橙色
    8: cc.color(242, 177, 121, 255),    
    // 数字16的颜色 - 深橙色
    16: cc.color(245, 149, 99, 255),    
    // 数字32的颜色 - 红橙色
    32: cc.color(246, 124, 95, 255),    
    // 数字64的颜色 - 红色
    64: cc.color(246, 94, 59, 255),     
    // 数字128的颜色 - 黄色
    128: cc.color(237, 207, 114, 255),  
    // 数字256的颜色 - 深黄色
    256: cc.color(237, 204, 97, 255),   
    // 数字512的颜色 - 金黄色
    512: cc.color(237, 200, 80, 255),   
    // 数字1024的颜色 - 亮金色
    1024: cc.color(237, 197, 63, 255),  
    // 数字2048的颜色 - 深金色
    2048: cc.color(237, 194, 46, 255),  
};

// 定义文字颜色映射 - 根据背景色调整文字颜色以提高可读性
const textColor = {
    // 小数字(2,4)使用深灰色
    2: cc.color(119, 110, 101, 255),    
    // 与背景形成柔和对比
    4: cc.color(119, 110, 101, 255),    
    // 大数字(8及以上)使用白色
    8: cc.color(249, 246, 242, 255),    
    // 在深色背景上更易读
    16: cc.color(249, 246, 242, 255),   
    32: cc.color(249, 246, 242, 255),
    64: cc.color(249, 246, 242, 255),
    128: cc.color(249, 246, 242, 255),
    256: cc.color(249, 246, 242, 255),
    512: cc.color(249, 246, 242, 255),
    1024: cc.color(249, 246, 242, 255),
    2048: cc.color(249, 246, 242, 255),
};

cc.Class({
    extends: cc.Component,

    properties: {
        // 数字文本标签组件
        label: cc.Label,
    },

    // 设置方块显示的数字
    setNum(num) {
        // 当数字为0时,隐藏文本显示,显示空方块颜色
        if(num == 0) {
            this.label.node.active = false;
            this.node.color = color[0];
            return;
        }

        // 显示数字文本
        this.label.node.active = true;
        this.label.string = num;
        
        // 设置方块背景颜色
        this.node.color = color[num];
        
        // 设置文字颜色
        this.label.node.color = textColor[num];
        
        // 根据数字位数动态调整字体大小,保持美观
        if (num < 10) {
            // 个位数使用最大字号
            this.label.fontSize = 72;     
        } else if (num < 100) {
            // 两位数略微减小
            this.label.fontSize = 68;     
        } else if (num < 1000) {
            // 三位数继续减小
            this.label.fontSize = 64;     
        } else {
            // 四位数使用最小字号
            this.label.fontSize = 52;     
        }
    },

    start () {
        // 组件开始时的生命周期函数
    },
});
