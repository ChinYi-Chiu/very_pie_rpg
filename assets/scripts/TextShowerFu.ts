import { _decorator, CCFloat, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TextShowerFu')
export class TextShowerFu extends Component {
    @property(Label)
    public label: Label | null = null;
    @property(CCFloat)
    public showSpeed: number = 0.1;

    private _index: number = 0;
    private _active: boolean = false;
    private textQueue: string[] = []; // 用於儲存待顯示文本的隊列

    public enqueueText(text: string) {
        this.textQueue.push(text);
        if (!this._active) {
            this.displayNext();
        }
    }

    private displayNext() {
        if (this.textQueue.length === 0) {
            this._active = false;
            return; // 隊列為空，無需顯示
        }

        this._active = true;
        const nextText = this.textQueue.shift() || "";
        this.showText(nextText);
    }

    private showText(text: string) {
        this._index = 0;
        this.label.string = "";
        this.schedule(this.showTextOneByOne, this.showSpeed, text.length);
    }

    private showTextOneByOne() {
        if (!this.label) {
            return;
        }

        this._index++;
        this.label.string = this.textQueue[0].slice(0, this._index);

        if (this._index >= this.textQueue[0].length) {
            this.unschedule(this.showTextOneByOne);
            this.node.emit("textingEnd"); // 文本顯示完畢
            this.displayNext(); // 繼續顯示下一條文本
        }
    }
}