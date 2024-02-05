import { _decorator, Component, Node, Button, ProgressBar, Slider, Event, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Setting')
export class Setting extends Component {
    start() {
        this.exitBtn?.node.on(Node.EventType.MOUSE_UP, () => { this.node.active = false; }, this);

        // 當這兩個滑軌被滑動時就觸發修改音量
        this.MVP.getComponentInChildren(Button).node.on(Node.EventType.TRANSFORM_CHANGED, this.updateMVP, this);
        this.EVP.getComponentInChildren(Button).node.on(Node.EventType.TRANSFORM_CHANGED, this.updateEVP, this);
    }

    update(deltaTime: number) {
    }

    updateMVP() {
        console.log("Music Volume change to: " + this.MVP.progress);
    }
    updateEVP() {
        console.log("Effects Volume change to: " + this.EVP.progress);
    }

    @property(Slider)
    MVP: Slider | null = null;
    @property(Slider)
    EVP: Slider | null = null;
    @property(Button)
    exitBtn: Button | null = null;
    @property(Node)
    eventBlocker: Node | null = null;
}


