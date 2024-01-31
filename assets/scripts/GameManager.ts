import { _decorator, Component, error, EventMouse, input, Input, JsonAsset, Label, Node, TextAsset, Tween, tween, Vec3 } from 'cc';
import { TextShowerRandy } from './TextShowerRandy';
const { ccclass, property } = _decorator;

enum StoryState {
    SS_SITUATION,
    SS_OPTION,
    SS_SPEAKING,
    SS_SPEAKING_END,
    SS_CHECK_CHII,
    SS_FIGHTING
}

/**
 * 文本結構
 * ! 注意，所有值為必填。
 */
interface IStory {
    scene: ({ events: Ievents[] } | IScene)[]
}
interface IScene {//場景， queue 讀取。
    situation: string, //場景旁白
    options: { //選項以及狀態，長度必須是三或二(三個或兩個選項)
        role: string, //哪個角色
        chiiFire: "down" | "keep" | "up", //起哥發火進度
        option: string, //選項的文字
        speak: string, //講的話的文字
    }[]
    chii: string, //起哥狀態(旁白)
}

interface Ievents {
    id: string, //動畫名稱
    speak?: string, //講的話
    aniDelay?: number //延遲時間
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
    private nextPageHint: Node | null = null;

    @property(TextShowerRandy)
    private textShowerRandy: TextShowerRandy | null = null;

    updateState(newState: StoryState) {
        this.currentState = newState;
        console.log('State changed to:', StoryState[this.currentState]);
        this.updateUI()
    }

    updateUI() {
        if (this.story.scene.length == 0) {
            this.listenMouse(false);
            this.optionShow(false);
            this.dialogContent.string = "進入戰鬥場景!!!"
            this.currentState = StoryState.SS_FIGHTING;
        }

        let scene: { events: Ievents[] } | IScene = this.story.scene[0];

        // 如果 story 下一個讀出來是 event ，那就進入 event 處理邏輯。
        if ("events" in scene) {
            //! speak 跟 delay 還沒做
            this.listenMouse(false); // 關閉滑鼠事件
            this.story.scene.shift(); // 把 event 退出來    
            while (scene.events.length > 0) {
                let customEvent = scene.events.shift();
                console.log("play:" + customEvent.id);

                // 講話
                if (customEvent.speak) {
                    this.dialogContent.string = customEvent.speak;
                    this.textShowerRandy?.active(true);
                }

                // 動畫及延遲
                setTimeout(() => {
                    this.node.emit(customEvent.id); // 告訴所有人要播哪個動畫
                }, customEvent.aniDelay ?? 0);
            }
            return
        }

        // 處理 option 沒有或 speak 沒有的問題
        if (!scene.options[0].option) {
            scene.options[0].option = scene.options[0].speak
            scene.options[1].option = scene.options[1].speak
            if (scene.options[2]) scene.options[2].option = scene.options[2].speak
        }
        if (!scene.options[0].speak) {
            scene.options[0].speak = scene.options[0].option
            scene.options[1].speak = scene.options[1].option
            if (scene.options[2]) scene.options[2].speak = scene.options[2].option
        }

        switch (this.currentState) {
            case StoryState.SS_SITUATION:
                this.listenMouse(true);
                this.optionShow(false);
                this.dialogContent.string = scene.situation;
                this.toggleNextPageHint(true);
                // this.roleSpeaking(false);
                break;
            case StoryState.SS_OPTION:

                this.toggleNextPageHint(false);
                this.listenMouse(false);
                this.optionShow(true);
                this.dialogContent.node.active = false;

                this.option1Button.getComponentInChildren(Label).string = scene.options[0].role + ": " + scene.options[0].option;
                this.option2Button.getComponentInChildren(Label).string = scene.options[1].role + ": " + scene.options[1].option;
                scene.options[2] ? this.option3Button.getComponentInChildren(Label).string = scene.options[2].role + ": " + scene.options[2].option : this.option3Button.active = false;

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
                this.optionShow(false);
                this.dialogContent.node.active = true;
                this.textShowerRandy?.unscheduleAllCallbacks();
                this.dialogContent.string = scene.options[this.currentChoseOption].speak;
                this.roleSpeaking(false, this._choseRole(scene.options[this.currentChoseOption].role));
                this.toggleNextPageHint(true);
                break;
            case StoryState.SS_CHECK_CHII:
                this.toggleNextPageHint(false);
                this.dialogContent.node.active = true;
                this.dialogContent.string = scene.chii;
                this.story.scene.shift();
                // this.roleSpeaking(true, this.chii);
                this.updateState(StoryState.SS_SITUATION);
                break;
        }
    }

    start() {
        // 監聽打字打完沒
        // this.textShowerRandy?.node.on('textingEnd', this.textingEnd, this);

        // 載入文本物件
        if (this.jsonStory) this.story = this.jsonStory.json as IStory;
        // 從第一個場景開始
        this.updateState(StoryState.SS_SITUATION);
    }


    update(deltaTime: number) {
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
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
    roleSpeaking(speaking: boolean, role: Node) {
        if (!speaking) return Tween.stopAllByTarget(role);
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
    }

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



