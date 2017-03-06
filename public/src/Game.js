var gameConfig = {
    drinkDecrementPerTimeUnit: 1,
    drinkDecrementTimeMilliSeconds: 1000,
    drinkMaximumAmount: 250,
    foodDecrementPerMove: 2,
    playerInitialMoveSpeed: 300,
    playerMaxDragMultiplier: 0.4,
    playerYPosition: 640,
    ui: {
        face: {
            position: [450, 740],
            scale: 0.75
        }
    }
};

Candy.Game = function(game) {
	// define needed variables for Candy.Game
	this._player = null;
	this._candyGroup = null;
	this._spawnCandyTimer = 0;
    this._drinkTimer = 0;
	this._fontStyle = null;
    this._face = null;

	// define Candy variables to reuse them in Candy.item functions
	Candy._scoreText = null;
	Candy._score = 0;
	Candy._health = 0;
    Candy._cursors = null;
    Candy._facing = 'right';
    Candy._missedItems = 0;
    Candy._drinkAmount = 0;
    Candy._drinkAmountText = null;
    Candy._foodAmount = 0;
    Candy._foodAmountText = null;
};

Candy.Game.prototype = {
	create: function(){
		// start the physics engine
		this.physics.startSystem(Phaser.Physics.ARCADE);
		// set the global gravity
		this.physics.arcade.gravity.y = 200;

		// display images: background, floor and score
		this.add.sprite(0, 0, 'background');
		this.add.sprite(-30, Candy.GAME_HEIGHT-280, 'floor');
		this.add.sprite(10, 5, 'score-bg');
		// add pause button
		this.add.button(Candy.GAME_WIDTH-96-10, 5, 'button-pause', this.managePause, this);

		// set font style
		this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
		// initialize the spawn timer
		this._spawnCandyTimer = 0;
        this._drinkTimer = 0;
		// initialize the score text with 0
		Candy._scoreText = this.add.text(120, 20, "0", this._fontStyle);
		Candy._drinkAmountText = this.add.text(120, 80, "0", this._fontStyle);
		// set health of the player
		Candy._health = 10;
		// create new group for candy
		this._candyGroup = this.add.group();
		// spawn first candy
		Candy.item.spawnCandy(this);

        Candy._missedItems = 0;

        this.initialisePlayer();
        this.initialiseUi();
	},
	managePause: function(){
		// pause the game
		this.game.paused = true;
		// add proper informational text
		var pausedText = this.add.text(100, 250, "Game paused.\nTap anywhere to continue.", this._fontStyle);
		// set event listener for the user's click/tap the screen
		this.input.onDown.add(function(){
			// remove the pause text
			pausedText.destroy();
			// unpause the game
			this.game.paused = false;
		}, this);
	},
	update: function(){
		// update timer every frame
		this._spawnCandyTimer += this.time.elapsed;

        this.updatePlayer();
        this.updateObjects();
        this.updateFoodAndDrinkAmount();

		if(Candy._missedItems >= 3) {
			// show the game over message
			this.add.sprite((Candy.GAME_WIDTH-594)/2, (Candy.GAME_HEIGHT-271)/2, 'game-over');
			// pause the game
			this.game.paused = true;
		}
	},
    updateObjects: function() {
		// if spawn timer reach one second (1000 miliseconds)
		if(this._spawnCandyTimer > 1000) {
			// reset it
			this._spawnCandyTimer = 0;
			// and spawn new candy
			Candy.item.spawnCandy(this);
		}

		// loop through all candy on the screen
		this._candyGroup.forEach(function(candy){
			// to rotate them accordingly
			candy.angle += candy.rotateMe;
		});

        this.physics.arcade.overlap(this._player, this._candyGroup, this.collideWithPlayer, null, this);
    },
    getDrunkSpeedMultiplier: function() {
        var drunkPercentage = Candy._drinkAmount / gameConfig.drinkMaximumAmount;
        var speedMultiplier = 1 - (drunkPercentage * gameConfig.playerMaxDragMultiplier);
        return speedMultiplier;
    },
    updatePlayer: function() {
        var speedMultiplier = this.getDrunkSpeedMultiplier();
        var moveSpeed = gameConfig.playerInitialMoveSpeed * speedMultiplier;
        this._player.body.velocity.x = 0;

        if (this._cursors.left.isDown)
        {
            this._player.body.velocity.x = -moveSpeed;

            if (Candy._facing != 'left')
            {
                Candy._facing = 'left';
                this._player.scale.x = -1;
            }
        }
        else if (this._cursors.right.isDown)
        {
            this._player.body.velocity.x = moveSpeed;

            if (Candy._facing != 'right')
            {
                Candy._facing = 'right';
                this._player.scale.x = 1;
            }
        }
    },
    initialisePlayer: function() {
		this._player = this.add.sprite(Candy.GAME_WIDTH * 0.5, gameConfig.playerYPosition, 'monster-idle');

		this._player.animations.add('idle', [0,1,2,3,4,5,6,7,8,9,10,11,12], 10, true);
		this._player.animations.play('idle');

        this._cursors = this.game.input.keyboard.createCursorKeys();
		this.game.physics.enable(this._player, Phaser.Physics.ARCADE);
        this._player.body.allowGravity = false;
        this._player.body.collideWorldBounds = true;

        this._player.anchor.setTo(0.5, 0);
    },
    initialiseUi: function() {
        var uiFace = gameConfig.ui.face;
//        this._face = this.add.sprite(uiFace.position[0], uiFace.position[1], 'player-drunk-3');
        this._face = this.add.sprite(uiFace.position[0], uiFace.position[1], 'faces');
        this._face.frame = 3;
        this._face.scale.x = uiFace.scale;
        this._face.scale.y = uiFace.scale;
    },
    collideWithPlayer: function(player, candy) {
        Candy.item.collectedCandy(candy);
    },
    updateFoodAndDrinkAmount: function() {
		this._drinkTimer += this.time.elapsed;
        if (this._drinkTimer > gameConfig.drinkDecrementTimeMilliSeconds) {
            this._drinkTimer = 0;

            Candy._drinkAmount -= gameConfig.drinkDecrementPerTimeUnit;
            if (Candy._drinkAmount < 0) {
                Candy._drinkAmount = 0;
            }

            // TODO Remove - Testing face frames
            this._face.frame += 1;
            this._face.frame = this._face.frame % 13;
        }

		Candy._drinkAmountText.setText(Candy._drinkAmount);
    }
};

