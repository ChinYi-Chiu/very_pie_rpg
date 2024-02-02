import { _decorator, Component, Node, JsonAsset,CCInteger,ProgressBar,Button } from 'cc';
import { TextShower } from "./TextShower";
const { ccclass, property } = _decorator;

interface DodgeEffect {
    animation1?: string;
    animation2?: string;
    speak?: string;
    opposite_effect?: string;
    damage?: number;
}

interface BlindEffect {
    speak?: string;
    damage?: number;
}

interface Skill {
    id: string;
    type: string;
    speak: string;
    animation: string;
    damage?: number;
    self_effect?: string;
    dodge?: DodgeEffect;
    blind?: BlindEffect;
}

interface SkillsData {
    playerSkill: Skill[];
    chiiSkill: Skill[];
}

@ccclass('BattleManager_test')
export class BattleManager_test extends Component {

    //修改血量
    @property(CCInteger)
    public ChiiHP = 3;
    @property(CCInteger)
    public TozyHP = 3;
  
    //血量條
    @property(ProgressBar)
    public ChiiHPBar: ProgressBar;
    @property(ProgressBar)
    public TozyHPBar: ProgressBar;
    
    //對話框
    @property(TextShower)
    public textShower: TextShower;
  
    //玩家按鈕
    @property(Button)
    public buttonDodge: Button;

    // JSON 劇情文本
    @property(JsonAsset)
    private jsonStory: JsonAsset | null = null;
    private role: SkillsData | null = null;

    //玩家狀態
    private isDodgeActive: boolean = false; // 玩家是否處於閃避狀態
    private currentTurn: number = 0; // 當前回合數

    start() {
        // 加載並解析 JSON 數據
        if (this.jsonStory) {
            this.role = this.jsonStory.json as SkillsData;
            console.log(this.role);
        }
        
        this.initBattle();

        // 設置按鈕監聽器
        this.buttonDodge.getComponent(Button).node.on('click', () => {
            this.playerChooseDodge(); // 處理玩家選擇閃避
            this.handleChiiAttack(); // 處理起哥的攻擊
            this.nextTurn(); // 移至下一回合
        }, this);
    }

    initBattle() {
        // 初始化戰鬥狀態，準備開始第一回合
        this.currentTurn = 1;
    }

    nextTurn() {
        // 處理每個回合的邏輯
        console.log(`當前回合: ${this.currentTurn}`);
        this.currentTurn++;

        // 檢查閃避狀態，如果上一回合使用了閃避，這回合結束後取消閃避狀態
        if (this.isDodgeActive) {
            this.isDodgeActive = false;
            console.log("閃避狀態結束");
        }

        // TODO: 在這裡根據遊戲邏輯添加更多回合處理，比如敵人行動、玩家行動等
    }

    // 玩家選擇閃避技能
    playerChooseDodge() {
        const dodgeSkill = this.role?.playerSkill.find(skill => skill.id === "Dodge");
        if (dodgeSkill) {
            this.isDodgeActive = true;  // 設置玩家進入閃避狀態
            console.log(dodgeSkill.speak);  // 顯示閃避技能的描述
            // (這裡可以調用顯示技能描述在對話框的功能)
            this.textShower.showText = dodgeSkill.speak;
            this.textShower.OnShowTextOneByOne();
            this.node.emit('playerDodgeSelected');  // 廣播玩家選擇閃避的事件
        }
    }

    // 起哥攻擊
    handleChiiAttack() {
        // 假設起哥隨機選擇一個攻擊技能
        const randomIndex = Math.floor(Math.random() * this.role?.chiiSkill.length);
        const chiiSkill = this.role?.chiiSkill[randomIndex];
    
        if (!chiiSkill) return; // 如果沒有找到技能，直接返回
    
        console.log(chiiSkill.speak); // 顯示起哥攻擊的描述
        this.node.emit('chiiAttack', chiiSkill.id);

        if (this.isDodgeActive && chiiSkill.dodge) {
            // 如果玩家處於閃避狀態，並且攻擊可以被閃避
            console.log(chiiSkill.dodge.speak); // 顯示玩家閃避成功的描述
            this.textShower.showText = chiiSkill.dodge.speak;
            this.textShower.OnShowTextOneByOne();
            this.node.emit('tozyDodge', chiiSkill.id);
        } else {
            this.updateHP(-chiiSkill.damage ?? 0, "Tozy");
            // 玩家沒有閃避，播放受到傷害的動畫
            //this.node.emit('tozyHurt', chiiSkill.id);
        }
    }

    // 更新血量的方法
    updateHP(amount: number, target: "Chii" | "Tozy") {
        if (target === "Tozy") {
            this.TozyHP = Math.max(0, this.TozyHP + amount);
            this.TozyHPBar.progress = this.TozyHP / 3;
        } else {
            this.ChiiHP = Math.max(0, this.ChiiHP + amount);
            this.ChiiHPBar.progress = this.ChiiHP / 3;
        }
    }

    update(deltaTime: number) {
        
    }
}


