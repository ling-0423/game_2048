cc.Class({
    extends: cc.Component,

    properties: {
        // 标题标签
        titleLabel: {
            default: null,
            type: cc.Label
        },
        // 无尽模式按钮
        endlessButton: {
            default: null,
            type: cc.Button
        },
        // 闯关模式按钮
        levelButton: {
            default: null,
            type: cc.Button
        }
    },

    onLoad() {
        // 设置按钮点击事件
        this.endlessButton.node.on('click', this.onEndlessMode, this);
        this.levelButton.node.on('click', this.onLevelMode, this);
    },

    // 无尽模式
    onEndlessMode() {
        cc.director.loadScene('Game');  // 加载游戏场景
    },

    // 闯关模式
    onLevelMode() {
        // 暂未实现
        cc.log('闯关模式暂未实现');
    },

    start() {
        // 设置按钮样式
        this.setupButton(this.endlessButton.node);
        this.setupButton(this.levelButton.node);
        
        // 设置标题样式
        if (this.titleLabel) {
            this.titleLabel.fontSize = 100;
            this.titleLabel.lineHeight = 100;
            this.titleLabel.node.color = cc.color(119, 110, 101);  // #776E65 深灰色
        }
    },

    setupButton(buttonNode) {
        // 设置按钮大小
        buttonNode.width = 280;
        buttonNode.height = 70;
        
        // 获取按钮组件
        const button = buttonNode.getComponent(cc.Button);
        
        // 设置更温暖的颜色
        button.normalColor = cc.color(236, 196, 0);     // 金黄色 #ECC400
        button.pressedColor = cc.color(215, 179, 0);    // 深金色 #D7B300
        button.hoverColor = cc.color(255, 212, 0);      // 亮金色 #FFD400
        
        // 设置过渡时间
        button.transition = cc.Button.Transition.COLOR;
        button.duration = 0.1;

        // 设置按钮文字样式
        const label = buttonNode.getComponentInChildren(cc.Label);
        if (label) {
            label.fontSize = 36;
            label.lineHeight = 36;
            label.node.color = cc.color(255, 255, 255);  // 白色文字
        }
    }
}); 