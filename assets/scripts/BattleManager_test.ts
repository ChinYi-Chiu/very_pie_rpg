import { _decorator, Component, JsonAsset, ProgressBar, Button } from "cc";
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
  @property(JsonAsset)
  private fightSetting: JsonAsset | null = null;

  @property(ProgressBar)
  public ChiiHPBar: ProgressBar | null = null;

  @property(ProgressBar)
  public TozyHPBar: ProgressBar | null = null;

  @property(TextShower)
  public textShower: TextShower | null = null;

  @property(Button)
  dodgeButton: Button = null!; // 玩家閃避按鈕

  private battleData: BattleData;
  private TozyCurrentHP: number = 0;
  private TozyCurrentStatus: string[] = [];
  private ChiiCurrentHP: number = 0;
  private ChiiCurrentStatus: string[] = [];
  private currentTurn: number = 0;

  start() {
    // 假設你已經將fight.json加載到fightSetting中
    this.battleData = this.fightSetting.json as BattleData;
    this.initializeBattle();
    this.roundStart();
  }

  initializeBattle() {
    const { Tozy, Chii } = this.battleData.characters;
    this.TozyCurrentHP = Tozy.HP;
    this.TozyCurrentStatus = Object.keys(Tozy.statusEffects);
    this.ChiiCurrentHP = Chii.HP;
    this.ChiiCurrentStatus = Object.keys(Chii.statusEffects);
    this.updateUI();
  }

  roundStart() {
    console.log("Round " + this.currentTurn + " start.");
    //玩家先手
    this.playerTakesTurn();
  }

  playerTakesTurn() {
    // 啟用閃避按鈕
    this.enableDodgeButton(true);
    // 玩家行動的邏輯...
  }

  enableDodgeButton(enable: boolean) {
    if (enable) {
      this.dodgeButton.node.on(Button.EventType.CLICK, this.onDodge, this);
    } else {
      this.dodgeButton.node.off(Button.EventType.CLICK, this.onDodge, this);
    }
  }

  onDodge() {
    // 玩家選擇閃避
    this.enableDodgeButton(false); // 禁用閃避按鈕，避免重複點擊
    const playerSkills = this.battleData.skills.player;
    const dodgeSkill = playerSkills.find((s) => s.id === "Dodge");
    if (dodgeSkill) {
      this.applySkillEffect(dodgeSkill);
    }
    this.nextTurn();
  }

  applySkillEffect(skill: Skill) {
    // 處理技能效果...
    this.updateUI();
  }

  nextTurn() {
    this.checkEndGameOrNextRound();
  }

  checkEndGameOrNextRound() {
    if (this.isGameOver()) {
      if (this.ChiiCurrentHP <= 0) {
        this.playerWins();
      } else {
        this.opponentWins();
      }
    } else {
      this.currentTurn++;
      this.opponentTakesTurn();
    }
  }

  opponentTakesTurn() {
    // 對手行動...
    this.checkEndGameOrNextRound();
  }

  checkSkillStatus(character: "player" | "opponent") {
    // 這裡加入檢查技能狀態的邏輯
    // ...
  }

  countDamage(character: "player" | "opponent") {
    // 這裡加入計算傷害的邏輯
    // ...
  }

  isGameOver(): boolean {
    // 根據角色的HP判斷遊戲是否結束
    return this.TozyCurrentHP <= 0 || this.ChiiCurrentHP <= 0;
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
    // 更新UI，例如血條
    if (this.ChiiHPBar)
      this.ChiiHPBar.progress =
        this.ChiiCurrentHP / this.battleData.characters.Chii.HP;
    if (this.TozyHPBar)
      this.TozyHPBar.progress =
        this.TozyCurrentHP / this.battleData.characters.Tozy.HP;
    // 更新其他 UI 元素，如狀態顯示
  }
}
