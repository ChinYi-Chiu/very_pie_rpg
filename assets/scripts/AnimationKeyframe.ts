import { _decorator, Component, director, find, Animation, Sprite, SpriteFrame, resources  } from 'cc';
const { ccclass, property  } = _decorator;

@ccclass('AnimationKeyframe')
export class AnimationKeyframe extends Component {

    @property(Sprite)
    public Tozy_sprite: Sprite = null;
    @property(Sprite)
    public Chii_sprite: Sprite = null;

    private playAnimation(nodePath: string, animationName: string) {
        const bodyNode = find(nodePath);
        if (bodyNode) {
          const animation = bodyNode.getComponent(Animation);
          if (animation) {
            animation.play(animationName);
          }
        }
    }
    
    private changeSprite(sprite:Sprite,newSpritePath: string) {
        // 從資源管理器中加載新的 SpriteFrame
        resources.load(newSpritePath, SpriteFrame, (err, spriteFrame: SpriteFrame) => {
            if (err) {
                console.error(err);
                return;
            }
            // 更換 Sprite 組件的圖片
            if (sprite) {
                sprite.spriteFrame = spriteFrame;
            }
        });
    }

    //ScenesTransition
    onTransitionFinished() {
        director.loadScene('FightScene');
    }
    xxx(){
        director.loadScene('EndingA');
    }

    //???
    BleedAnime_ChangeSprite(){
        this.changeSprite(this.Tozy_sprite, `image/tozy/failed`);
        this.changeSprite(this.Chii_sprite, `image\超哥\failed`);
    }

}
