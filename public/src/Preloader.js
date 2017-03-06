Candy.Preloader = function(game){
	// define width and height of the game
	Candy.GAME_WIDTH = 640;
	Candy.GAME_HEIGHT = 960;
};
Candy.Preloader.prototype = {
	preload: function(){
		// set background color and preload image
		this.stage.backgroundColor = '#B4D9E7';
		this.preloadBar = this.add.sprite((Candy.GAME_WIDTH-311)/2, (Candy.GAME_HEIGHT-27)/2, 'preloaderBar');
        this.load.setPreloadSprite(this.preloadBar);

        this.loadImages();

		this.load.spritesheet('candy', 'img/candy.png', 82, 98);
		this.load.spritesheet('monster-idle', 'img/monster-idle.png', 103, 131);
		this.load.spritesheet('button-start', 'img/button-start.png', 401, 143);
        this.load.spritesheet('faces', 'img/player/faces.png', 256, 256);
	},
	create: function(){
		this.state.start('MainMenu');
	},
    loadImages: function() {
        var imageMap = {
            background: 'img/background.png',
		    floor: 'img/floor.png',
		    'monster-cover': 'img/monster-cover.png',
		    title: 'img/title.png',
		    'game-over': 'img/gameover.png',
		    'score-bg': 'img/score-bg.png',
		    'button-pause': 'img/button-pause.png',
            'player-neutral': 'img/player/tom-neutral.png',
            'player-drunk-1': 'img/player/tom-drunk-level-1.png',
            'player-drunk-2': 'img/player/tom-drunk-level-2.png',
            'player-drunk-3': 'img/player/tom-drunk-level-3.png',
        };

        var self = this;
        Object.keys(imageMap).forEach(function(id) {
            self.load.image(id, imageMap[id]);
        });
    }
};
