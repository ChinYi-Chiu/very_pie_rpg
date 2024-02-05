import { _decorator, Button, Component, director, Node, Scene, SceneAsset } from 'cc';
import { Utility } from './Utility';
const { ccclass, property } = _decorator;

@ccclass('MainMenuManager')
export class MainMenuManager extends Component {
    start() {

        this.settingBtn?.node.on(Node.EventType.MOUSE_UP, this.openSettingMenu, this);
        this.newGameBtn?.node.on(Node.EventType.MOUSE_UP, this.changetoRpgScene, this);
    }

    update(deltaTime: number) {

    }

    openSettingMenu() {
        this.node.getParent().getChildByName("SettingPage").active = true;
    }

    changetoRpgScene() {
        this.utility.loadScene("scene");
    }

    @property(Button)
    newGameBtn: Button | null = null;
    @property(Button)
    settingBtn: Button | null = null;
    @property(Button)
    aboutUsBtn: Button | null = null;
    @property(Utility)
    utility: Utility | null = null;
}


