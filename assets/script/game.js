const BOX_NUM = 2;
const NUMS = [2, 4];

cc.Class({
    extends: cc.Component,

    properties: {
        // box 预制体
        boxPrefab: {
            type: cc.Prefab,
            default: null,
        },
        // 间隔
        gap: 15,

        // 积分
        scoreLabel: cc.Label,

        // 游戏结束界面
        gameEnd: cc.Node,

        // 添加新属性
        scoreDisplay: {
            default: null,
            type: cc.Node,
        },
        bestScoreLabel: {
            default: null,
            type: cc.Label,
        },
        // 游戏结束界面的组件
        gameOverScore: cc.Label,    // 显示最终分数
        gameOverBest: cc.Label,     // 显示最高分
        restartButton: cc.Button,   // 重新开始按钮
        backButton: cc.Button,      // 返回主菜单按钮
    },

    onLoad() {
        // 添加错误检查
        if (!this.scoreLabel || !this.bestScoreLabel) {
            cc.error('请在场景中设置 scoreLabel 和 bestScoreLabel 组件');
            return;
        }

        this.boxSize = (cc.winSize.width - this.gap * (BOX_NUM + 1)) / BOX_NUM;
        let y = this.boxSize + 100;

        // 初始化游戏状态
        this.gameEnd.active = false;
        this.score = 0;
        this.scoreLabel.string = "积分：" + this.score;

        // 初始化数据数组
        this.data = [];
        for (let row = 0; row < BOX_NUM; row++) {
            this.data[row] = [];
        }

        // 添加最高分记录
        this.bestScore = cc.sys.localStorage.getItem('bestScore') || 0;
        this.bestScoreLabel.string = "最高分：" + this.bestScore;

        // 添加网格背景
        this._createBackground();

        // 初始化格子
        for (let row = 0; row < BOX_NUM; row++) {
            let x = this.boxSize / 2 + this.gap;
            for (let col = 0; col < BOX_NUM; col++) {
                const position = cc.v2(x, y);
                const box = this.createBox(position, 0);
                
                this.data[row][col] = {
                    position: position,
                    row: row,
                    col: col,
                    value: 0,
                    box: box
                }
                x += this.boxSize + this.gap;
            }
            y += this.boxSize + this.gap;
        }

        // 添加按钮事件
        if (this.restartButton) {
            this.restartButton.node.on('click', this.newGame, this);
        }
        if (this.backButton) {
            this.backButton.node.on('click', () => {
                cc.director.loadScene('HomePage');
            }, this);
        }
    },

    _createBackground() {
        // 创建新节点并添加Graphics组件用于绘制
        const bg = new cc.Node();
        bg.addComponent(cc.Graphics);
        this.node.addChild(bg);
        
        // 设置网格线的样式
        const graphics = bg.getComponent(cc.Graphics);
        // 设置网格线颜色
        graphics.strokeColor = cc.color(187, 173, 160);  
        // 设置线宽
        graphics.lineWidth = 2;  
        
        // 绘制网格线
        for (let i = 0; i <= BOX_NUM; i++) {
            const pos = this.gap + i * (this.boxSize + this.gap);
            // 绘制水平线
            graphics.moveTo(this.gap, pos);
            graphics.lineTo(this.gap + BOX_NUM * (this.boxSize + this.gap), pos);
            // 绘制垂直线
            graphics.moveTo(pos, this.gap);
            graphics.lineTo(pos, this.gap + BOX_NUM * (this.boxSize + this.gap));
        }
        graphics.stroke();
    },

    createBox(pos, num) {
        // 克隆预制体
        let box = cc.instantiate(this.boxPrefab);
        this.node.addChild(box);
        box.position = pos;
        box.width = this.boxSize;
        box.height = this.boxSize;
        box.getComponent("box").setNum(num);
        return box;
    },

    // 查找空的box 创建随机盒子
    createRandomBox() {
        // 查找空的box
        let emptyBoxs = [];  // 使用[]代替new Array()
        
        // 检查并收集空格子
        for (let row = 0; row < BOX_NUM; ++row) {
            if (!this.data[row]) continue;  // 确保该行存在
            for (let col = 0; col < BOX_NUM; ++col) {
                if (!this.data[row][col]) continue;  // 确保该格子存在
                if (this.data[row][col].value === 0) {  // 使用===进行严格比较
                    emptyBoxs.push({
                        row: row,
                        col: col,
                        position: this.data[row][col].position
                    });
                }
            }
        }

        // 如果有空格子，随机选择一个并放置数字
        if (emptyBoxs.length > 0) {
            const index = Math.floor(Math.random() * emptyBoxs.length);
            const emptyBox = emptyBoxs[index];
            
            // 随机选择2或4
            const num = NUMS[Math.floor(Math.random() * NUMS.length)];
            
            // 创建新方块
            const box = this.createBox(emptyBox.position, num);
            
            // 更新数据
            this.data[emptyBox.row][emptyBox.col].value = num;
            this.data[emptyBox.row][emptyBox.col].box = box;
        }
    },

    // 触摸开始
    onTouchStart(e) {
        // 保存触摸位置
        this.startPosition = e.getLocation();
    },

    onTouchEnd(e) {
        this.endPosition = e.getLocation();
        const distance = this.endPosition.sub(this.startPosition);
        
        // 方向
        let direction = null;
        
        // 降低滑动判定的阈值，使操作更灵敏
        const minDistance = 10;  // 添加最小滑动距离判定
        
        // 左右移动
        if (Math.abs(distance.x) > Math.abs(distance.y)) {
            if (Math.abs(distance.x) < minDistance) return;  // 防止误触
            if (distance.x > 0) {
                direction = "right";
            } else {
                direction = "left";
            }
        } else {
            if (Math.abs(distance.y) < minDistance) return;  // 防止误触
            if (distance.y > 0) {
                direction = "up";
            } else {
                direction = "down";
            }
        }

        if (direction != null) {
            // 需要移动的box
            this.needMoveBox = [];
            this.moveBoxNum = 0;

            if (direction == "left") {
                for (let row = 0; row < BOX_NUM; ++row) {
                    for (let col = 0; col < BOX_NUM; ++col) {
                        this.needMoveBox.push({ row, col });
                    }
                }
            } else if (direction == "right") {
                for (let row = 0; row < BOX_NUM; ++row) {
                    for (let col = BOX_NUM - 1; col >= 0; --col) {
                        this.needMoveBox.push({ row, col });
                    }
                }
            } else if (direction == "up") {
                for (let row = BOX_NUM - 1; row >= 0; --row) {
                    for (let col = 0; col < BOX_NUM; ++col) {
                        this.needMoveBox.push({ row, col });
                    }
                }
            } else {
                for (let row = 0; row < BOX_NUM; ++row) {
                    for (let col = 0; col < BOX_NUM; ++col) {
                        this.needMoveBox.push({ row, col });
                    }
                }
            }

            // forEach枚举所有内容并执行方法
            this.needMoveBox.forEach(box => {
                this.moveBoxNum++;
                this.move(direction, box.row, box.col);
            });
        }
    },

    move(dir, row, col) {
        if (this.data[row][col].value == 0)
            return;

        // next box
        let nextRow = row;
        let nextCol = col;
        if (dir == "left") {
            nextRow = row;
            nextCol = col - 1;
            if (nextCol < 0)
                return;
        } else if (dir == "right") {
            nextRow = row;
            nextCol = col + 1;
            if (nextCol >= BOX_NUM)
                return;
        } else if (dir == "up") {
            nextRow = row + 1;
            nextCol = col;
            if (nextRow >= BOX_NUM)
                return;
        } else {
            nextRow = row - 1;
            nextCol = col;
            if (nextRow < 0)
                return;
        }

        // 当前盒子
        const current = this.data[row][col];
        const currentBox = current.box;

        // 下一个
        const next = this.data[nextRow][nextCol];
        const nextPosition = next.position;

        if (currentBox) {
            if (next.value == current.value) {
                // 融合
                this.data[nextRow][nextCol].value *= 2;
                next.box.getComponent("box").setNum(this.data[nextRow][nextCol].value);

                // 数据初始化
                this.data[row][col].value = 0;
                this.data[row][col].box = null;

                this.doMove(currentBox, nextPosition, () => {
                    // 销毁自己
                    currentBox.destroy();
                    
                    // 更新分数和动画
                    this.merge(currentBox, next.box, this.data[nextRow][nextCol].value);

                    // 递归
                    this.move(dir, nextRow, nextCol);
                });
            } else if (next.value == 0) {
                // 移动
                this.data[nextRow][nextCol].box = this.data[row][col].box;
                this.data[nextRow][nextCol].value = this.data[row][col].value;

                // 数据初始化
                this.data[row][col].value = 0;
                this.data[row][col].box = null;

                this.doMove(currentBox, nextPosition, () => {
                    // 递归
                    this.move(dir, nextRow, nextCol);
                });
            }
        }
    },

    doMove(box, pos, call) {
        const moveAnim = cc.moveTo(0.08, pos).easing(cc.easeInOut(2.0));
        const callback = cc.callFunc(() => {
            call && call();
            
            if (this.moveBoxNum != 0 && this.needMoveBox.length == this.moveBoxNum) {
                this.createRandomBox();
                this.needMoveBox = [];
                this.moveBoxNum = 0;
                
                if (this.chearGameOver()) {
                    cc.log("游戏结束");
                    this.showGameOver();
                }
            }
        });
        
        box.runAction(cc.sequence(moveAnim, callback));
    },

    chearGameOver() {
        if (!this.data) return true;
        
        // 先检查是否有空格子
        for (let row = 0; row < BOX_NUM; row++) {
            for (let col = 0; col < BOX_NUM; col++) {
                if (this.data[row][col].value === 0) {
                    return false;  // 还有空格子，游戏继续
                }
            }
        }
        
        // 如果没有空格子，检查是否有可合并的相邻方块
        for (let row = 0; row < BOX_NUM; row++) {
            for (let col = 0; col < BOX_NUM; col++) {
                const currentValue = this.data[row][col].value;
                if (
                    (row - 1 >= 0 && this.data[row - 1][col].value == currentValue)  // 向下
                    || (row + 1 < BOX_NUM && this.data[row + 1][col].value == currentValue) // 向上
                    || (col - 1 >= 0 && this.data[row][col - 1].value == currentValue) // 向左
                    || (col + 1 < BOX_NUM && this.data[row][col + 1].value == currentValue) // 向右
                ) {
                    return false;  // 有可合并的方块，游戏继续
                }
            }
        }
        
        return true;  // 既没有空格子也没有可合并的方块，游戏结束
    },

    start() {
        // 注册触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.createRandomBox();
    },

    newGame() {
        let y = this.boxSize + 100;

        // 游戏初始化
        this.gameEnd.active = false;
        this.score = 0;
        this.scoreLabel.string = "积分：" + this.score;

        // 存放数据
        this.data = new Array();

        for (let row = 0; row < BOX_NUM; row++) {
            // 设置位于正中间
            let x = this.boxSize / 2 + this.gap;
            this.data[row] = new Array();
            for (let col = 0; col < BOX_NUM; col++) {
                // 创建box
                const position = cc.v2(x, y);
                this.createBox(position, 0);

                this.data[row][col] = {
                    position: position,
                    row: row,
                    col: col,
                    value: 0,
                }
                x += this.boxSize + this.gap;
            }
            y += this.boxSize + this.gap;
        }

        this.createRandomBox();
    },

    // 修改分数更新逻辑
    updateScore(addScore) {
        // 更新当前分数
        this.score += addScore;
        if (this.scoreLabel) {
            this.scoreLabel.string = "积分：" + this.score;
        }
        
        // 更新最高分记录
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            if (this.bestScoreLabel) {
                this.bestScoreLabel.string = "最高分：" + this.bestScore;
            }
            // 保存最高分到本地存储
            cc.sys.localStorage.setItem('bestScore', this.bestScore);
        }
        
        // 添加分数动画（如果scoreDisplay存在的话）
        if (this.scoreDisplay) {
            // 创建分数增加的动画效果
            const scoreAnim = new cc.Node();
            const label = scoreAnim.addComponent(cc.Label);
            
            // 设置分数显示的样式
            label.string = "+" + addScore;
            label.fontSize = 50;  // 增大字号
            label.lineHeight = 50;
            label.node.color = cc.color(255, 200, 0);  // 设置为金黄色
            
            // 设置初始位置在合并的方块上方
            scoreAnim.position = cc.v2(0, 100);  // 调整位置到上方一点
            this.scoreDisplay.addChild(scoreAnim);
            
            // 设置动画效果：放大+淡出+向上移动
            const fadeIn = cc.fadeIn(0.1);  // 先快速显示
            const scaleUp = cc.scaleTo(0.1, 1.2);  // 放大效果
            const wait = cc.delayTime(0.2);  // 停留一小段时间
            const fadeOut = cc.fadeOut(0.3);  // 淡出效果
            const moveBy = cc.moveBy(0.3, cc.v2(0, 80));  // 向上移动
            const remove = cc.callFunc(() => scoreAnim.destroy());
            
            // 组合动画效果
            scoreAnim.opacity = 0;  // 初始透明
            scoreAnim.runAction(
                cc.sequence(
                    cc.spawn(fadeIn, scaleUp),  // 同时执行淡入和放大
                    wait,  // 等待
                    cc.spawn(fadeOut, moveBy),  // 同时执行淡出和移动
                    remove  // 最后删除节点
                )
            );
        }
    },

    // 修改合并效果
    merge(currentBox, nextBox, value) {
        // 放慢合并动画时间
        const scaleBig = cc.scaleTo(0.15, 1.2);    // 从0.12改为0.15
        const scaleNormal = cc.scaleTo(0.15, 1.0);  // 从0.12改为0.15
        nextBox.runAction(cc.sequence(scaleBig, scaleNormal));
        
        // 更新分数
        this.updateScore(value);
    },

    // 修改游戏结束逻辑
    showGameOver() {
        this.gameEnd.active = true;
        
        // 获取或添加背景节点
        let bgNode = this.gameEnd.getChildByName('Background');
        if (!bgNode) {
            bgNode = new cc.Node('Background');
            const sprite = bgNode.addComponent(cc.Sprite);
            
            // 创建一个纯色精灵帧
            const spriteFrame = new cc.SpriteFrame();
            const texture = new cc.Texture2D();
            texture.initWithData(new Uint8Array([255, 255, 255, 255]), cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
            spriteFrame.setTexture(texture);
            sprite.spriteFrame = spriteFrame;
            
            // 设置背景大小铺满屏幕
            bgNode.width = cc.winSize.width * 2;
            bgNode.height = cc.winSize.height * 2;
            
            bgNode.color = cc.color(0, 0, 0);
            bgNode.opacity = 0;  // 初始完全透明
            this.gameEnd.insertChild(bgNode, 0);  // 插入到最底层
        }
        
        // 背景渐变动画
        bgNode.stopAllActions();
        bgNode.opacity = 0;
        const fadeIn = cc.fadeTo(0.5, 150);  // 缓慢淡入半透明黑色
        bgNode.runAction(fadeIn);
        
        // 放大主要内容
        const content = this.gameEnd.getChildByName('Content');
        if (content) {
            content.scale = 0.9;  // 初始比例更大一些
            content.opacity = 0;  // 初始透明
            
            // 放大并淡入动画
            content.stopAllActions();
            const scaleAction = cc.scaleTo(0.3, 1).easing(cc.easeOut(3.0));
            const fadeAction = cc.fadeIn(0.3);
            
            content.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.spawn(scaleAction, fadeAction)
            ));
        }
        
        // 更新结束界面显示
        if (this.gameOverScore) {
            this.gameOverScore.string = "本局得分：" + this.score;
        }
        if (this.gameOverBest) {
            this.gameOverBest.string = "最高记录：" + this.bestScore;
        }
    }
});

// 按钮颜色状态
const BUTTON_COLORS = {
    // 正常状态 - 使用一个温暖的绿色，给人希望和积极的感觉
    normal: cc.color(0, 184, 148, 255),    // #00B894
    
    // 悬停状态 - 比正常状态稍亮
    hover: cc.color(0, 206, 166, 255),     // #00CEA6
    
    // 按下状态 - 比正常状态稍暗
    pressed: cc.color(0, 153, 123, 255)    // #00997B
};
