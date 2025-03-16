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
        gap: 20,

        // 积分
        scoreLabel: cc.Label,

        // 游戏结束界面
        gameEnd: cc.Node,
    },

    onLoad() {
        this.boxSize = (cc.winSize.width - this.gap * (BOX_NUM + 1)) / BOX_NUM;

        let y = this.boxSize;// - cc.winSize.height / 2;

        this.gameEnd.active = false;

        this.score = 0;
        this.scoreLabel.string = "积分：" + this.score;

        // 存放数据
        this.data = new Array();

        for (let row = 0; row < BOX_NUM; row++) {
            // 设置位于正中间
            let x = this.boxSize / 2 + this.gap;// - cc.winSize.width / 2;
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
        let emptyBoxs = new Array();
        for (let row = 0; row < BOX_NUM; ++row) {
            for (let col = 0; col < BOX_NUM; ++col) {
                const boxData = this.data[row][col];
                if (boxData.value == 0)
                    emptyBoxs.push(cc.v2(row, col));
            }
        }

        if (emptyBoxs.length > 0) {
            // Math floor向下取整 Math.random 在0-1范围内随机一个数
            const index = Math.floor(Math.random() * emptyBoxs.length);
            const position = emptyBoxs[index];
            const data = this.data[position.x][position.y];

            // 给盒子赋值
            const num = NUMS[Math.floor(Math.random() * NUMS.length)];

            this.score += num;
            this.scoreLabel.string = "积分：" + this.score;

            const box = this.createBox(data.position, num);
            data.value = num;
            data.box = box;

            // 从空BOX列表删除 splice删除数组内的数据
            emptyBoxs.splice(index, 1);
        }
        if (emptyBoxs.length <= 0 && this.chearGameOver()) {
            cc.log("游戏结束");
            this.gameEnd.active = true;
        }
    },

    // 触摸开始
    onTouchStart(e) {
        // 保存触摸位置
        this.startPosition = e.getLocation();
    },

    onTouchEnd(e) {
        this.endPosition = e.getLocation();
        // 距离cc.v2向量 sub向量减法
        const distance = this.endPosition.sub(this.startPosition);

        // 方向
        let direction = null;

        // 左右移动
        if (Math.abs(distance.x) > Math.abs(distance.y)) {
            if (distance.x > 0) {
                direction = "right";
                cc.log("right");
            }
            else {
                direction = "left";
                cc.log("left");
            }
        }
        else {
            if (distance.y > 0) {
                direction = "up";
                cc.log("up");
            }
            else {
                direction = "down";
                cc.log("down");
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
            }
            else if (direction == "right") {
                for (let row = 0; row < BOX_NUM; ++row) {
                    for (let col = BOX_NUM - 1; col >= 0; --col) {
                        this.needMoveBox.push({ row, col });
                    }
                }
            }
            else if (direction == "up") {
                for (let row = BOX_NUM - 1; row >= 0; --row) {
                    for (let col = 0; col < BOX_NUM; ++col) {
                        this.needMoveBox.push({ row, col });
                    }
                }
            }
            else {
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
            })
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
        }
        else if (dir == "right") {
            nextRow = row;
            nextCol = col + 1;
            if (nextCol >= BOX_NUM)
                return;
        }
        else if (dir == "up") {
            nextRow = row + 1;
            nextCol = col;
            if (nextRow >= BOX_NUM)
                return;
        }
        else {
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

                    // 递归
                    this.move(dir, nextRow, nextCol);
                })
            }
            else if (next.value == 0) {
                // 移动
                this.data[nextRow][nextCol].box = this.data[row][col].box;
                this.data[nextRow][nextCol].value = this.data[row][col].value;

                // 数据初始化
                this.data[row][col].value = 0;
                this.data[row][col].box = null;

                this.doMove(currentBox, nextPosition, () => {
                    // 递归
                    this.move(dir, nextRow, nextCol);
                })
            }
        }
    },

    doMove(box, pos, call) {
        const act1 = cc.moveTo(0.005, pos);
        const act2 = cc.callFunc(() => {
            // 调用
            call && call();

            // 执行
            if (this.moveBoxNum != 0 && this.needMoveBox.length == this.moveBoxNum) {
                // 生成新box
                this.createRandomBox();

                this.needMoveBox = [];
                this.moveBoxNum = 0;
            }
        })
        const end = cc.sequence(act1, act2);
        box.runAction(end);
    },

    chearGameOver() {
        for (let row = 0; row < BOX_NUM; row++) {
            for (let col = 0; col < BOX_NUM; col++) {
                const currentValue = this.data[row][col].value;
                if (
                    (row - 1 >= 0 && this.data[row - 1][col].value == currentValue)  // 向下
                    || (row + 1 < BOX_NUM && this.data[row + 1][col].value == currentValue) // 向上
                    || (col - 1 >= 0 && this.data[row][col - 1].value == currentValue) // 向左
                    || (col + 1 < BOX_NUM && this.data[row][col + 1].value == currentValue) // 向右
                ) {
                    return false;
                }
            }
        }
        return true;
    },

    start() {
        // 注册触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.createRandomBox();
    },

    newGame() {
        let y = this.boxSize;// - cc.winSize.height / 2;

        // 游戏初始化
        this.gameEnd.active = false;
        this.score = 0;
        this.scoreLabel.string = "积分：" + this.score;

        // 存放数据
        this.data = new Array();

        for (let row = 0; row < BOX_NUM; row++) {
            // 设置位于正中间
            let x = this.boxSize / 2 + this.gap;// - cc.winSize.width / 2;
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
    }
});
