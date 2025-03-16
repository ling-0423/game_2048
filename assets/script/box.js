var color = [];

color[0] = cc.color(240, 231, 223, 255);
color[2] = cc.color(0, 184, 139, 255);
color[4] = cc.color(207, 0, 69, 255);
color[8] = cc.color(191, 99, 0, 255);
color[16] = cc.color(237, 212, 190, 255);
color[32] = cc.color(237, 212, 190, 255);
color[64] = cc.color(237, 212, 190, 255);
color[128] = cc.color(237, 212, 190, 255);
color[256] = cc.color(237, 212, 190, 255);
color[512] = cc.color(237, 212, 190, 255);
color[1024] = cc.color(237, 212, 190, 255);
color[2048] = cc.color(237, 212, 190, 255);

cc.Class({
    extends: cc.Component,

    properties: {
        // 文本
        label:cc.Label,
    },

    setNum(num){
        if(num == 0)
            this.label.node.active = false;

        this.label.string =  num;

        this.node.color = color[num];
    },

    start () {

    },
});
