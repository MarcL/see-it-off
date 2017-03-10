import Phaser from 'phaser';

import config from '../config';

export default class extends Phaser.State {
    preload() {
        this.stage.backgroundColor = '#B4D9E7';
        this.preloadBar = this.add.sprite((config.gameWidth - 311) / 2, (config.gameHeight - 27) / 2, 'preloaderBar');
        this.load.setPreloadSprite(this.preloadBar);

        this.loadImages();

        this.load.spritesheet('button-start', './assets/images/button-start.png', 401, 143);
        this.load.spritesheet('faces', './assets/images/player/faces.png', 256, 256);
        this.load.spritesheet('collectibles', './assets/images/food-drink.png', 256, 256);
        this.load.spritesheet('player', './assets/images/player/player-anims.png', 218, 218);
    }

    create() {
        this.state.start('MainMenu');
    }

    loadImages() {
        // TODO: Move these to a data file
        const imageMap = {
            background: './assets/images/background.png',
            'monster-cover': './assets/images/monster-cover.png',
            title: './assets/images/title.png',
            'game-over': './assets/images/gameover.png',
            'score-bg': './assets/images/score-bg.png',
            'button-pause': './assets/images/button-pause.png'
        };

        Object.keys(imageMap).forEach((id) => {
            this.load.image(id, imageMap[id]);
        });
    }
}
