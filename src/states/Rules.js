import Phaser from 'phaser';
import config from '../config';

export default class extends Phaser.State {
    create() {
        this.stage.backgroundColor = '#222';
        const fontStyle = {
            font: '100px eraserregular',
            fill: '#fff',
            align: 'center'
        };

        const gameOverText = this.add.text(config.gameWidth * 0.5, config.gameHeight * 0.1, 'RULES', fontStyle);
        gameOverText.anchor.setTo(0.5);

        this.add.button(
            config.gameWidth * 0.85,
            config.gameHeight * 0.02,
            'close-button',
            this.closeButton,
            this,
            1,
            0
        );
    }

    closeButton() {
        this.state.start('MainMenu');
    }
}
