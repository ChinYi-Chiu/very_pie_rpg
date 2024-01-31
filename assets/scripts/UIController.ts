import { _decorator, Button, Component, Event, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIController')
export class UIController extends Component {
    start() {
        this.choseArrow.active = false;
        this.option1Button.node.on(Node.EventType.MOUSE_ENTER, this.updateChose, this);
        this.option2Button.node.on(Node.EventType.MOUSE_ENTER, this.updateChose, this);
        this.option3Button.node.on(Node.EventType.MOUSE_ENTER, this.updateChose, this);
    }

    update(deltaTime: number) {
    }

    // 游標
    @property(Node)
    public choseArrow: Node | null = null;

    // 三個選項按鈕組
    @property(Button)
    public option1Button: Button | null = null;
    @property(Button)
    public option2Button: Button | null = null;
    @property(Button)
    public option3Button: Button | null = null;

    public updateChose(ev: Event) {
        let s = ev.currentTarget as Node;
        this.choseArrow.active = true;
        this.choseArrow.position = s.position;
        this.choseArrow.position = new Vec3(-506, s.position.y, s.position.z);
    }
    public hideArrow(ev: Event) {
        this.choseArrow.active = false;
    }
}


