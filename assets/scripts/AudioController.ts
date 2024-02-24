import { _decorator, AudioClip, AudioSource, Button, Component, Label, Node, Slider } from 'cc';
import { AnimationController } from './AnimationController';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    update(deltaTime: number) {
    }

    // 播放某個音訊
    play(audioName: string) {
        const a = this[audioName] as AudioSource;
        a.play();
    }
    // 停止某個音訊
    stop(audioName: string) {
        const a = this[audioName] as AudioSource;
        a.stop();
    }
    // 暫停某個音訊
    pause(audioName: string) {
        const a = this[audioName] as AudioSource;
        a.pause();
    }
    updateMV(v: number) {
        if (!this.bgm1.playing && v > 0) this.bgm1.play();
        this.bgm1.volume = v;
    }
    updateEV(v: number) {
        for (let effect of this.effects) {
            if (effect) effect.volume = v;
        }
    }

    private _playBgm: boolean = false;

    // 音訊來源
    @property(AudioSource)
    chiiWalking: AudioSource | null = null;

    @property(AudioSource)
    chii_pie_story_fight: AudioSource | null = null;

    @property(AudioSource)
    startPage: AudioSource | null = null;

    // 音訊來源 (bgm)
    @property(AudioSource)
    bgm1: AudioSource | null = null;

    // 所有 bgm
    effects: AudioSource[] = [];
    start() {
        this.effects.push(this.chiiWalking);
        this.effects.push(this.startPage);
        this.effects.push(this.chii_pie_story_fight);
        this.effects.push(this.indoor_scenetrans_end);
        this.effects.push(this.Fight_ChiiChair);
        this.effects.push(this.Fight_ChiiSack);
        this.effects.push(this.Fight_ChiiFist);
        this.effects.push(this.Fight_Dodge);
        this.effects.push(this.Click);
        this.effects.push(this.Smash);
        this.effects.push(this.Look);
        this.effects.push(this.Camera);
        this.effects.push(this.Mouse);
    }

    @property(AudioSource)
    indoor_scenetrans_end: AudioSource | null = null;

    @property(AudioSource)//椅子
    Fight_ChiiChair: AudioSource | null = null;

    @property(AudioSource)//蓋布袋
    Fight_ChiiSack: AudioSource | null = null;

    @property(AudioSource)//起派鐵拳
    Fight_ChiiFist: AudioSource | null = null;

    @property(AudioSource)//鬼之閃避
    Fight_Dodge: AudioSource | null = null;

    @property(AudioSource)//點擊音效
    Click: AudioSource | null = null;

    @property(AudioSource)
    Smash: AudioSource | null = null;

    @property(AudioSource)
    Look: AudioSource | null = null;

    @property(AudioSource)
    Camera: AudioSource | null = null;

    @property(AudioSource)
    Mouse: AudioSource | null = null;

    @property(AudioSource)
    FoodCome:AudioSource|null=null;
}


