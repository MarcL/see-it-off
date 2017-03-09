import Phaser from 'phaser';
import WebFont from 'webfontloader';

export default class extends Phaser.State {
    init() {
        this.stage.backgroundColor = '#add';
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
            google: {
                families: ['Bangers'],
            },
            active: this.fontsLoaded,
        });

        this.load.image('preloaderBar', './assets/images/loading-bar.png');
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
