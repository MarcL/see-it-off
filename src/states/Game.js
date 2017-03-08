/* globals __DEV__ */
import Phaser from 'phaser';
import Mushroom from '../sprites/Mushroom';

export default class extends Phaser.State {
    create() {
        this.createBannerText();

        this.mushroom = new Mushroom({
            game: this,
            x: this.world.centerX,
            y: this.world.centerY,
            asset: 'mushroom',
        });

        this.game.add.existing(this.mushroom)
    }

    render() {
        console.log(this.game.time.fps);
        if (__DEV__) {
            this.game.debug.spriteInfo(this.mushroom, 32, 32);
        }
    }

    createBannerText() {
        const bannerText = 'Phaser + ES6 + Webpack';
        const banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText);
        banner.font = 'Bangers';
        banner.padding.set(10, 16);
        banner.fontSize = 40;
        banner.fill = '#77BFA3';
        banner.smoothed = false;
        banner.anchor.setTo(0.5);
    }
}
