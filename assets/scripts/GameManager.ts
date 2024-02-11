import { _decorator, animation, Animation, AnimationClip, Component, error, EventMouse, input, Input, JsonAsset, Label, Node, TextAsset, Tween, tween, Vec3 } from 'cc';
import { TextShowerRandy } from './TextShowerRandy';
import { AudioController } from "./AudioController";
const { ccclass, property } = _decorator;

enum StoryState {
    SS_SITUATION,
    SS_OPTION,
    SS_SPEAKING,
    SS_SPEAKING_END,
    SS_CHECK_CHII,
    SS_FIGHTING,
    SS_DIALOG, // dialog 專用的狀態
    SS_DIALOGING, // dialog 專用的狀態
    SS_DIALOG_END, // dialog 專用的狀態
    SS_POP,
    SS_POP_END,
}

/**
 * 文本結構
 * @description 
 * 後面有 ? 的為選填項，除了選填項其他請務必一定要填入值
 */
interface IStory {
    scenes: (IScene | ISituation_Pop | IEvent | IDialog )[]
}
interface IScene { //場景
    type: "scene",
    situation?: string, //場景旁白
    options: { //選項以及狀態，長度必須是三或二(三個或兩個選項)
        role: string, //哪個角色
        chiiFire: "down" | "keep" | "up", //起哥發火進度
        option: string, //選項的文字
        speak?: string, //講的話的文字
    }[]
}
interface ISituation_Pop{
    type: "pop",
    situation: string
}
interface IEvent { //事件(動畫)
    type: "event",
    id: string, //動畫名稱
    speak?: string, //講的話
    aniDelay?: number //延遲時間
}
interface IDialog { //對話
    type: "dialog",
    dialogs: {
        role: string, //說話的角色
        speak: string, //說的話
    }[]
} 

@ccclass('GameManager')
export class GameManager extends Component {
    // 狀態機
    private currentState: StoryState;
    private currentChoseOption: 0 | 1 | 2;

    // 三個選項按鈕組
    @property(Node)
    public option1Button: Node | null = null;
    @property(Node)
    public option2Button: Node | null = null;
    @property(Node)
    public option3Button: Node | null = null;
    @property(Node)
    public choseArrow: Node | null = null;

    // 對話 label
    @property(Label)
    public dialogContent: Label | null = null;

    // JSON 劇情文本
    @property(JsonAsset)
    private jsonStory: JsonAsset | null = null;
    private story: IStory | null = null;

    //角色
    @property(Node)
    private tozy: Node | null = null;
    @property(Node)
    private anan: Node | null = null;
    @property(Node)
    private chii: Node | null = null;
    @property(Node)
    private none: Node | null = null;

    // 下一頁提示(拳頭)
    @property(Node)
    private nextPageHint: Node | null = null;

    // 遮罩
    @property(Node)
    private speakingMask: Node | null = null;
    @property(Node)
    private situationMask: Node | null = null;
    @property(Node)
    private sceneTransMask: Node | null = null;

    // 情境大字
    @property(Node)
    private situationLabel: Node | null = null;

    @property(TextShowerRandy)
    private textShowerRandy: TextShowerRandy | null = null;

    @property(AudioController)
    AudioController: AudioController|null=null;

    updateState(newState: StoryState) {
        this.currentState = newState;
        console.log('State changed to:', StoryState[this.currentState]);
        if (newState == StoryState.SS_DIALOG || newState == StoryState.SS_DIALOG_END || newState == StoryState.SS_DIALOGING) return;
        this.updateUI()
    }

