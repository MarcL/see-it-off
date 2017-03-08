import 'pixi';
import 'p2';
import Phaser from 'phaser';

import BootState from './states/Boot';
import SplashState from './states/Splash';
import GameState from './states/GameNew';
import MainMenuState from './states/MainMenu';

import config from './config';

class Game extends Phaser.Game {

    constructor() {
        super(config.gameWidth, config.gameHeight, Phaser.AUTO);

        this.state.add('Boot', BootState, false);
        this.state.add('Splash', SplashState, false);
        this.state.add('Game', GameState, false);
        this.state.add('MainMenu', MainMenuState, false);

        this.state.start('Boot');
    }
}

window.game = new Game();
