import 'pixi';
import 'p2';
import Phaser from 'phaser';

import BootState from './states/Boot';
import SplashState from './states/Splash';
import GameState from './states/Game';
import GameOverState from './states/GameOver';
import MainMenuState from './states/MainMenu';
import RulesState from './states/Rules';

import config from './config';

class Game extends Phaser.Game {

    constructor() {
        super(config.gameWidth, config.gameHeight, Phaser.CANVAS);

        this.state.add('Boot', BootState, false);
        this.state.add('Splash', SplashState, false);
        this.state.add('Game', GameState, false);
        this.state.add('GameOver', GameOverState, false);
        this.state.add('MainMenu', MainMenuState, false);
        this.state.add('Rules', RulesState, false);

        this.state.start('Boot');
    }
}

window.game = new Game();
