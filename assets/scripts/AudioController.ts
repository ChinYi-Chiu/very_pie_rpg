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
            effect.volume = v;
        }
    }


    // 音訊來源
    @property(AudioSource)
    chiiWalking: AudioSource | null = null;

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
    }
}


