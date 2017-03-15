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

        const gameOverText = this.add.text(config.gameWidth * 0.5, config.gameHeight * 0.1, 'GAME OVER', fontStyle);
        gameOverText.anchor.setTo(0.5);

        const faceBg = {
            x: config.gameWidth * 0.5,
            y: config.gameHeight * 0.35
        };

        this.addLastFace(faceBg);
        this.addScoreBar(faceBg);

        this.addRestartButton();
        this.addSharingButtons();

        this.initialiseSound();
    }

    addLastFace(faceBg) {
        const backgroundSprite = this.add.sprite(
            faceBg.x,
            faceBg.y,
            'background-game-over'
        );
        backgroundSprite.anchor.setTo(0.5, 0.5);

        const faceSprite = this.add.sprite(faceBg.x + 8, faceBg.y + 20, 'faces');
        faceSprite.scale = {x: 2, y: 2};
        faceSprite.anchor.setTo(0.5, 0.5);
        faceSprite.frame = getLastFace();
    }

    addScoreBar(faceBg) {
        const scoreBar = this.add.sprite(
            faceBg.x,
            config.gameHeight * 0.53,
            'score-bar'
        );
        scoreBar.anchor.setTo(0.5, 0.5);
        scoreBar.scale = {x: 2, y: 2};

        const timeFontStyle = {
            font: '80px dinregular',
            fill: '#111',
            align: 'center'
        };

        const lastTimeText = this.add.text(
            config.gameWidth * 0.5,
            config.gameHeight * 0.53,
            this.game._lastTime,
            timeFontStyle
        );
        lastTimeText.anchor.setTo(0.5);
    }

    addRestartButton() {
        this.add.button(
            config.gameWidth * 0.2,
            config.gameHeight * 0.65,
            'uno-mas-button',
            this.startGame,
            this,
            1,
            0
        );
    }

    addSharingButtons() {
        if (!window) {
            return;
        }

        const buttonYPosition = config.gameHeight * 0.9;

        const twitterButton = this.add.button(
            config.gameWidth * 0.4,
            buttonYPosition,
            'twitter-button',
            this.shareOnTwitter,
            this,
            1,
            0
        );
        twitterButton.anchor.setTo(0.5, 0.5);

        const facebookButton = this.add.button(
            config.gameWidth * 0.6,
            buttonYPosition,
            'facebook-button',
            this.shareOnFacebook,
            this,
            1,
            0
        );
        facebookButton.anchor.setTo(0.5, 0.5);
    }

    shareOnFacebook() {
        // TODO work out FB sharing
        window.open('https://www.facebook.com/');
    }

    shareOnTwitter() {
        // TODO work out Twitter sharing
        window.open('https://twitter.com/');
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
}