import { _decorator, Component, debug, Input, input, Node, SpriteFrame, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EndingA')
export class EndingA extends Component {
    @property([Node])
    squence:Node[] = [];
    private index = 0 ;
    start() {
        input.once(Input.EventType.TOUCH_START,()=>{
                this.schedule(()=>{
                    this.squence[this.index].active = true;
                    console.log(this.index);
                    this.index++;
                },3,this.squence.length-1);
        },this);
    }

    update(deltaTime: number) {
        
    }
}