Candy.item = {
	spawnCandy: function(game){
		// calculate drop position (from 0 to game width) on the x axis
		var dropPos = Math.floor(Math.random()*Candy.GAME_WIDTH);
		// define the offset for every candy
		var dropOffset = [-27,-36,-36,-38,-48];
		// randomize candy type
		var candyType = Math.floor(Math.random()*4);
		// create new candy
		var candy = game.add.sprite(dropPos, dropOffset[candyType], 'collectibles');
        candy.scale.x = 0.5;
        candy.scale.y = 0.5;

		// add new animation frame
		candy.animations.add('anim', [candyType], 10, true);
		// play the newly created animation
		candy.animations.play('anim');
		// enable candy body for physic engine
		game.physics.enable(candy, Phaser.Physics.ARCADE);
		// enable candy to be clicked/tapped
		candy.inputEnabled = true;
		// add event listener to click/tap
		candy.events.onInputDown.add(this.collectedCandy, this);
		// be sure that the candy will fire an event when it goes out of the screen
		candy.checkWorldBounds = true;
		// reset candy when it goes out of screen
		candy.events.onOutOfBounds.add(this.removeCandy, this);
		// set the anchor (for rotation, position etc) to the middle of the candy
		candy.anchor.setTo(0.5, 0.5);
		// set the random rotation value
		candy.rotateMe = (Math.random()*4)-2;
		// add candy to the group
		game._candyGroup.add(candy);
	},
	collectedCandy: function(candy){
		// kill the candy when it's clicked
		candy.kill();
		// add points to the score
		Candy._score += 1;
		// update score text
		Candy._scoreText.setText(Candy._score);

        // TODO Drink amount depends on item caught
        Candy._drinkAmount += 10;
        if (Candy._drinkAmount > gameConfig.drinkMaximumAmount) {
            Candy._drinkAmount = gameConfig.drinkMaximumAmount;
        }
	},
	removeCandy: function(candy){
		// kill the candy
		candy.kill();
		// decrease player's health
		// Candy._health -= 10;
        // Candy._missedItems += 1;
	},
};
