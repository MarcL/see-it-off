import Phaser from 'phaser';
import config from '../config';

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
            0,
            1
        );

        // TODO - Add in if have time
        // this.add.button(
        //     config.gameWidth * 0.29,
        //     config.gameHeight * 0.55,
        //     'rules-button',
        //     this.showRules,
        //     this,
        //     0,
        //     1
        // );
    }

    startGame() {
        this.state.start('Game');
    }

    showRules() {
        // TODO
    }
}
