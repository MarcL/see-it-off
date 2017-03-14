import Phaser from 'phaser';
import config from '../config';
import * as music from './gameMusic';

export default class extends Phaser.State {
    create() {
        this.add.sprite(0, 0, 'background-landing');

        const player = this.add.sprite(config.gameWidth * 0.1, config.gameHeight * 0.65, 'animation-menu');
        player.animations.add('idle', [0, 1], 4, true);
        player.animations.play('idle');

        this.add.button(
            config.gameWidth * 0.2,
            config.gameHeight * 0.34,
            'play-button',
            this.startGame,
            this,
            1,
            0
        );

        this.add.button(
            config.gameWidth * 0.29,
            config.gameHeight * 0.52,
            'rules-button',
            this.showRules,
            this,
            1,
            0
        );

        if (!this.game._music) {
            this.game._music = music.initialise(this.game);
        }
        music.start(this.game, this.game._music);
    }

    startGame() {
        music.stop(this.game._music);
        this.state.start('Game');
    }

    showRules() {
        this.state.start('Rules');
    }
}
