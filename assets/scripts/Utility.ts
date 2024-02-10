import { _decorator, Animation, AnimationClip, Component, director, Node, Quat, Tween, tween } from 'cc';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

/**
 * 通用工具
 * @description
 * 這裡面會放置跨場景，甚至是跨專案通用的工具。
 */
@ccclass('Utility')
export class Utility extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    loadScene(sceneName: string) {
        this.node.active = true;
        let quat: Quat = new Quat();
        director.preloadScene(sceneName);

        this.loading.getComponent(Animation).play("Main_Menu_SceneTrans");
        this.AC.stop("bgm1");

        setTimeout(() => {
            Tween.stopAllByTarget(this.loading);
            director.loadScene(sceneName);
        }, 1000)
    }

    @property(Node)
    transBackGround: Node | null = null;
    @property(Node)
    loading: Node | null = null;
    @property(AudioController)
    AC: AudioController | null = null;
}


