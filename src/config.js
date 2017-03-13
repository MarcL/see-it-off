export default {
    gameWidth: 1080,
    gameHeight: 1613,
    images: {
        'background-game': './assets/images/background-game.png',
        'background-landing': './assets/images/background-landing.png',
        'background-face': './assets/images/ui/background-face.png',
        'background-game-over': './assets/images/ui/background-face-game-over.png',
        'score-bar': './assets/images/ui/score-bar.png',
        frame: './assets/images/ui/frame.png',
        'food-bar': './assets/images/ui/food-bar.png',
        'drinks-bar': './assets/images/ui/drinks-bar.png',
        'black-background': './assets/images/ui/black-background.png',
        spit: './assets/images/player/spit.png'
    },
    rules: {
        drinkDecrementPerTimeUnit: 2,
        drinkDecrementTimeMilliSeconds: 500,
        drinkMinimumAmount: -250,
        drinkMaximumAmount: 250,
        foodDecrementPerMove: 4,
        foodMinimumAmount: -250,
        foodMaximumAmount: 250,
        playerInitialMoveSpeed: 500,
        playerMaxDragMultiplier: 0.6,
        playerYPosition: 860,
        minimumSpawnTime: 1200,
        maximumSpawnTime: 2500,
    },
    gravity: 400,
    player: {
        mouthOffset: 180
    }
};
