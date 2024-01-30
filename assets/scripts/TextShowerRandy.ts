import { _decorator, CCFloat, CCString, Component, input, Input, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TextShowerRandy')
export class TextShowerRandy extends Component {
    // private static _instance: TextShowerRandy | null = null;
    // public static getInstance(): TextShowerRandy | null { return TextShowerRandy._instance; }
    // start() { if (!TextShowerRandy._instance) TextShowerRandy._instance = this; }

    @property(Label)
    label: Label;
    @property(CCFloat)
    showSpeed: number;

    private _index: number = 0;
    private _showedText: string = "";
    private _fullText: string = "";
    private _active: boolean = false;
    public active = (e: boolean) => {
        if (e) {
            this.label.node.active = false;
            this._fullText = this.label.string;
            this.label.string = '';
            this.label.node.active = true;
            this._active = true;
            this.OnShowTextOneByOne();
        } else {
            this._active = false;
        }
    }

    update(deltaTime: number) {
    }

    public OnShowTextOneByOne() {
        this.label.string = "";
        this._showedText = "";
        this._index = 0;
        this.schedule(this.ShowTextOneByOne, this.showSpeed, this._fullText.length);
    }
    private ShowTextOneByOne() {
        this._showedText = this._fullText.slice(0, this._index);
        this.label.string = this._showedText;
        this._index++;
        if (this._showedText == this._fullText) {
            this.onTextingEnd()
        }
    }

    public onTextingEnd() {
        this.node.emit("textingEnd");
    }
}