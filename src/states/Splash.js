import Phaser from 'phaser';

import config from '../config';

export default class extends Phaser.State {
    preload() {
        this.stage.backgroundColor = '#225d6b';
        this.preloadBar = this.add.sprite((config.gameWidth - 311) / 2, (config.gameHeight - 27) / 2, 'bars', 1);
        this.preloadBar.anchor.setTo(0, 0.5);
        this.load.setPreloadSprite(this.preloadBar);

        this.loadImages();

        this.load.spritesheet('faces', './assets/images/player/faces.png', 236, 236);
        this.load.spritesheet('collectibles', './assets/images/items.png', 140, 400);
        this.load.spritesheet('player', './assets/images/player/player-anims.png', 436, 436);
        this.load.spritesheet('animation-menu', './assets/images/player/animation-landing.png', 526, 526);

        this.load.spritesheet('play-button', './assets/images/ui/play-button.png', 629, 233);
        this.load.spritesheet('pause-button', './assets/images/ui/pause-button.png', 87, 76);
        this.load.spritesheet('rules-button', './assets/images/ui/rules-button.png', 448, 136);
    }

    create() {
        this.state.start('MainMenu');
    }

    loadImages() {
        // TODO: Move these to a data file
        const imageMap = {
            'background-game': './assets/images/background-game.png',
            'background-landing': './assets/images/background-landing.png',
            'game-over': './assets/images/gameover.png',
            'background-face': './assets/images/ui/background-face.png',
            'score-bar': './assets/images/ui/score-bar.png',
            frame: './assets/images/ui/frame.png',
            'food-bar': './assets/images/ui/food-bar.png',
            'drinks-bar': './assets/images/ui/drinks-bar.png'
        };

        Object.keys(imageMap).forEach((id) => {
            this.load.image(id, imageMap[id]);
        });
    }
}
