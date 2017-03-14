import Phaser from 'phaser';
import WebFont from 'webfontloader';

export default class extends Phaser.State {
    init() {
        this.stage.backgroundColor = '#e6c499';
        this.fontsReady = false;
        this.fontsLoaded = this.fontsLoaded.bind(this);
    }

    create() {
        this.input.maxPointers = 1;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.refresh();
    }

    preload() {
        WebFont.load({
            custom: {
                families: ['eraserregular', 'dinregular']
            },
            active: this.fontsLoaded,
        });

        this.load.spritesheet('bars', './assets/images/ui/bars.png', 540, 66);
    }

    render() {
        if (this.fontsReady) {
            this.state.start('Splash');
        }
    }

    fontsLoaded() {
        this.fontsReady = true;
    }
}
