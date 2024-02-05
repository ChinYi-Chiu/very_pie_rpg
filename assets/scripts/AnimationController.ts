import { _decorator, Animation, AnimationClip, JsonAsset, Component, Event, Node, director } from 'cc';
import { GameManager } from './GameManager';
import { AudioController } from './AudioController';
import { BattleManager } from './BattleManager_test';
const { ccclass, property } = _decorator;


/**
 * 動畫類型結構
 * @description 
 * 後面有 ? 的為選填項，除了選填項其他請務必一定要填入值
 */
interface IAnimation {
    animate_storage: (INormal | IFood | ITrans )[]
}
interface INormal { //事件(動畫)
    type: "normal",
    node_id: string,//animationcontroller中的property
    controller_id: string, 
    animation_id?:string,
    ringtone_id?: string 
}
interface IFood { //事件(動畫)
    type: "food",
    node_id: string,
    controller_id: string, 
    animation_id?:string,
    ringtone_id?: string
}

interface ITrans { //事件(動畫)
    type: "trans",
    node_id: string,
    controller_id: string, 
    animation_id?:string,
    ringtone_id?: string,
    trans_scene: string
}

@ccclass('AnimationController')
export class AnimationController extends Component {

    // JSON 動畫文本
    @property(JsonAsset)
    private jsonAnimate: JsonAsset | null = null;
    private animate: IAnimation | null = null;

    start() {
    
        if (this.jsonAnimate) this.animate = this.jsonAnimate.json as IAnimation;

        const animation_count=this.animate.animate_storage.length;
        console.log("動畫事件數量:",animation_count);
        console.log("所有動畫類型",this.animate.animate_storage);
        for (let counter = 0; counter < animation_count; counter++) {
            let animate_storage = this.animate.animate_storage[counter];
            let l_type="";
            let l_node_id="";
            let l_controller_id="";
            let l_animation_id="";
            let l_ringtone_id="";
            let l_trans_scene="";
            l_type = animate_storage.type;
            l_node_id = animate_storage.node_id;
            l_controller_id = animate_storage.controller_id;
            
            if (animate_storage.animation_id) {
                l_animation_id = animate_storage.animation_id;
            } else {
                l_animation_id = l_controller_id;
            }
        
            if (animate_storage.ringtone_id) {
                l_ringtone_id = animate_storage.ringtone_id;
            } else {
                l_ringtone_id = l_controller_id;
            }
            if (l_type === "trans") {
                if ((animate_storage as ITrans).trans_scene) {
                    l_trans_scene = (animate_storage as ITrans).trans_scene;
                    console.log("建置場景轉換動畫事件監聽器：",l_node_id," 用於轉換至：",l_trans_scene);
                }
            }else{
                console.log("建置動畫事件監聽器：",l_node_id);
            }
        
            if (l_type === "normal") {
                this.gameManager?.node.on(l_controller_id, (ev: Event) => {
                    this[l_node_id]?.play(l_animation_id); //播動畫
                    this.audioController?.play(l_ringtone_id); //播音樂
                    setTimeout(() => {
                        this.audioController?.stop(l_ringtone_id); //音樂停
                        this.gameManager?.updateUI(); // 播完動畫，進入下一個場景
                    }, this[l_node_id]?.getState(l_animation_id)?.duration * 1000 || 0);
                }, this);
            } else if (l_type === "trans") {
                this.gameManager?.node.on(l_controller_id, (ev: Event) => {
                    this[l_node_id]?.play(l_animation_id); //播動畫
                    this.audioController?.play(l_ringtone_id); //播音樂
                    setTimeout(() => {
                        this.audioController?.stop(l_ringtone_id); //音樂停
                        //this.gameManager?.updateUI(); // 播完動畫，進入下一個場景
                        director.loadScene(l_trans_scene); //轉換到戰鬥場景
                        console.log("轉換場景：",l_trans_scene);
                    }, this[l_node_id]?.getState(l_animation_id)?.duration * 1000 || 0);
                }, this);
            }
        }

        this.battleManager_test?.node.on('Fight_Dodge', (ev: Event) => {
            this.Fight_TozyDodge.play("Fight_Dodge"); //播動畫
            setTimeout(() => { //等動畫播完後做其他事

            }, this.Fight_TozyDodge.getState("Fight_Dodge").duration * 1000);
        }, this);

        this.battleManager_test?.node.on('Fight_ChiiFist', (ev: Event) => {
            this.Fight_ChiiFist.play("Fight_ChiiFist"); //播動畫
            setTimeout(() => { //等動畫播完後做其他事

            }, this.Fight_ChiiFist.getState("Fight_ChiiFist").duration * 1000);
        }, this);

        this.battleManager_test?.node.on('Fight_Sack', (ev: Event) => {
            this.Fight_ChiiSack.play("Fight_Sack"); //播動畫
            setTimeout(() => { //等動畫播完後做其他事

            }, this.Fight_ChiiSack.getState("Fight_Sack").duration * 1000);
        }, this);

        this.battleManager_test?.node.on('Fight_ChiiChair', (ev: Event) => {
            this.Fight_ChiiChair.play("Fight_ChiiChair"); //播動畫
            setTimeout(() => { //等動畫播完後做其他事

            }, this.Fight_ChiiChair.getState("Fight_ChiiChair").duration * 1000);
        }, this);


        
    }

    update(deltaTime: number) {

    }
 
    //手動增加node
    @property(GameManager)
    gameManager: GameManager | null = null;

    @property(BattleManager)
    battleManager_test: BattleManager | null = null;

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

    @property(Animation)
    end: Animation|null=null;

    @property(Animation)
    Fight_SceneTrans_Start: Animation|null=null;

    @property(Animation)
    Fight_TozyDodge: Animation | null = null;

    @property(Animation)
    Fight_ChiiFist: Animation|null=null;

    @property(Animation)
    Fight_Dodge: Animation|null=null;

    @property(Animation)
    Fight_ChiiSack: Animation|null=null;

    @property(Animation)
    Fight_ChiiChair: Animation|null=null;

    @property(Animation)
    Fight_SceneTrans_End: Animation|null=null;
    
    @property(Animation)
    Back_Ground: Animation|null=null;

    @property(Animation)
    chii_angry: Animation|null=null;

    @property(Animation)
    chii_up: Animation|null=null;

    @property(Animation)
    chii_fright: Animation|null=null;

    @property(Animation)
    stare: Animation|null=null;

    @property(Animation)
    rice: Animation|null=null;

    @property(Animation)
    egg: Animation|null=null;

    @property(Animation)
    fish: Animation|null=null;

    @property(Animation)
    sushi: Animation|null=null;

    @property(Animation)
    shrimp: Animation|null=null;

    @property(Animation)
    X: Animation|null=null;
}


