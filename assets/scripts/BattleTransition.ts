import { _decorator, CCFloat, CCInteger, Component, Input, input, instantiate, Node, Prefab, Rect, Scheduler, Size, Sprite, SpriteFrame, Tween, tween, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BattleTransition')
export class BattleTransition extends Component {

    @property(Prefab)
    block: Prefab;

    @property(CCFloat)
    fillUpSpeed: number;

    @property(Rect)
    matrixRange: Rect = new Rect();

    @property(Size)
    blockSize: Size = new Size();

    start() {

    }

    update(deltaTime: number) {

        // input.on(Input.EventType.MOUSE_UP,
        //     this.TransitionIn, this);
    }

    public async TransitionIn() {

        let wLimit = this.matrixRange.width;
        let hLimit = this.matrixRange.height;
        // for (let y = 0; y < hLimit; y++) {
        //     for (let x = 0; x < wLimit; x++) {

        //     }
        // }
        let counter = 0;
        for (let y = 0; y < hLimit; y++) {
            for (let x = 0; x < wLimit; x++) {
                this.SetBlock(x, y);
            }
        }
    }

    private SetBlock(x: number, y: number) {
        let block = instantiate(this.block);
        block.setParent(this.node);
        block.setPosition(x * this.blockSize.width, y * this.blockSize.height);
    }

    public TransitionOut() {

    }
}


