import {
    _decorator,
    Component,
    JsonAsset,
    ProgressBar,
    Button,
    Label,
    Tween,
    Animation,
    Node,
  } from "cc";
  import { AudioController } from "./AudioController";
  import { TextShowerRandy } from "./TextShowerRandy";
  const { ccclass, property } = _decorator;
  
  interface EffectDetail {
    status?: string;
    duration?: number;
    damage?: number;
    animation?: string | string[];
    effect?: string;
  }
  
  interface Effect {
    effect_player?: EffectDetail;
    effect_opponent?: EffectDetail;
    description?: string;
    animation?: string;
  }
  
  interface Skill {
    id: string;
    target: string;
    type: string;
    description: string;
    effects: {
      normal: Effect;
      dodge?: Effect;
      blind?: Effect;
    };
  }
  
  interface CharacterState {
    HP: number;
    Rage?: number;
    statusEffects: { [key: string]: any };
  }
  
  interface BattleData {
    characters: {
      Tozy: CharacterState;
      Chii: CharacterState;
    };
    skills: {
      player: Skill[];
      opponent: Skill[];
    };
  }
  
  @ccclass("BattleManager")
  export class BattleManager extends Component {
    //角色資訊
    @property(JsonAsset)
    private fightSetting: JsonAsset | null = null;
  
    //血量條
    @property(ProgressBar)
    public ChiiHPBar: ProgressBar | null = null;
    @property(ProgressBar)
    public TozyHPBar: ProgressBar | null = null;
  
    // 玩家控制按鈕
    @property(Button)
    DodgeBtn: Button = null!;
    @property(Button)
    LogicBtn: Button = null!;
    @property(Button)
    ComboBtn: Button = null!;
    @property(Button)
    SorryBtn: Button = null!;
  
    //對話框
    @property(Label)
    public dialogContent: Label | null = null;
    @property(TextShowerRandy)
    private textShowerRandy: TextShowerRandy | null = null;
  
    //動畫
    @property(Animation)
    Fight_SceneTrans_Start: Animation | null = null;
    @property(AudioController)
    AudioController: AudioController | null = null;

    //設定
    @property(Button)
    private settingBtn: Button | null = null;
    @property(Node)
    private SettingPage: Node | null = null;

    private battleData: BattleData;
    private TozyCurrentHP: number = 0;
    private TozyCurrentStatus: Record<string, number> = {};
    private ChiiCurrentHP: number = 0;
    private ChiiCurrentStatus: Record<string, number> = {};
    private currentTurn: number = 0;
    private isPlayerTurn: boolean = true; // 初始設定為玩家回合

    start() {
      // 假設你已經將fight.json加載到fightSetting中
      this.battleData = this.fightSetting.json as BattleData;
      this.initializeBattle();
  
      // 播放轉場動畫
      this.Fight_SceneTrans_Start.play("Fight_SceneTrans_Start");
  
      // 監聽動畫完成事件
      this.Fight_SceneTrans_Start.on(
        Animation.EventType.FINISHED,
        () => {
          this.roundStart();
          this.SettingPage.active = false;
          this.settingBtn.node.on(Button.EventType.CLICK, this.openSettingMenu, this);
          this.DodgeBtn.node.on(Button.EventType.CLICK, this.onDodge, this);
          this.SorryBtn.node.on(Button.EventType.CLICK, this.onSorry, this);
          this.ComboBtn.node.on(Button.EventType.CLICK, this.onCombo, this);
          this.LogicBtn.node.on(Button.EventType.CLICK, this.onLogic, this);
        },  
        this
      );
    }

    openSettingMenu() {
      this.SettingPage.active = true;
    }

    initializeBattle() {
      const { Tozy, Chii } = this.battleData.characters;
      this.TozyCurrentHP = Tozy.HP;
      this.ChiiCurrentHP = Chii.HP;
      this.TozyCurrentStatus = Tozy.statusEffects;
      this.ChiiCurrentStatus = Chii.statusEffects;
      this.updateUI();
    }
  
    roundStart() {
      //玩家先手
      if (this.isPlayerTurn) {
        this.currentTurn++;
        console.log("Round " + this.currentTurn + " start.");
        this.updateStatusDuration();
        console.log("Player's turn.");
        this.playerTakesTurn();
      } else {
        console.log("opponet's turn.");
        this.opponentTakesTurn();
      }
    }
  
    // 玩家行動的邏輯...
    playerTakesTurn() {
      this.enableButton(this.DodgeBtn, true);
      this.enableButton(this.SorryBtn, true);
      this.enableButton(this.ComboBtn, false);
      this.enableButton(this.LogicBtn, true);
    }

    enableButton(button: Button, enable: boolean) {
      button.interactable = enable;
    }
    
    useSkill(skillId) {
      this.AudioController.play("Click");
      this.enableButton(this.DodgeBtn, false);
      this.enableButton(this.SorryBtn, false);
      this.enableButton(this.ComboBtn, false);
      this.enableButton(this.LogicBtn, false);
      
      const skill = this.battleData.skills.player.find((s) => s.id === skillId);
      console.log(`player uses ${skill.id}`);
      this.isPlayerTurn = false;
      if (skill) {
        this.applySkillEffect(skill);
      }
    }    

    onDodge() {
      this.useSkill("Dodge");
    }

    onSorry() {
      this.checkEndingC();
      this.useSkill("Sorry");
    }

    onCombo() {
      this.useSkill("Combo");
    }

    onLogic() {
      this.useSkill("Logic");
    }
  
    //先預設回合動作，以後會改
    opponentTakesTurn() {
      this.isPlayerTurn = true;
      const chiiSkills = this.battleData.skills.opponent;
      let skill: Skill;
      switch (this.currentTurn) {
        case 1:
          skill = chiiSkills.find((s) => s.id === "Pie")!;
          break;
        case 2:
          skill = chiiSkills.find((s) => s.id === "Sack")!;
          break;
        case 3:
          skill = chiiSkills.find((s) => s.id === "Chair")!;
          break;
        case 4:
          skill = chiiSkills.find((s) => s.id === "Pie")!;
          break;
        case 5:
          skill = chiiSkills.find((s) => s.id === "Pie")!;
          break;
        default:
          console.log("Chii is thinking...");
          return;
      }
      console.log(`Chii uses ${skill.id}`);
      this.applySkillEffect(skill);
    }
  
    applySkillEffect(skill: Skill) {
      this.displaySkillDescription(skill.description, null);
  
      this.textShowerRandy.node.once("textingEnd", () => {
        setTimeout(() => {
          const target = skill.target === "player" ? "Tozy" : "Chii";
          let targetStatusArray: Record<string, number>;
          if (skill.target === "player") {
            targetStatusArray = this.TozyCurrentStatus;
          } else {
            targetStatusArray = this.ChiiCurrentStatus;
          }
          const status = this.checkCharacterStatus(targetStatusArray);
          console.log(target + " " + status);
  
          this.handleEffectDetail(skill, status, target)
            .then(() => {
              //等待handleEffectDetail返回後再執行
              return this.updateUI();
            })
            .then(() => {
              // 等待updateUI動畫完成後再執行checkEndGameOrNextRound
              this.checkEndGameOrNextRound();
            });
        }, 500);
      });
    }
  
    //顯示技能描述
    displaySkillDescription(skillDescription: string, effectDescription: string) {
      this.dialogContent.string = skillDescription || effectDescription;
      this.textShowerRandy?.active(true);
    }
  
    //檢查角色狀態
    checkCharacterStatus(targetCurrentStatus: Record<string, any>): string {
      if (targetCurrentStatus["DecAttack"]) return "DecAttack";
      if (targetCurrentStatus["dodge"]) return "dodge";
      if (targetCurrentStatus["blind"]) return "blind";
      return "normal";
    }
  
    //處理技能效果
    async handleEffectDetail(
      skill: Skill,
      status: string,
      target: string
    ): Promise<void> {
      let effectsToApply = [];
      let effectDescription = ""; // 儲存效果描述的變數
  
      /*
      ...
      在這裡寫憤怒系統
      ...
      */
  
      this.animationController(skill, status);
  
      // 根據角色狀態選擇效果和描述
      if (status !== "normal" && skill.effects[status]) {
        effectsToApply.push(skill.effects[status].effect_player);
        effectsToApply.push(skill.effects[status].effect_opponent);
        effectDescription = skill.effects[status].description; // 獲取對應狀態的描述
      } else {
        effectsToApply.push(skill.effects.normal.effect_player);
        effectsToApply.push(skill.effects.normal.effect_opponent);
        effectDescription = skill.effects.normal.description; // 獲取普通狀態的描述
      }
  
      console.log(effectsToApply);
      console.log(effectDescription);
  
      // 在此處理所有效果
      for (const effectDetail of effectsToApply) {
        if (effectDetail) {
          this.applyEffect(effectDetail, target);
        }
      }
  
      // 顯示效果描述
      if (this.dialogContent && effectDescription) {
        this.displaySkillDescription("", effectDescription); // 如果displaySkillDescription不接受null，則传递空字符串
        await new Promise<void>((resolve) =>
          this.textShowerRandy.node.once("textingEnd", () => {
            setTimeout(resolve, 500); // 延遲500毫秒後解決Promise
          })
        );
      }
    }
  
    // 動畫控制
    animationController(skill: Skill, status: string) {
      const effect = skill.effects[status] || skill.effects.normal;
      if (effect.animation) {
        console.log("Emitting animation event:", effect.animation);
        this.node.emit(effect.animation);
      }
  
      // 檢查動畫數量
      if (effect.animations) {
        effect.animations.forEach((animationName: string) => {
          console.log("Emitting animation event:", animationName);
          this.node.emit(animationName);
        });
      }
    }
  
    applyEffect(effectDetail: EffectDetail, target: string) {
      if (effectDetail.damage != null && effectDetail.damage != 0) {
        console.log(effectDetail.damage);
        console.log(target);
        this.countDamage(effectDetail, target);
      }
      this.handleCharactetStatus(effectDetail, target);
    }
  
    // 應用傷害
    countDamage(effectDetail: EffectDetail, target: string) {
      if (target === "Tozy") {
        this.TozyCurrentHP = Math.max(
          0,
          this.TozyCurrentHP - effectDetail.damage
        );
        this.node.emit("Fight_TozyHurt");
        console.log(`Tozy receives ${effectDetail.damage} damage.`);
      } else if (target === "Chii") {
        this.ChiiCurrentHP = Math.max(
          0,
          this.ChiiCurrentHP - effectDetail.damage
        );
        console.log(`Chii receives ${effectDetail.damage} damage.`);
      }
    }
  
    // 處理狀態
    handleCharactetStatus(effectDetail: EffectDetail, target: string) {
      let currentStatus =
        target === "Tozy" ? this.TozyCurrentStatus : this.ChiiCurrentStatus;
  
      if (effectDetail.status && effectDetail.duration) {
        if (currentStatus[effectDetail.status]) {
          currentStatus[effectDetail.status] = Math.max(
            currentStatus[effectDetail.status],
            effectDetail.duration
          );
        } else {
          currentStatus[effectDetail.status] = effectDetail.duration;
        }
      }
    }
  
    //更新狀態持續時間
    updateStatusDuration() {
      // 更新Tozy的狀態持續時間
      Object.keys(this.TozyCurrentStatus).forEach((status) => {
        this.TozyCurrentStatus[status]--;
        if (this.TozyCurrentStatus[status] <= 0) {
          delete this.TozyCurrentStatus[status];
        }
      });
  
      // 更新Chii的狀態持續時間
      Object.keys(this.ChiiCurrentStatus).forEach((status) => {
        this.ChiiCurrentStatus[status]--;
        if (this.ChiiCurrentStatus[status] <= 0) {
          delete this.ChiiCurrentStatus[status];
        }
      });
    }
  
    // 檢查是否遊戲結束
    checkEndGameOrNextRound() {
      if (this.TozyCurrentHP <= 0) {
        this.node.emit("Fight_SceneTrans_EndingA");
        // 可以在這裡調用遊戲結束的UI更新函式
      } else if (this.ChiiCurrentHP <= 0) {
        this.node.emit("Fight_SceneTrans_EndingB");
      } else {
        // 遊戲未結束，進行下一回合
        this.roundStart();
      }
    }

    checkEndingC() {
      const randomNumber = Math.random();
      if (randomNumber < 0.01) {
        this.node.emit("Fight_SceneTrans_EndingC");
      }
    }
  
    playerWins() {
      // 玩家勝利的處理，例如顯示勝利信息
      // ...
    }
  
    opponentWins() {
      // 對手勝利的處理，例如顯示失敗信息
      // ...
    }
  
    async updateUI(): Promise<void> {
      let promises = [];
  
      promises.push(
        new Promise<void>((resolve) => {
          new Tween(this.ChiiHPBar)
            .to(1, {
              progress: this.ChiiCurrentHP / this.battleData.characters.Chii.HP,
            })
            .call(resolve) // 當Tween完成時，調用resolve
            .start();
        })
      );
  
      promises.push(
        new Promise<void>((resolve) => {
          new Tween(this.TozyHPBar)
            .to(1, {
              progress: this.TozyCurrentHP / this.battleData.characters.Tozy.HP,
            })
            .call(resolve) // 當Tween完成時，調用resolve
            .start();
        })
      );
  
      await Promise.all(promises);
    }
  }