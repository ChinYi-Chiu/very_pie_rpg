import { _decorator, Component, Node, Button, ProgressBar, Slider, Event, EventTouch } from 'cc';
import { AudioController } from './AudioController';
import { GlobalData } from './GlobalData';
const { ccclass, property } = _decorator;

@ccclass('Setting')
export class Setting extends Component {
    start() {
        // Setting._instance = this;
        this.exitBtn?.node.on(Node.EventType.MOUSE_UP, () => { this.node.active = false; }, this);
        this.MVP.progress = GlobalData.musicVolume;
        this.EVP.progress = GlobalData.effectsVolume;

        // 當這兩個滑軌被滑動時就觸發修改音量
        this.MVP.getComponentInChildren(Button).node.on(Node.EventType.TRANSFORM_CHANGED, this.updateMVP, this);
        this.EVP.getComponentInChildren(Button).node.on(Node.EventType.TRANSFORM_CHANGED, this.updateEVP, this);
        this.updateMVP();
    }

    update(deltaTime: number) {
    }

    updateMVP() {
        console.log("Music Volume change to: " + this.MVP.progress);
        this.AC.updateMV(this.MVP.progress);
        GlobalData.musicVolume = this.MVP.progress;
    }
    updateEVP() {
        console.log("Effects Volume change to: " + this.EVP.progress);
        this.AC.updateEV(this.EVP.progress);
        GlobalData.effectsVolume = this.EVP.progress;
    }

    @property(Slider)
    MVP: Slider | null = null;
    @property(Slider)
    EVP: Slider | null = null;
    @property(Button)
    exitBtn: Button | null = null;
    @property(Node)
    eventBlocker: Node | null = null;
    @property(AudioController)
    AC: AudioController | null = null;
}


