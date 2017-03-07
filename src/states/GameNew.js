/* globals __DEV__ */
import Phaser from 'phaser';
import Mushroom from '../sprites/Mushroom';

import config from '../config';

// TODO Move to a file
const gameConfig = {
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
            scale: 0.75,
        },
    },
};

export default class extends Phaser.State {
    init() {
        // define needed variables for this.Game
        this._player = null;
        this._candyGroup = null;
        this._spawnCandyTimer = 0;
        this._drinkTimer = 0;
        this._fontStyle = null;
        this._face = null;

        // define Candy variables to reuse them in this.item functions
        this._scoreText = null;
        this._score = 0;
        this._health = 0;
        this._cursors = null;
        this._facing = 'right';
        this._missedItems = 0;
        this._drinkAmount = 0;
        this._drinkAmountText = null;
        this._foodAmount = 0;
        this._foodAmountText = null;
    }

    create() {
        // start the physics engine
        this.physics.startSystem(Phaser.Physics.ARCADE);

        // set the global gravity
        this.physics.arcade.gravity.y = 200;

        // display images: background, floor and score
        this.add.sprite(0, 0, 'background');
        this.add.sprite(-30, config.gameHeight - 280, 'floor');
        this.add.sprite(10, 5, 'score-bg');

        // add pause button
        this.add.button(config.gameWidth - 96 - 10, 5, 'button-pause', this.managePause, this);

        // set font style
        this._fontStyle = {
            font: '40px Arial',
            fill: '#FFCC00',
            stroke: '#333',
            strokeThickness: 5,
            align: 'center',
        };
        // initialize the spawn timer
        this._spawnCandyTimer = 0;
        this._drinkTimer = 0;
        // initialize the score text with 0
        this._scoreText = this.add.text(120, 20, "0", this._fontStyle);
        this._drinkAmountText = this.add.text(120, 80, "0", this._fontStyle);
        // set health of the player
        this._health = 10;
        // create new group for candy
        this._candyGroup = this.add.group();

        this._missedItems = 0;

        // spawn first candy
        this.spawnCandy();

        this.initialisePlayer();
        this.initialiseUi();
    }

    managePause() {
        // pause the game
        this.game.paused = true;
        // add proper informational text
        const pausedText = this.add.text(100, 250, 'Game paused.\nTap anywhere to continue.', this._fontStyle);
        // set event listener for the user's click/tap the screen
        this.input.onDown.add(() => {
            // remove the pause text
            pausedText.destroy();
            // unpause the game
            this.game.paused = false;
        }, this);
    }

    update() {
        // update timer every frame
        this._spawnCandyTimer += this.time.elapsed;

        this.updatePlayer();
        this.updateObjects();
        this.updateFoodAndDrinkAmount();

        if (this._missedItems >= 3) {
            // show the game over message
            this.add.sprite((config.gameWidth - 594) / 2, (config.gameHeight - 271) / 2, 'game-over');

            // pause the game
            this.game.paused = true;
        }
    }

    updateObjects() {
        // if spawn timer reach one second (1000 miliseconds)
        if (this._spawnCandyTimer > 1000) {
            // reset it
            this._spawnCandyTimer = 0;
            // and spawn new candy
            this.spawnCandy();
        }

        // loop through all candy on the screen
        this._candyGroup.forEach((candy) => {
            // to rotate them accordingly
            candy.angle += candy.rotateMe;
        });

        this.physics.arcade.overlap(
            this._player,
            this._candyGroup,
            this.collideWithPlayer,
            null,
            this
        );
    }

    getDrunkSpeedMultiplier() {
        const drunkPercentage = this._drinkAmount / gameConfig.drinkMaximumAmount;
        const speedMultiplier = 1 - (drunkPercentage * gameConfig.playerMaxDragMultiplier);
        return speedMultiplier;
    }

    updatePlayer() {
        const speedMultiplier = this.getDrunkSpeedMultiplier();
        const moveSpeed = gameConfig.playerInitialMoveSpeed * speedMultiplier;
        this._player.body.velocity.x = 0;

        if (this._cursors.left.isDown) {
            this._player.body.velocity.x = -moveSpeed;

            if (this._facing != 'left') {
                this._facing = 'left';
                this._player.scale.x = -1;
            }
        } else if (this._cursors.right.isDown) {
            this._player.body.velocity.x = moveSpeed;

            if (this._facing != 'right') {
                this._facing = 'right';
                this._player.scale.x = 1;
            }
        }
    }

    initialisePlayer() {
        this._player = this.add.sprite(config.gameWidth * 0.5, gameConfig.playerYPosition, 'monster-idle');

        this._player.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10, true);
        this._player.animations.play('idle');

        this._cursors = this.game.input.keyboard.createCursorKeys();
        this.game.physics.enable(this._player, Phaser.Physics.ARCADE);
        this._player.body.allowGravity = false;
        this._player.body.collideWorldBounds = true;

        this._player.anchor.setTo(0.5, 0);
    }

    initialiseUi() {
        const uiFace = gameConfig.ui.face;
        this._face = this.add.sprite(uiFace.position[0], uiFace.position[1], 'faces');
        this._face.frame = 3;
        this._face.scale.x = uiFace.scale;
        this._face.scale.y = uiFace.scale;
    }

    collideWithPlayer(player, candy) {
       this.collectedCandy(candy);
    }

    updateFoodAndDrinkAmount() {
        this._drinkTimer += this.time.elapsed;
        if (this._drinkTimer > gameConfig.drinkDecrementTimeMilliSeconds) {
            this._drinkTimer = 0;

            this._drinkAmount -= gameConfig.drinkDecrementPerTimeUnit;
            if (this._drinkAmount < 0) {
                this._drinkAmount = 0;
            }

            // TODO Remove - Testing face frames
            this._face.frame += 1;
            this._face.frame = this._face.frame % 13;
        }

        this._drinkAmountText.setText(this._drinkAmount);
    }

    spawnCandy() {
        // calculate drop position (from 0 to game width) on the x axis
        const dropPos = Math.floor(Math.random() * config.gameWidth);

        // define the offset for every candy
        const dropOffset = [-27, -36, -36, -38, -48];

        // randomize candy type
        const candyType = Math.floor(Math.random() * 4);

        // create new candy
        const candy = this.add.sprite(dropPos, dropOffset[candyType], 'collectibles');
        candy.scale.x = 0.5;
        candy.scale.y = 0.5;

        // add new animation frame
        candy.animations.add('anim', [candyType], 10, true);
        // play the newly created animation
        candy.animations.play('anim');
        // enable candy body for physic engine
        this.physics.enable(candy, Phaser.Physics.ARCADE);

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
        candy.rotateMe = (Math.random() * 4) - 2;
        // add candy to the group
        this._candyGroup.add(candy);
    }

    collectedCandy(candy) {
        // kill the candy when it's clicked
        candy.kill();
        // add points to the score
        this._score += 1;
        // update score text
        this._scoreText.setText(this._score);

        // TODO Drink amount depends on item caught
        this._drinkAmount += 10;
        if (this._drinkAmount > gameConfig.drinkMaximumAmount) {
            this._drinkAmount = gameConfig.drinkMaximumAmount;
        }
    }

    removeCandy(candy) {
        // kill the candy
        candy.kill();
        this._health = 10;
        // decrease player's health
        // Candy._health -= 10;
        // Candy._missedItems += 1;
    }
}
