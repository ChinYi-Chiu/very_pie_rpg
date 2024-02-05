import { _decorator, AudioClip, AudioSource, Button, Component, Label, Node } from 'cc';
import { GameManager } from './GameManager';
import { AnimationController } from './AnimationController';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {
    private static _instance: AudioController | null = null;
    public static getInstance(): AudioController | null { return AudioController._instance; }
    start() {
        if (!AudioController._instance) AudioController._instance = this;
        // 綁定 button 跟 函式
        this.musicToggleButton.node.on(Node.EventType.MOUSE_UP, this.toggleBgm, this);
    }

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

    // 控制 bgm 播放，可以按照這個邏輯做控制總音量
    toggleBgm(ev: any) {
        if (this._playBgm) { // 停止播放
            this._playBgm = false
            this.bgm1.pause();
            this.musicToggleButton.getComponentInChildren(Label).string = "music: off";
        } else { // 開始播放
            this._playBgm = true
            this.bgm1.play();
            this.musicToggleButton.getComponentInChildren(Label).string = "music: on";
        }
    }

    private _playBgm: boolean = false;

    // 音訊來源
    @property(AudioSource)
    chiiWalking: AudioSource | null = null;

    @property(AudioSource)
    startPage: AudioSource | null = null;

    // 音訊來源 (bgm)
    @property(AudioSource)
    bgm1: AudioSource | null = null;

    // 控制 bgm 播放的按鈕
    @property(Button)
    musicToggleButton: Button | null = null;

    @property(GameManager)
    gameManager: GameManager | null = null;

}


