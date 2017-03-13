import Phaser from 'phaser';
import config from '../config';
import faces from '../config/faces';

export default class extends Phaser.State {
    create() {
        this.stage.backgroundColor = '#222';
        const fontStyle = {
            font: '100px eraserregular',
            fill: '#fff',
            align: 'center'
        };

        this._scoreText = this.add.text(config.gameWidth * 0.5, config.gameHeight * 0.15, 'GAME OVER', fontStyle);
        this._scoreText.anchor.setTo(0.5);

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

        // TODO - Get last face sprite
        const faceSprite = this.add.sprite(faceBg.x + 8, faceBg.y + 40, 'faces');
        faceSprite.scale = {x: 2, y: 2};
        faceSprite.anchor.setTo(0.5, 0.5);
        faceSprite.frame = faces.FACE_NEUTRAL;

        // TODO - Try again button
        this.add.button(
            config.gameWidth * 0.2,
            config.gameHeight * 0.6,
            'play-button',
            this.startGame,
            this,
            1,
            0
        );
    }

    startGame() {
        this.state.start('Game');
    }
}
