import Phaser from 'phaser';

import config from '../config';

export default class extends Phaser.State {
    preload() {
        this.stage.backgroundColor = '#B4D9E7';
        this.preloadBar = this.add.sprite((config.gameWidth - 311) / 2, (config.gameHeight - 27) / 2, 'preloaderBar');
        this.load.setPreloadSprite(this.preloadBar);

        this.loadImages();

        this.load.spritesheet('monster-idle', './assets/img/monster-idle.png', 103, 131);
        this.load.spritesheet('button-start', './assets/img/button-start.png', 401, 143);
        this.load.spritesheet('faces', './assets/img/player/faces.png', 256, 256);
        this.load.spritesheet('collectibles', './assets/img/food-drink.png', 256, 256);
    }

    create() {
        this.state.start('MainMenu');
    }

    loadImages() {
        // TODO: Move these to a data file
        const imageMap = {
            background: './assets/img/background.png',
            'monster-cover': './assets/img/monster-cover.png',
            title: './assets/img/title.png',
            'game-over': './assets/img/gameover.png',
            'score-bg': './assets/img/score-bg.png',
            'button-pause': './assets/img/button-pause.png'
        };

        Object.keys(imageMap).forEach((id) => {
            this.load.image(id, imageMap[id]);
        });
    }
}