    updateUI() {
        // 如果沒有 scene 了，那就代表所有 rpg 都走完了，切換到戰鬥場面。
        /*if (this.story.scenes.length == 0) {
            this.listenMouse(false);
            this.optionShow(false);
            this.dialogContent.string = "進入戰鬥場景!!!"
            this.currentState = StoryState.SS_FIGHTING;
        }*/

        let scene: IScene | ISituation_Pop | IEvent | IDialog = this.story.scenes[0];
        // event 邏輯
        if (scene.type == "event") {
            this.listenMouse(false); // 關閉滑鼠事件
            this.story.scenes.shift(); // 把 event 退出來   
            const cEvent = scene; // 修正 scene 有可能被取代成別的型別的問題
            console.log("play:" + cEvent.id);

            // 講話
            if (cEvent.speak) {
                this.dialogContent.string = cEvent.speak;
                this.textShowerRandy?.active(true);
            }

            // 動畫及延遲
            setTimeout(() => {
                this.node.emit(cEvent.id); // 告訴所有人要播哪個動畫
            }, cEvent.aniDelay ?? 0);
        }

        // dialog 邏輯
        else if (scene.type == "dialog") {
            this.story.scenes.shift(); // 把 dialog 退出來 
            this.updateState(StoryState.SS_DIALOG); // 切換到 dialog 專用的狀態
            this.listenMouse(true); // 開啟滑鼠事件
            this._dialogs = scene; // 把 dialogs 存起來
            this.readDialogs(); // recursive 讀取 dialog
        }

        // situation_pop 邏輯
        else if(scene.type == "pop"){
            if(this.currentState==StoryState.SS_POP_END){
                this.story.scenes.shift(); // 把 situation_pop 退出來
                this.situationLabel.active = false;
                this.situationMask.active = false;
                this.toggleNextPageHint(false);
                this.updateState(StoryState.SS_SITUATION);
            }else if(this.currentState!=StoryState.SS_POP){
                this.listenMouse(false);
                this.optionShow(false);
                // this.dialogContent.string = scene.situation;
                // this.roleSpeaking(false);
                this.situationMask.active = true;
                this.situationLabel.active = true;
                this.situationLabel.getComponent(Label).string = scene.situation;
                this.situationLabel.getComponent(Animation).play("Word_Pop");
                setTimeout(() => {
                    this.toggleNextPageHint(true);
                    this.listenMouse(true);
                }, this.situationLabel.getComponent(Animation).getState("Word_Pop").duration * 1000);
                this.updateState(StoryState.SS_POP);
            }
        }

        // scene 邏輯
        else {
            // 處理 option 沒有或 speak 沒有的問題
            if (!scene.options[0].speak) {
                scene.options[0].speak = scene.options[0].option
                scene.options[1].speak = scene.options[1].option
                if (scene.options[2]) scene.options[2].speak = scene.options[2].option
            }

            switch (this.currentState) {
                case StoryState.SS_SITUATION:
                    if (scene.situation=="") {
                        this.updateState(StoryState.SS_OPTION);
                    }else{
                        this.optionShow(false);
                        // this.dialogContent.string = scene.situation;
                        // this.roleSpeaking(false);
                        this.situationMask.active = true;
                        this.situationLabel.active = true;
                        this.situationLabel.getComponent(Label).string = scene.situation;
                        this.situationLabel.getComponent(Animation).play("Word_Pop");
                        setTimeout(() => {
                            this.toggleNextPageHint(true);
                            this.listenMouse(true);
                        }, this.situationLabel.getComponent(Animation).getState("Word_Pop").duration * 1000);
                    }
                    break;
                case StoryState.SS_OPTION:
                    this.situationLabel.active = false;
                    this.situationMask.active = false;
                    this.toggleNextPageHint(false);
                    this.listenMouse(false);
                    this.optionShow(true);
                    this.dialogContent.node.active = false;
                    this.option1Button.getComponentInChildren(Label).string = scene.options[0].role + ": " + scene.options[0].option;
                    this.option2Button.getComponentInChildren(Label).string = scene.options[1].role + ": " + scene.options[1].option;
                    scene.options[2] ? this.option3Button.getComponentInChildren(Label).string = scene.options[2].role + ": " + scene.options[2].option : this.option3Button.active = false;
                    //this.roleSpeaking(true,this._choseRole(scene.options[this.currentChoseOption].role));
                    break;
                case StoryState.SS_SPEAKING:
                    setTimeout(() => {
                        this.listenMouse(true);
                    }, 500);
                    this.choseArrow.active = false;
                    this.optionShow(false);
                    this.dialogContent.string = scene.options[this.currentChoseOption].speak;
                    this.textShowerRandy?.active(true);
                    this.roleSpeaking(true, this._choseRole(scene.options[this.currentChoseOption].role));
                    break;
                case StoryState.SS_SPEAKING_END:
                    this.toggleNextPageHint(true);
                    this.optionShow(false);
                    this.dialogContent.node.active = true;
                    this.textShowerRandy?.unscheduleAllCallbacks();
                    this.dialogContent.string = scene.options[this.currentChoseOption].speak;
                    this.roleSpeaking(false, this._choseRole(scene.options[this.currentChoseOption].role));
                    break;
                case StoryState.SS_CHECK_CHII:
                    this.toggleNextPageHint(false);
                    this.story.scenes.shift();
                    // this.roleSpeaking(true, this.chii);
                    this.updateState(StoryState.SS_SITUATION);
                    break;
            }
        }
    }

