import { _decorator, Component, director, find, Animation, Node  } from 'cc';
import { TextShower } from "./TextShower";
const { ccclass, property  } = _decorator;


@ccclass('AnimationKeyframe')
export class AnimationKeyframe extends Component {

    @property(TextShower)
    public textShower: TextShower;
    @property(Node)
    public Tozy_fight: Node = null;
    @property(Node)
    public Chii_fight: Node = null;
    @property(Node)
    public Tozy_failed: Node = null;
    @property(Node)
    public Chii_victory: Node = null;
    @property(Node)
    public Chair: Node = null;
    @property(Node)
    public Sack: Node = null;

    private playAnimation(nodePath: string, animationName: string) {
        const bodyNode = find(nodePath);
        if (bodyNode) {
          const animation = bodyNode.getComponent(Animation);
          if (animation) {
            animation.play(animationName);
          }
        }
    }
    
    private setActive(node: Node, isActive: boolean) {
        if (node) {
            node.active = isActive;
        }
    }

    //ScenesTransition
    onTransitionFinished() {
        director.loadScene('FightScene');
    }
    BleedAnime_End(){
        director.loadScene('EndingA');
    }

    //???
    BleedAnime_ChangeSprite(){

        this.textShower.showText = "起哥:古人說過，忍無可忍，無須再忍。超派!!!!!!";
        this.textShower.OnShowTextOneByOne();

        this.setActive(this.Tozy_failed, true);
        this.setActive(this.Tozy_fight, false);
        this.setActive(this.Chii_victory, true);
        this.setActive(this.Chii_fight, false);
        this.setActive(this.Chair, false);
        this.setActive(this.Sack, false);
    }

}
