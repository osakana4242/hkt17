"use strict";
/// <reference path="../node_modules/phina.js.d.ts/globalized/index.d.ts" />
/// <reference path="./math.ts" />
/// <reference path="./wave_data.ts" />
phina.globalize();
var ASSETS = {
    image: {
        "obj": "./img/obj.png",
    },
    spritesheet: {
        "obj": "./img/obj.ss.json",
    },
};
class DF {
}
DF.SC_W = 640;
DF.SC_H = 960;
class Rotation {
}
Rotation.RIGHT = 0;
Rotation.DOWN = 90;
Rotation.LEFT = 180;
Rotation.UP = 270;
class Vector2Helper {
    static isZero(v) {
        return v.x === 0 && v.y === 0;
    }
    static copyFrom(a, b) {
        a.x = b.x;
        a.y = b.y;
    }
    static add(a, b) {
        return Vector2(a.x + b.x, a.y + b.y);
    }
}
const StateId = {
    S1I: 10,
    S1: 11,
    S2: 20,
    S3I: 30,
    S3: 40,
    EXIT: 100,
};
class GameObjectType {
}
GameObjectType.UNDEF = 0;
GameObjectType.PLAYER = 1;
GameObjectType.PLAYER_BULLET = 2;
GameObjectType.ENEMY = 3;
GameObjectType.EFFECT = 4;
GameObjectType.STONE = 5;
class Player {
    constructor() {
        this.freezeTime = 0;
        this.freezeDuration = 300;
    }
}
class GameObject {
    constructor() {
        this.name = '';
        this.type = GameObjectType.UNDEF;
        this.hasDelete = false;
        this.instanceId = 0;
        this.tr = new Transform();
        this.sprite = null;
        this.life = new Life();
        this.bullet = null;
        this.effect = null;
        this.player = null;
        this.enemy = null;
        this.collider = null;
        this.anim = null;
        this.shaker = null;
        GameObject.autoIncrement++;
        this.instanceId = GameObject.autoIncrement;
    }
}
GameObject.autoIncrement = 0;
class Life {
    constructor() {
        this.hpMax = 1;
        this.hp = 1;
    }
}
class Effect {
    constructor() {
        this.duration = 1000;
        this.time = 0;
    }
}
class Collider {
    constructor() {
        var rect = new RectangleShape();
        rect.width = 32;
        rect.height = 64;
        rect.alpha = 0.0;
        rect.fill = '#ff0000';
        rect.stroke = '#000000';
        this.sprite = rect;
    }
}
class Bullet {
    constructor() {
        this.hitIdArr = [];
    }
}
class Enemy {
    constructor() {
        this.stoneId = 0;
        this.firstSpeed = 25;
        this.speed = 25;
        this.loopCount = 0;
        this.scoreScale = 1;
    }
}
class Shaker {
    constructor() {
        this.duration = 200;
        this.time = 0;
        this.power = 8;
        this.offset = Vector2(0, 0);
        this.time = this.duration;
    }
}
class ShakerHelper {
    static shake(shaker) {
        shaker.time = 0;
    }
    static update(shaker, app) {
        shaker.time = Math.min(shaker.time + app.deltaTime, shaker.duration);
        const progress = MathHelper.progress01(shaker.time, shaker.duration);
        const rotation = Math.random() * 360;
        shaker.offset.fromDegree(rotation);
        const power = LerpHelper.linear(shaker.power, 0, progress);
        shaker.offset.x *= power;
        shaker.offset.y *= power;
    }
}
class Transform {
    constructor() {
        this.rotation = 0;
        this.position = Vector2(0, 0);
    }
    getSpriteScale() {
        var v = Vector2(0, 0);
        v.fromDegree(this.rotation);
        var sx = 1;
        var sy = 1;
        if (v.x < 0) {
            sx = -1;
        }
        v.x = sx;
        v.y = sy;
        return v;
    }
}
class AsciiSprite {
    constructor() {
        this.character = ' ';
        this.position = 0;
        this.priority = 0;
    }
}
class StateMachine {
    constructor() {
        this.time = 0;
        this.state = (_1, _2) => null;
    }
    update(target, app) {
        var nextState = this.state(target, { app: app, sm: this });
        if (nextState && this.state !== nextState) {
            this.state = nextState;
            this.time = 0;
        }
        else {
            this.time += app.deltaTime;
        }
    }
}
class QuestWork {
    constructor() {
        /** 0 = 相手; 1 = 自分 */
        this.state = 0;
        this.questIndex = 0;
        this.blockIndex = 0;
        this.noteIndex = 0;
        this.loopCount = 0;
        this.barTime = 0;
        this.time = 0;
    }
    getQuestData() {
        return questDataArr[this.questIndex];
    }
    getBpm() {
        return this.getQuestData().bpm + (this.loopCount * 10);
    }
}
class HogeScene {
    constructor(pScene) {
        this.lines = [[], [], []];
        this.goArr = [];
        this.stageLeft = 0;
        this.enemyRect = new Rect(-64, -64, DF.SC_W + 160, DF.SC_H + 128);
        this.screenRect = new Rect(0, 0, DF.SC_W, DF.SC_H);
        this.stageRight = 32;
        this.isStarted = false;
        this.isEnd = false;
        this.sm = new StateMachine();
        this.enemyDataDict = {
            'enm_1': {
                speed: 25,
                scoreScale: 1,
                hp: 4
            },
            'enm_2': {
                speed: 15,
                scoreScale: 5,
                hp: 2
            },
        };
        this.playerBulletSpeed = 8;
        this.questWork = new QuestWork();
        this.score = 0;
        this.hasPause = false;
        this.lastLine = null;
        this.playerLineIndex = 0;
        this.playerLineStartTime = 0;
        this.playerHp = 5;
        this.playerHasDamage = false;
        this.scene = pScene;
        pScene.backgroundColor = '#ccccc0';
        this.player = this.createPlayer();
        {
            const label = Label({
                text: 'hoge',
                fill: '#ffffff',
                fontSize: 16,
                fontFamily: 'monospaced',
                align: 'left',
            });
            label.x = 8;
            label.y = 40;
            label.addChildTo(pScene);
            this.mainLabel = label;
        }
        {
            const label = new Label({
                text: '',
                fill: '#ffffff',
                fontSize: 40,
                fontFamily: 'monospaced',
                align: 'center',
            });
            label.x = this.screenRect.centerX;
            label.y = this.screenRect.centerY;
            label.addChildTo(pScene);
            this.centerTelop = label;
        }
        this.sm.state = HogeScene.state1;
        pScene.addEventListener('focus', (evt) => {
            this.hasPause = false;
        });
        pScene.addEventListener('blur', (evt) => {
            this.hasPause = true;
        });
        pScene.addEventListener('enterframe', (evt) => {
            if (this.hasPause)
                return;
            this.enterframe(evt);
        });
    }
    static state1(self, evt) {
        if (evt.sm.time === 0) {
            self.centerTelop.text = 'ポンポンライン';
            self.centerTelop.fill = '#444444';
        }
        if (1000 <= evt.sm.time) {
            if (evt.app.pointer.getPointingStart()) {
                self.centerTelop.text = '';
                return HogeScene.state2;
            }
        }
        return null;
    }
    static state2(self, evt) {
        if (evt.sm.time === 0) {
            self.isStarted = true;
        }
        if (self.playerHp <= 0) {
            return HogeScene.stateGameOver;
        }
        if (evt.app.keyboard.getKeyDown('g')) {
            return HogeScene.stateGameOver;
        }
        if (evt.app.keyboard.getKeyDown('r')) {
            return HogeScene.stateExit;
        }
        if (evt.app.pointer.getPointingStart()) {
            if (self.questWork.state == 1) {
                let line = self.lastLine;
                const p = evt.app.pointer.startPosition.clone();
                if (line === null) {
                    line = PathShape({
                        paths: [p, p],
                        stroke: '#ffffff',
                        strokeWidth: 1,
                    });
                    line.addChildTo(self.scene);
                    self.lastLine = line;
                }
                line.setPaths([p, p]);
                self.playerLineStartTime = self.questWork.barTime;
            }
        }
        if (evt.app.pointer.getPointing()) {
            const line = self.lastLine;
            if (line !== null) {
                var p = evt.app.pointer.position;
                var paths = line.getPaths();
                paths.push(p.clone());
                line.setPaths(paths);
            }
        }
        if (evt.app.pointer.getPointingEnd()) {
            const line = self.lastLine;
            if (line !== null) {
                self.lastLine = null;
                const paths = line.getPaths();
                const questData = self.questWork.getQuestData();
                const score = self.calcScore(self.questWork, questData.blockArr[self.questWork.blockIndex].noteArr, self.playerLineIndex, self.playerLineStartTime, paths);
                self.score += score;
                var pos = paths[paths.length - 1];
                HogeScene.addScoreLabel(self, score, Vector2(pos.x, pos.y - 40));
                if (self.score <= 0) {
                    self.playerHasDamage = true;
                }
                self.playerLineIndex += 1;
                line.tweener.fadeOut(500).call(() => line.remove);
            }
        }
        return null;
    }
    static addScoreLabel(self, score, pos) {
        let text = `+${score}`;
        if (score <= 0) {
            text = 'NULL!';
        }
        else {
            text = 'GOOD ' + text;
        }
        const label = Label({
            text: text,
            fontSize: 24,
            fill: '#ffffff',
        });
        label.addChildTo(self.scene);
        label.x = pos.x;
        label.y = pos.y;
        label.tweener.
            moveBy(0, -16, 200).
            moveBy(0, -1, 800).
            call(() => label.remove());
    }
    static stateGameOver(self, evt) {
        if (evt.sm.time === 0) {
            self.playerHp = 0;
            self.isEnd = true;
            self.centerTelop.text = 'GAME OVER';
        }
        if (2000 <= evt.sm.time) {
            return HogeScene.stateGameOver2;
        }
        return null;
    }
    static stateGameOver2(self, evt) {
        if (evt.sm.time === 0) {
            self.centerTelop.text = `GAME OVER\nSCORE ${self.score}`;
        }
        if (3000 <= evt.sm.time) {
            if (evt.app.pointer.getPointingStart()) {
                return HogeScene.stateExit;
            }
        }
        return null;
    }
    static stateExit(self, evt) {
        if (evt.sm.time === 0) {
            self.scene.exit();
        }
        return null;
    }
    createSlash(position) {
        const go = new GameObject();
        go.name = `bullet ${go.instanceId}`;
        go.type = GameObjectType.PLAYER_BULLET;
        go.tr.position.x = position.x;
        go.tr.position.y = position.y;
        go.collider = new Collider();
        go.collider.sprite.width = 16;
        go.collider.sprite.height = 48;
        go.collider.sprite.addChildTo(this.scene);
        go.effect = new Effect();
        go.effect.duration = 250;
        go.bullet = new Bullet();
        this.goArr.push(go);
        return go;
    }
    createPlayer() {
        const go = new GameObject();
        go.name = 'player';
        go.type = GameObjectType.PLAYER;
        go.tr.position.x = this.screenRect.centerX;
        go.tr.position.y = this.screenRect.centerY;
        go.player = new Player();
        const sprite = PathShape({
            paths: [
                Vector2(8, 8),
                Vector2(32, 24),
            ],
        });
        // const anim = FrameAnimation("obj");
        // anim.attachTo(sprite);
        // anim.gotoAndPlay('chara_stand');
        // sprite.addChildTo(this.scene);
        // go.anim = anim;
        go.sprite = sprite;
        this.goArr.push(go);
        return go;
    }
    createStone(quest, app) {
        const go = new GameObject();
        go.name = 'stone';
        go.type = GameObjectType.STONE;
        const sprite = Sprite('obj', 96, 96);
        const fa = FrameAnimation("obj");
        fa.attachTo(sprite);
        fa.gotoAndPlay('stone');
        sprite.addChildTo(this.scene);
        go.sprite = sprite;
        this.goArr.push(go);
        return go;
    }
    createEnemy(quest, app, enemyId) {
        const stone = this.createStone(this, app);
        const enemyData = quest.enemyDataDict[enemyId];
        const go = new GameObject();
        go.name = `enemy${go.instanceId}`;
        go.type = GameObjectType.ENEMY;
        go.enemy = new Enemy();
        go.enemy.stoneId = stone.instanceId;
        go.enemy.scoreScale = enemyData.scoreScale;
        go.enemy.firstSpeed = enemyData.speed;
        const sprite = Sprite('obj', 96, 96);
        const fa = FrameAnimation("obj");
        fa.attachTo(sprite);
        fa.gotoAndPlay('chara_push');
        sprite.addChildTo(this.scene);
        go.sprite = sprite;
        go.life = new Life();
        go.life.hpMax = enemyData.hp;
        go.life.hp = go.life.hpMax;
        go.collider = new Collider();
        go.collider.sprite.height = 56;
        go.collider.sprite.addChildTo(this.scene);
        go.collider.sprite.setPosition(120, 120);
        go.shaker = new Shaker();
        this.resetEnemy(go);
        var scale = (1 + quest.questWork.loopCount * 0.5);
        this.goArr.push(go);
        return go;
    }
    resetEnemy(go) {
        if (!go.enemy)
            return;
        if (!go.life)
            return;
        go.tr.position.x = this.enemyRect.right;
        go.tr.position.y = this.enemyRect.centerY - 100 + Math.random() * 200;
        go.enemy.speed = go.enemy.firstSpeed;
        go.life.hp = go.life.hpMax;
    }
    calcScore(questWork, noteArr, lineIndex, startTime, posArr) {
        if (!MathHelper.isInRange(lineIndex, 0, noteArr.length))
            return 0;
        const note = noteArr[lineIndex];
        const timeSpan = MidiHelper.tickToMsec(questWork.getBpm(), questWork.getQuestData().bpqn, note.time) - startTime;
        const threshold = 500;
        const timeSpan2 = Math.abs(timeSpan);
        if (threshold <= timeSpan2)
            return 0;
        return Math.floor((threshold - timeSpan2) * 100 / threshold);
    }
    updateQuest(myScene, app) {
        if (!myScene.isStarted)
            return;
        if (myScene.isEnd)
            return;
        const questWork = myScene.questWork;
        const goArr = myScene.goArr;
        {
            const questData = questWork.getQuestData();
            const blockData = questData.blockArr[questWork.blockIndex];
            const noteArr = blockData.noteArr;
            const qnDuration = MidiHelper.tickToMsec(questWork.getBpm(), questData.bpqn, questData.bpqn);
            const barDuration = noteArr[noteArr.length - 1].time + qnDuration;
            for (var i = questWork.noteIndex; i < noteArr.length; i++) {
                const note = noteArr[i];
                const noteTime = MidiHelper.tickToMsec(questWork.getBpm(), questData.bpqn, note.time);
                if (questWork.barTime < noteTime)
                    continue;
                if (questWork.state == 1) {
                    if (myScene.playerLineIndex < i) {
                        myScene.playerLineIndex = i;
                        HogeScene.addScoreLabel(myScene, 0, Vector2(myScene.screenRect.centerX, myScene.screenRect.centerY));
                        myScene.playerHasDamage = true;
                    }
                }
                switch (note.type) {
                    case 1: {
                        // slash.
                        const stateColor = (questWork.state <= 0) ? '#ff0000' : '#0000ff';
                        const size = Math.min(myScene.screenRect.width, myScene.screenRect.height);
                        const sx = myScene.screenRect.centerX + (note.startX * size * 0.5);
                        const sy = myScene.screenRect.centerY + (note.startY * size * 0.5);
                        const ex = myScene.screenRect.centerX + (note.endX * size * 0.5);
                        const ey = myScene.screenRect.centerY + (note.endY * size * 0.5);
                        const slash = PathShape({
                            paths: [
                                Vector2(sx, sy),
                                Vector2(sx, sy)
                            ],
                            stroke: stateColor,
                        });
                        slash.addChildTo(myScene.scene);
                        const slashDuration = qnDuration * 0.5;
                        const slashFadeoutDuration = qnDuration * 0.5;
                        const slashAliveDuration = qnDuration * 2;
                        var slashTime = 0;
                        slash.addEventListener('enterframe', () => {
                            const t = MathHelper.progress01(slashTime, slashDuration);
                            slashTime += app.ticker.deltaTime;
                            const paths = slash.getPaths();
                            paths[1].x = LerpHelper.linear(sx, ex, t);
                            paths[1].y = LerpHelper.linear(sy, ey, t);
                            const t2 = 1.0 - MathHelper.progress01(slashTime - (slashAliveDuration - slashFadeoutDuration), slashFadeoutDuration);
                            slash.alpha = t2;
                            slash.setPaths(paths);
                            if (slashTime < slashAliveDuration)
                                return;
                            slash.remove();
                        });
                        break;
                    }
                    case 2: {
                        if (questWork.state === 1)
                            continue;
                        const stateColor = (questWork.state <= 0) ? '#ff0000' : '#8888ff';
                        const size = Math.min(myScene.screenRect.width, myScene.screenRect.height);
                        const sx = myScene.screenRect.centerX + (note.startX * size * 0.5);
                        const sy = myScene.screenRect.centerY + (note.startY * size * 0.5);
                        const ex = myScene.screenRect.centerX + (note.endX * size * 0.5);
                        const ey = myScene.screenRect.centerY + (note.endY * size * 0.5);
                        const sprite = Label({
                            text: 'YOUR TURN!',
                            fontSize: 20,
                            fontWeight: 'bold',
                            fill: '#8888ff',
                        });
                        sprite.x = myScene.screenRect.centerX;
                        sprite.y = myScene.screenRect.centerY;
                        sprite.addChildTo(myScene.scene);
                        const slashDuration = qnDuration * 0.25;
                        const slashFadeoutDuration = qnDuration * 0.25;
                        const slashAliveDuration = qnDuration * 1;
                        var slashTime = 0;
                        sprite.addEventListener('enterframe', () => {
                            const t = MathHelper.progress01(slashTime, slashDuration);
                            slashTime += app.ticker.deltaTime;
                            const t2 = 1.0 - MathHelper.progress01(slashTime - (slashAliveDuration - slashFadeoutDuration), slashFadeoutDuration);
                            sprite.alpha = t2;
                            if (slashTime < slashAliveDuration)
                                return;
                            sprite.remove();
                        });
                        break;
                    }
                }
                questWork.noteIndex = i + 1;
            }
            if (barDuration <= questWork.barTime) {
                myScene.playerLineIndex = 0;
                questWork.noteIndex = 0;
                questWork.barTime = 0;
                questWork.state += 1;
                if (2 <= questWork.state) {
                    questWork.state = 0;
                    questWork.blockIndex += 1;
                    if (questData.blockArr.length <= questWork.blockIndex) {
                        questWork.blockIndex = 0;
                        questWork.loopCount += 1;
                    }
                }
            }
            questWork.time += app.ticker.deltaTime;
            questWork.barTime += app.ticker.deltaTime;
        }
    }
    static isHit(a, b) {
        const aCollider = a.collider;
        if (!aCollider)
            return false;
        const bCollider = b.collider;
        if (!bCollider)
            return false;
        return aCollider.sprite.hitTestElement(new Rect(bCollider.sprite.left, bCollider.sprite.top, bCollider.sprite.width, bCollider.sprite.height));
    }
    static hit(own, other) {
        if (own.bullet) {
            this.hitBullet(own, other);
        }
        if (other.bullet) {
            this.hitBullet(other, own);
        }
    }
    static hit2(own, other) {
        own.life.hp -= 1;
        if (own.life.hp < 0) {
            own.life.hp = 0;
        }
        if (own.enemy) {
            own.enemy.speed += 10;
        }
        if (own.shaker) {
            ShakerHelper.shake(own.shaker);
        }
    }
    static hitBullet(bullet, other) {
        if (!bullet.bullet)
            return;
        if (0 <= bullet.bullet.hitIdArr.indexOf(other.instanceId))
            return;
        bullet.bullet.hitIdArr.push(other.instanceId);
        this.hit2(other, bullet);
        this.hit2(bullet, other);
    }
    updateHit(goArr, aFilter, bFilter) {
        for (var i = 0; i < goArr.length; i++) {
            const aGO = goArr[i];
            if (!aFilter(aGO))
                continue;
            for (var j = 0; j < goArr.length; j++) {
                const bGO = goArr[j];
                if (!bFilter(bGO))
                    continue;
                if (!HogeScene.isHit(aGO, bGO))
                    continue;
                HogeScene.hit(aGO, bGO);
                HogeScene.hit(bGO, aGO);
            }
        }
    }
    updateShaker(myScene, app) {
        const goArr = myScene.goArr;
        goArr.forEach(go => {
            const shaker = go.shaker;
            if (!shaker)
                return;
            ShakerHelper.update(shaker, app);
        });
    }
    enterframe(evt) {
        const app = evt.app;
        const myScene = this;
        const questWork = myScene.questWork;
        myScene.sm.update(myScene, app);
        myScene.updateQuest(myScene, app);
        const goArr = myScene.goArr;
        myScene.updateShaker(myScene, app);
        if (myScene.playerHasDamage) {
            myScene.playerHasDamage = false;
            if (0 < myScene.playerHp) {
                myScene.playerHp -= 1;
            }
        }
        // // Bullet.
        // goArr.forEach(go => {
        // 	const bullet = go.bullet;
        // 	if (!bullet) return;
        // 	const vec = bullet.vec;
        // 	go.sprite.position += vec * app.ticker.deltaTime / 1000;
        // 	if (!MathHelper.isInRange(go.sprite.position, myScene.stageLeft, myScene.stageRight)) {
        // 		go.hasDelete = true;
        // 	}
        // });
        // // Life.
        // goArr.forEach(go => {
        // 	const life = go.life;
        // 	if (!life) return;
        // 	if (0 < life.hp) return;
        // 	go.hasDelete = true;
        // });
        // Effect.
        goArr.forEach(go => {
            const effect = go.effect;
            if (!effect)
                return;
            effect.time += app.ticker.deltaTime;
            if (effect.time < effect.duration)
                return;
            go.hasDelete = true;
        });
        // collider 位置更新.
        myScene.goArr.forEach((go) => {
            const collider = go.collider;
            if (!collider)
                return;
            const sprite = collider.sprite;
            if (!sprite)
                return;
            sprite.x = go.tr.position.x;
            sprite.y = go.tr.position.y;
        });
        // 衝突判定.
        //myScene.updateHit(goArr, go => go.type === GameObjectType.PLAYER, go => go.type === GameObjectType.ENEMY);
        myScene.updateHit(goArr, go => go.type === GameObjectType.PLAYER_BULLET, go => go.type === GameObjectType.ENEMY);
        // 掃除.
        for (var i = goArr.length - 1; 0 <= i; i--) {
            const go = goArr[i];
            if (!go.hasDelete)
                continue;
            myScene.destroyGameObject(go);
            goArr.splice(i, 1);
        }
        // 描画.
        {
            myScene.goArr.forEach((go) => {
                const sprite = go.sprite;
                if (sprite === null)
                    return;
                const sc = go.tr.getSpriteScale();
                sprite.scaleX = sc.x;
                sprite.scaleY = sc.y;
                sprite.x = go.tr.position.x;
                sprite.y = go.tr.position.y;
                if (go.shaker) {
                    sprite.x += go.shaker.offset.x;
                    sprite.y += go.shaker.offset.y;
                }
            });
        }
        var sprites = [];
        myScene.goArr.forEach((go) => {
            if (!go.sprite)
                return;
            sprites.push(go.sprite);
        });
        myScene.scene.children.sort((a, b) => {
            if (!(a instanceof DisplayElement))
                return 0;
            if (!(b instanceof DisplayElement))
                return 0;
            var aPriority = a.y;
            var bPriority = b.y;
            if (a instanceof Label) {
                aPriority = 1000;
            }
            if (b instanceof Label) {
                bPriority = 1000;
            }
            var cmp = aPriority - bPriority;
            return cmp;
        });
        var text = '';
        text += 'SCORE: ' + myScene.score;
        text += ' LIFE: ' + '■'.repeat(myScene.playerHp);
        text += '\nDEBUG LOOP: ' + questWork.loopCount + ` T1: ${questWork.barTime} T2: ${questWork.time}`;
        myScene.mainLabel.text = text;
    }
    destroyGameObject(go) {
        if (go.sprite) {
            go.sprite.remove();
        }
        if (go.collider) {
            go.collider.sprite.remove();
        }
    }
}
phina.define('MainScene', {
    superClass: 'DisplayScene',
    init: function (options) {
        this.superInit(options);
        this.myScene = new HogeScene(this);
        console.log('fuga');
    },
    update: function () {
        var scene = this.myScene;
    }
});
// メイン処理
phina.main(function () {
    // アプリケーション生成
    let app = GameApp({
        startLabel: 'main',
        fps: 60,
        width: DF.SC_W,
        height: DF.SC_H,
        assets: ASSETS,
        scenes: [
            {
                className: 'MainScene',
                label: 'main',
                nextLabel: 'main',
            },
        ],
    });
    // アプリケーション実行
    app.run();
});