    start() {
        this.speakingMask.active = false;
        this.optionShow(false);
        // 監聽打字打完沒
        // this.textShowerRandy?.node.on('textingEnd', this.textingEnd, this);

        // 載入文本物件
        if (this.jsonStory) this.story = this.jsonStory.json as IStory;
        // 從第一個場景開始
        this.updateState(StoryState.SS_SITUATION);
    }

    private _dialogs: IDialog | null = null // 暫存要播的對話
    private readDialogs() {
        if (!this._dialogs) return; // 沒有對話就返回

        if (this.currentState == StoryState.SS_DIALOG) {//對話還沒開始播 = 播對話
            if (this._dialogs.dialogs.length == 0) { // 檢查還有沒有
                this._dialogs = null;
                this.updateState(StoryState.SS_SITUATION); // 繼續下個狀態
                return;
            }
            this.toggleNextPageHint(false);
            this.dialogContent.string = this._dialogs.dialogs[0].speak;
            this.textShowerRandy?.active(true);
            this.roleSpeaking(true, this._choseRole(this._dialogs.dialogs[0].role));
            this.updateState(StoryState.SS_DIALOGING);
        } else if (this.currentState == StoryState.SS_DIALOGING) {// 對話播到一半 = 強制播完
            this.dialogContent.string = this._dialogs.dialogs[0].speak;
            this.textShowerRandy?.unscheduleAllCallbacks();
            this.updateState(StoryState.SS_DIALOG_END);
            this.readDialogs()
        } else {// 對話播完
            // 檢查還有沒有
            this.roleSpeaking(false, this._choseRole(this._dialogs.dialogs[0].role));
            this._dialogs.dialogs.shift();
            this.toggleNextPageHint(true);
            this.updateState(StoryState.SS_DIALOG);
        }
    }


