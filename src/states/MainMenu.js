import Phaser from 'phaser';
import config from '../config';

export default class extends Phaser.State {
    create() {
        // display images
        this.add.sprite(0, 0, 'background');
        this.add.sprite(-130, config.gameHeight - 514, 'monster-cover');
        this.add.sprite((config.gameWidth - 395) / 2, 60, 'title');

        // add the button that will start the game
        this.add.button(config.gameWidth - 401 - 10, config.gameHeight - 143 - 10, 'button-start', this.startGame, this, 1, 0, 2);
    }

    startGame() {
        this.state.start('Game');
    }
}
