import { _decorator, Animation, AnimationClip, Component, Event, Node } from 'cc';
import { GameManager } from './GameManager';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('AnimationController')
export class AnimationController extends Component {
    start() {
        // 開始撥放 start 這個動畫
        this.gameManager?.node.on('Start', (ev: Event) => {
            this.start_page.play("Indoor_SceneTrans"); //播動畫
            this.audioController.play("startPage"); //播音樂
            setTimeout(() => { //等動畫播完後做其他事
                this.audioController.stop("startPage"); //音樂停
                this.gameManager.updateUI(); // 播完動畫，進入下一個場景
            }, this.start_page.getState("Indoor_SceneTrans").duration * 1000);
        }, this);

        // 開始播放超哥走進來的動畫。
        this.gameManager?.node.on('chiiComing', (ev: Event) => {
            this.chii.play("chiiComing"); //播動畫
            this.audioController.play("chiiWalking"); //播音樂
            setTimeout(() => { //等動畫播完後做其他事
                this.audioController.stop("chiiWalking"); //音樂停
                this.gameManager.updateUI(); // 播完動畫，進入下一個場景
            }, this.chii.getState("chiiComing").duration * 1000);
        }, this);

        // 開始播放anan走出去的動畫。
        this.gameManager?.node.on('girlwalkaway', (ev: Event) => {
            this.girlwalkaway.play("girlwalkaway"); //播動畫
            this.audioController.play("chiiWalking"); //播音樂
            setTimeout(() => { //等動畫播完後做其他事
                this.audioController.stop("chiiWalking"); //音樂停
                this.gameManager.updateUI(); // 播完動畫，進入下一個場景
            }, this.girlwalkaway.getState("girlwalkaway").duration * 1000);
        }, this);

        // 開始播放anan走進來的動畫。
        this.gameManager?.node.on('girlwalkin', (ev: Event) => {
            this.girlwalkin.play("girlwalkin"); //播動畫
            this.audioController.play("chiiWalking"); //播音樂
            setTimeout(() => { //等動畫播完後做其他事
                this.audioController.stop("chiiWalking"); //音樂停
                this.gameManager.updateUI(); // 播完動畫，進入下一個場景
            }, this.girlwalkin.getState("girlwalkin").duration * 1000);
        }, this);
    }

    update(deltaTime: number) {

    }

    @property(GameManager)
    gameManager: GameManager | null = null;
    @property(AudioController)
    audioController: AudioController | null = null;

    @property(Animation)
    chii: Animation | null = null;

    @property(Animation)
    start_page: Animation|null=null;

    @property(Animation)
    girlwalkaway: Animation|null=null;

    @property(Animation)
    girlwalkin: Animation|null=null;

}


