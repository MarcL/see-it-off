import Phaser from 'phaser';

import config from '../config';

export default class extends Phaser.State {
    preload() {
        this.stage.backgroundColor = '#225d6b';
        this.preloadBar = this.add.sprite((config.gameWidth - 500) / 2, config.gameHeight / 2, 'bars', 1);
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
        this.load.spritesheet('try-again-button', './assets/images/ui/try-again-button.png', 628, 234);
        this.load.spritesheet('resume-button', './assets/images/ui/resume-button.png', 628, 233);
        this.load.spritesheet('quit-button', './assets/images/ui/quit-button.png', 447, 136);
        this.load.spritesheet('close-button', './assets/images/ui/close-button.png', 148, 135);
    }

    create() {
        this.state.start('MainMenu');
    }

    loadImages() {
        const imageMap = config.images;
        Object.keys(imageMap).forEach((id) => {
            this.load.image(id, imageMap[id]);
        });
    }
}
