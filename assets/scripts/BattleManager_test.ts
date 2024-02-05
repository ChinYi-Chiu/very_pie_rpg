import { _decorator, Component, JsonAsset, ProgressBar, Button, Animation } from "cc";
import { TextShower } from "./TextShower";
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
  dodgeButton: Button = null!; 

  //對話框
  @property(TextShower)
  public textShower: TextShower | null = null;

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
    this.roundStart();
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
    this.enableDodgeButton(true);
    //其他按鈕
  }

  enableDodgeButton(enable: boolean) {
    this.dodgeButton.interactable = enable;
    if (enable) {
      this.dodgeButton.node.on(Button.EventType.CLICK, this.onDodge, this);
    } else {
      this.dodgeButton.node.off(Button.EventType.CLICK, this.onDodge, this);
    }
  }

  // 玩家選擇閃避
  onDodge() {
    this.enableDodgeButton(false); // 禁用閃避按鈕
    const playerSkills = this.battleData.skills.player;
    const dodgeSkill = playerSkills.find((s) => s.id === "Dodge");
    console.log(`player uses ${dodgeSkill.id}`);
    this.isPlayerTurn = false;
    if (dodgeSkill) {
      this.applySkillEffect(dodgeSkill);
    }
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
      default:
        console.log("Chii is thinking...");
        return;
    }
    console.log(`Chii uses ${skill.id}`);
    this.applySkillEffect(skill);
  }

  applySkillEffect(skill: Skill) {
    this.displaySkillDescription(skill);
  
    const target = skill.target === "player" ? "Tozy" : "Chii";
    let targetStatusArray: Record<string, number>;
    if (skill.target === "player") {
      targetStatusArray = this.TozyCurrentStatus;
    } else {
      targetStatusArray = this.ChiiCurrentStatus;
    }
    const status = this.checkCharacterStatus(targetStatusArray);
    console.log(target +" "+ status);

    this.handleEffectDetail(skill, status, skill.target === "player" ? "Tozy" : "Chii");

    this.updateUI();

    this.checkEndGameOrNextRound();
  }

  //顯示技能描述
  displaySkillDescription(skill: Skill) {
    if (this.textShower && skill.description) {
        this.textShower.showText = skill.description;
        this.textShower.OnShowTextOneByOne();
    }
  }
  
  //檢查角色狀態
  checkCharacterStatus(TozyCurrentStatus: Record<string, any>): string {
    if (TozyCurrentStatus["dodge"]) return "dodge";
    if (TozyCurrentStatus["blind"]) return "blind";
    return "normal";
  }

  //處理技能效果
  handleEffectDetail(skill: Skill, status: string, target: string) {
    /* 起哥憤怒值
    if (effectDetail.effect) {
      if (effectDetail.effect === "rage_up" && target === "Chii") {
          this.ChiiCurrentRage = (this.ChiiCurrentRage || 0) + 1;
      }
    }*/
    this.animationContrller(skill, status);

    let effectsToApply = [];
    if (status !== "normal" && skill.effects[status]) {
      effectsToApply.push(skill.effects[status].effect_player);
      effectsToApply.push(skill.effects[status].effect_opponent);
    } else {
      effectsToApply.push(skill.effects.normal.effect_player);
      effectsToApply.push(skill.effects.normal.effect_opponent);
    }
    console.log(effectsToApply);

  // 應用所有效果
    effectsToApply.forEach(effectDetail => {
        if (effectDetail) {
          this.applyEffect(effectDetail, target);
        }
      });
    }

    applyEffect(effectDetail: EffectDetail, target: string) {
      if (effectDetail.damage != null) {
        console.log(effectDetail.damage);
        console.log(target);
        this.countDamage(effectDetail, target);
      }
    this.handleCharactetStatus(effectDetail, target);
  }

  // 動畫控制
  animationContrller(skill: Skill, status: string) {
    if(skill.effects[status].animation){
      console.log("play:" + skill.effects[status].animation);
      setTimeout(() => {
        this.node.emit(skill.effects[status].animation);
      }, 1 );
    } else {
      console.log("play:" + skill.effects[status].animations);
      setTimeout(() => {
        this.node.emit(skill.effects[status].animations);
      }, 1 );
    }
  }

  // 應用傷害
  countDamage(effectDetail: EffectDetail, target: string) {
    if (target === "Tozy") {
        this.TozyCurrentHP = Math.max(0, this.TozyCurrentHP - effectDetail.damage);
        console.log(`Tozy receives ${effectDetail.damage} damage.`);
    } else if (target === "Chii") {
        this.ChiiCurrentHP = Math.max(0, this.ChiiCurrentHP - effectDetail.damage);
        console.log(`Chii receives ${effectDetail.damage} damage.`);
    }
  }

  // 處理狀態
  handleCharactetStatus(effectDetail: EffectDetail, target: string) {
    let currentStatus = target === "Tozy" ? this.TozyCurrentStatus : this.ChiiCurrentStatus;

    if (effectDetail.status && effectDetail.duration) {
      if (currentStatus[effectDetail.status]) {
          currentStatus[effectDetail.status] = Math.max(currentStatus[effectDetail.status], effectDetail.duration);
      } else {
          currentStatus[effectDetail.status] = effectDetail.duration;
      }
    }
  }

  //更新狀態持續時間
  updateStatusDuration() {
    // 更新Tozy的狀態持續時間
    Object.keys(this.TozyCurrentStatus).forEach(status => {
        this.TozyCurrentStatus[status]--;
        if (this.TozyCurrentStatus[status] <= 0) {
            delete this.TozyCurrentStatus[status];
        }
    });

    // 更新Chii的狀態持續時間
    Object.keys(this.ChiiCurrentStatus).forEach(status => {
        this.ChiiCurrentStatus[status]--;
        if (this.ChiiCurrentStatus[status] <= 0) {
            delete this.ChiiCurrentStatus[status];
        }
    });
}

  // 檢查是否遊戲結束
  checkEndGameOrNextRound() {
    if (this.TozyCurrentHP <= 0 || this.ChiiCurrentHP <= 0) {
      const winner = this.TozyCurrentHP > 0 ? "Tozy wins!" : "Chii wins!";
      console.log(winner);
      // 可以在這裡調用遊戲結束的UI更新函式
    } else {
      // 遊戲未結束，進行下一回合
      this.roundStart();
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

  updateUI() {
    if (this.ChiiHPBar)
      this.ChiiHPBar.progress =
        this.ChiiCurrentHP / this.battleData.characters.Chii.HP;
    if (this.TozyHPBar)
      this.TozyHPBar.progress =
        this.TozyCurrentHP / this.battleData.characters.Tozy.HP;
    // 更新其他 UI 元素，如狀態顯示
  }
}
