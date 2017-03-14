import Phaser from 'phaser';
import config from '../config';
import {getLastFace} from '../config/faces';
import * as music from './gameMusic';

export default class extends Phaser.State {
    create() {
        this.stage.backgroundColor = '#222';
        const fontStyle = {
            font: '100px eraserregular',
            fill: '#fff',
            align: 'center'
        };

        const gameOverText = this.add.text(config.gameWidth * 0.5, config.gameHeight * 0.15, 'GAME OVER', fontStyle);
        gameOverText.anchor.setTo(0.5);

        const faceBg = {
            x: config.gameWidth * 0.5,
            y: config.gameHeight * 0.4
        };
        const backgroundSprite = this.add.sprite(
            faceBg.x,
            faceBg.y,
            'background-game-over'
        );
        backgroundSprite.anchor.setTo(0.5, 0.5);

        const faceSprite = this.add.sprite(faceBg.x + 8, faceBg.y + 40, 'faces');
        faceSprite.scale = {x: 2, y: 2};
        faceSprite.anchor.setTo(0.5, 0.5);
        faceSprite.frame = getLastFace();

        this.add.button(
            config.gameWidth * 0.2,
            config.gameHeight * 0.6,
            'uno-mas-button',
            this.startGame,
            this,
            1,
            0
        );

        // TODO - Add in if have time
        this.add.button(
            config.gameWidth * 0.29,
            config.gameHeight * 0.85,
            'rules-button',
            this.showRules,
            this,
            1,
            0
        );

        this.initialiseSound();
    }

    initialiseSound() {
        if (!this.game._music) {
            this.game._music = music.initialise(this.game);
        }
        music.start(this.game, this.game._music);

        this._gameOverSound = this.game.add.audio('game-over');
        this._gameOverSound.play();
    }

    startGame() {
        music.stop(this.game._music);
        this.state.start('Game');
    }

    showRules() {
        this.state.start('Rules');
    }
}
