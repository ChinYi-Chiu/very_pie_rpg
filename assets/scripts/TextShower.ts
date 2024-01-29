import { _decorator, CCFloat, CCString, Component, input, Input, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TextShower')
export class TextShower extends Component {
    @property(Label)
    label: Label;
    @property(CCString)
    public showText: string;
    @property(CCFloat)
    showSpeed: number;

    _index: number = 0;
    _showedText: string = "";
    start() {
        // input.on(Input.EventType.MOUSE_UP, (event) => {
        //     this.OnShowTextOneByOne();
        // }, this);
    }

    update(deltaTime: number) {

    }

    public OnShowTextOneByOne() {
        this.label.string = "";
        this._showedText = "";
        this._index = 0;
        this.schedule(this.ShowTextOneByOne, this.showSpeed, this.showText.length);
    }
    private ShowTextOneByOne() {
        this._showedText = this.showText.slice(0, this._index);
        this.label.string = this._showedText;
        this._index++;
    }
}