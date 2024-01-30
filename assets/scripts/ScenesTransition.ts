import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;

@ccclass('ScenesTransition')
export class ScenesTransition extends Component {

    onTransitionFinished() {
        director.loadScene('FightScene');
    }

}
