import Phaser from 'phaser';
import centerGameObjects from '../utils';

import config from '../config';

export default class extends Phaser.State {
	// preload: function(){
		// set background color and preload image
	// },

    preload() {
        this.stage.backgroundColor = '#B4D9E7';
        this.preloadBar = this.add.sprite((config.gameWidth - 311) / 2, (config.gameHeight - 27) / 2, 'preloaderBar');
        this.load.setPreloadSprite(this.preloadBar);

        this.loadImages();

        this.load.spritesheet('candy', './assets/img/candy.png', 82, 98);
        this.load.spritesheet('monster-idle', './assets/img/monster-idle.png', 103, 131);
        this.load.spritesheet('button-start', './assets/img/button-start.png', 401, 143);
        this.load.spritesheet('faces', './assets/img/player/faces.png', 256, 256);
        this.load.spritesheet('collectibles', './assets/img/food-drink.png',256, 256);
    }

    create() {
        this.state.start('MainMenu');
    }

    loadImages() {
        // TODO: Move these to a data file
        const imageMap = {
            background: './assets/img/background.png',
            floor: './assets/img/floor.png',
            'monster-cover': './assets/img/monster-cover.png',
            title: './assets/img/title.png',
            'game-over': './assets/img/gameover.png',
            'score-bg': './assets/img/score-bg.png',
            'button-pause': './assets/img/button-pause.png',
            'player-neutral': './assets/img/player/tom-neutral.png',
            'player-drunk-1': './assets/img/player/tom-drunk-level-1.png',
            'player-drunk-2': './assets/img/player/tom-drunk-level-2.png',
            'player-drunk-3': './assets/img/player/tom-drunk-level-3.png',
            mushroom: './assets/images/mushroom2.png',
        };

        Object.keys(imageMap).forEach((id) => {
            this.load.image(id, imageMap[id]);
        });
    }
}