    update(deltaTime: number) {
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.AudioController.play("Click");
            if (this.currentState == StoryState.SS_SITUATION) {
                return this.updateState(StoryState.SS_OPTION);
            }
            // 說話場景中，假設使用者點左鍵了，就強制說話結束。
            if (this.currentState == StoryState.SS_SPEAKING) {
                return this.updateState(StoryState.SS_SPEAKING_END);
            }
            if (this.currentState == StoryState.SS_SPEAKING_END) {
                return this.updateState(StoryState.SS_CHECK_CHII)
            }
            if (this.currentState == StoryState.SS_CHECK_CHII) {
                return this.updateState(StoryState.SS_SITUATION)
            }
            if (this.currentState == StoryState.SS_DIALOG || this.currentState == StoryState.SS_DIALOGING || this.currentState == StoryState.SS_DIALOG_END) {
                return this.readDialogs();
            }
            if (this.currentState == StoryState.SS_POP) {
                return this.updateState(StoryState.SS_POP_END);
            }
        }
    }

    /**
     * 控制顯示選項與否
     * @param e true 顯示， false 隱藏。
     */
    private optionShow(e: boolean) {
        this.option1Button.active = e
        this.option2Button.active = e
        this.option3Button.active = e
    }

    private listenMouse(e: boolean) {
        if (e) return input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    /**
     * 選項被按下
     * @param e 選項幾
     */
    onOptionClicked(event: any, clickedOption: string) {
        let n = parseInt(clickedOption);
        if (isNaN(n) || n > 2 || n < 0) return error("This is an invalid parameter of GameManager.onOptionClicked");
        this.currentChoseOption = n as 0 | 1 | 2;
        this.updateState(StoryState.SS_SPEAKING);
    }


    
    /**
     * 當角色在講話時要做的事
     * @param role 傳入角色
     * @param speaking 傳入是否有在講話
     */
    roleSpeaking(speaking: boolean, role: Node | null) {
        if (role == null) return;
        if (!speaking) {
            this.speakingMask.active = false;
            role.setSiblingIndex(this.speakingMask.getSiblingIndex() - 1);
            console.log(role.getSiblingIndex());
            return Tween.stopAllByTarget(role);
        }
        this.speakingMask.active = true;
        role.setSiblingIndex(this.speakingMask.getSiblingIndex());
        let t = tween(role)
            // .target(role)
            .to(0.1, {
                position: new Vec3(role.position.x, role.position.y + 5, role.position.z)
            })
            .to(0.1, {
                position: new Vec3(role.position.x, role.position.y - 5, role.position.z)
            })
            .start()

        // 重複搖，搖到死，搖到他媽變單親媽媽。
        tween(role).repeat(Number.MAX_VALUE, t).start();
        console.log(role.getSiblingIndex());
    }

    /**
     * 當角色在選擇時的表現
     * @param state 選擇狀態(是否選擇完畢)
     * @param role 傳入角色
     */
    /*roleChoosing(state: boolean,role: Node | null) {
        if (role == null) return;
        if (!state) {
            this.speakingMask.active = false;
            role.setSiblingIndex(this.speakingMask.getSiblingIndex() - 1);
            return Tween.stopAllByTarget(role);
        }
        this.speakingMask.active = true;
        role.setSiblingIndex(this.speakingMask.getSiblingIndex());
        let t = tween(role)
             .target(role)
            .to(0.1, {
                position: new Vec3(role.position.x, role.position.y + 5, role.position.z)
            })
            .to(0.1, {
                position: new Vec3(role.position.x, role.position.y - 5, role.position.z)
            })
            .start()

        // 重複搖，搖到死，搖到他媽變單親媽媽。
        tween(role).repeat(Number.MAX_VALUE, t).start();
    }*/

    private _choseRole(role: string): Node {
        switch (role) {
            case "tozy":
                return this.tozy;
                break;
            case "anan":
                return this.anan;
                break;
            case "chii":
                return this.chii;
                break;
            case "none":
                return this.none;
                break;
        }
        return this.node;
    }

    /**
     * 顯示點擊下一頁提示。
     * @param e 是否顯示
     */
    toggleNextPageHint(e: boolean) {
        let n = this.nextPageHint;
        n.active = e;
        if (e) {
            let t = tween(n)
                .to(0.25, {
                    position: new Vec3(n.position.x, n.position.y + 5, n.position.z)
                })
                .to(0.25, {
                    position: new Vec3(n.position.x, n.position.y - 5, n.position.z)
                })
                .start()

            // 重複搖，搖到死，搖到他媽變單親媽媽。
            tween(n).repeat(Number.MAX_VALUE, t).start();
        } else {
            Tween.stopAllByTarget(n);
        }
    }
}



