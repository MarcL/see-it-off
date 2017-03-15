import Phaser from 'phaser';
import config from '../config';
import {getLastFace} from '../config/faces';
import * as music from './gameMusic';

export default class extends Phaser.State {
    create() {
        this.stage.backgroundColor = '#222';

        this.addTitle();
        this.addText(config.gameWidth * 0.5, config.gameHeight * 0.16, 'Tom has left the party');

        const faceBg = {
            x: config.gameWidth * 0.5,
            y: config.gameHeight * 0.4
        };

        this.addLastFace(faceBg);
        this.addScoreBar(faceBg);

        this.addRestartButton();
        this.addSharingButtons();

        this.initialiseSound();
    }

    addTitle() {
        const fontStyle = {
            font: '100px eraserregular',
            fill: '#fff',
            align: 'center'
        };

        const gameOverText = this.add.text(config.gameWidth * 0.5, config.gameHeight * 0.08, 'GAME OVER', fontStyle);
        gameOverText.anchor.setTo(0.5);
    }

    addText(x, y, text) {
        console.log({x, y});
        const fontStyle = {
            font: '64px dinregular',
            fill: '#fff',
            align: 'center'
        };

        const gameOverText = this.add.text(x, y, text, fontStyle);
        gameOverText.anchor.setTo(0.5);
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
        const yPos = faceBg.y + (config.gameHeight * 0.15);
        const scoreBar = this.add.sprite(
            faceBg.x,
            yPos,
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
            yPos,
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

        const buttonYPosition = config.gameHeight * 0.92;

        this.addText(config.gameWidth * 0.5, config.gameHeight * 0.85, 'Share your score');

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

    createSharingText() {
        const textWithScore = config.sharing.text.replace('#TIME#', this.game._lastTime);
        const currentUrl = window.location.href;
        const text = `${textWithScore} ${currentUrl}`;
        return encodeURIComponent(text);
    }

    shareOnFacebook() {
        // TODO work out FB sharing
        window.open('https://www.facebook.com/');
    }

    shareOnTwitter() {
        const url = `${config.sharing.twitterUrl}${this.createSharingText()}`;
        window.open(url);
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
