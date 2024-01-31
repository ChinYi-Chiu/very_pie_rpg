import { _decorator, CCInteger, Component, Node, ProgressBar, Tween, tween, Vec2, Vec3, Animation, find } from 'cc';
import { TextShower } from './TextShower';
const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    //TODO: 
    /*
"結局A
戰鬥過程
選鬼之閃避
超派鐵拳
選鬼之閃避
蓋布袋
致盲
椅子砸椅子"

"結局A
戰鬥結束
toyz 背對衣服掀起
超派勝利往前指喊超派
黑幕
超哥接受記者訪問:我的師父都是有2 30年經驗的日料師傅，做出來的東西怎麼可能難吃(料理鼠王的畫面慢慢浮出)"

    */
    @property(CCInteger)
    public ChiiHP = 3;
    @property(CCInteger)
    public TozyHP = 3;

    @property(ProgressBar)
    public ChiiHPBar: ProgressBar;
    @property(ProgressBar)
    public TozyHPBar: ProgressBar;

    @property(TextShower)
    public textShower: TextShower;

    @property(Node)
    public Hand: Node;

    @property(Node)
    public Chair: Node;

    @property(Node)
    public Black: Node;

    @property(Node)
    public BagNode: Node;

    @property(Node)
    public tozyPosition: Node;

    @property(Node)
    public chiiPosition: Node;

    @property(Node)
    public tozy: Node;

    @property(Node)
    public buttonDodge: Node;

    @property(Node)
    public dodgeNode: Node;

    private nextChiiStep = () => { };

    private isDodging: boolean = false;
    private isSacking: boolean = false;

    private playAnimation(nodePath: string, animationName: string) {
        const bodyNode = find(nodePath);
        if (bodyNode) {
            const animation = bodyNode.getComponent(Animation);
            if (animation) {
                animation.play(animationName);
            }
        }
    }

    //鬼之閃避(可閃超派鐵拳)
    public Dodge() {
        if (!this.isDodging) {
            this.isDodging = true;
            this.nextChiiStep = this.Pie;
            this.scheduleOnce(this.nextChiiStep);
        }
        else {
            this.nextChiiStep = this.Bag;
            this.scheduleOnce(this.nextChiiStep);
        }
        /*this.isDodging = true;
        this.nextChiiStep = this.Pie;
        this.scheduleOnce(this.nextChiiStep);*/
    }

    //邏輯壓制(超哥殺紅了眼，效果甚微)
    public Logic() {
        this.textShower.showText = "超哥殺紅了眼，效果甚微";
        this.textShower.OnShowTextOneByOne();
    }

    //野獸の組合拳(扣全部血，進入toyz提前進監結局)
    public Combo() {
        this.TryKillChii(3);
    }

    //誠懇道歉(超哥殺紅了眼，效果甚微)
    public Sorry() {
        this.textShower.showText = "起哥殺紅了眼，效果甚微";
        this.textShower.OnShowTextOneByOne();
    }

    //超派鐵拳(扣1/3血)
    public Pie() {
        if (this.isDodging) {
            this.playAnimation("Canvas/Node/Tozy/body", 'Fight_Dodge');
            this.playAnimation("Canvas/Tozy_Doge", 'Fight_ChiiFist');
            this.textShower.showText = "你躲掉起哥的攻擊了";
            this.textShower.OnShowTextOneByOne();
            this.nextChiiStep = this.Bag;
        }
        if (this.TryKillTozy(1)) {
            console.log("有扣寫");
        }
        else {
        }

    }

    //蓋布袋(使致盲無法行動)
    public Bag() {
        if(!this.isSacking){
            this.textShower.showText = "你的眼前一片黑暗";
            this.textShower.OnShowTextOneByOne();
            this.playAnimation("Canvas/Tozy_Sack", 'Fight_Sack');
            this.isSacking = true;
            return;
        }else{
            this.nextChiiStep = this.ChairAttack;
        }
        
    }

    //椅子砸椅子(扣2/3血)
    public ChairAttack() {
        //Demo版其實也不用扣了，直接打死
        if (this.TryKillTozy(3)) {
            this.playAnimation()
        }
        else {
            //沒死動作
            tween(this.TozyHPBar);
        }
        return;
    }

    public ToEndA() {

    }

    public TryKillTozy(hp: number): boolean {
        let isDie = false;
        this.TozyHP -= hp;
        isDie = this.TozyHP <= 0;
        if (isDie) this.TozyHP = 0;
        tween(this.TozyHPBar)
            .to(1, { progress: this.TozyHP })
            .start();
        return isDie;
    }

    public TryKillChii(hp: number): boolean {
        let isDie = false;
        this.ChiiHP -= hp;
        isDie = this.ChiiHP <= 0;
        if (isDie) this.ChiiHP = 0;
        tween(this.ChiiHPBar)
            .to(1, { progress: this.ChiiHP })
            .start();
        return isDie;
    }

    start() {


    }

    update(deltaTime: number) {

    }
}


