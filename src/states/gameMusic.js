const initialise = (game) => {
    const music = game.add.audio('pause-music');
    music.loop = true;

    return music;
};

const start = (game, music) => {
    if (!music.isPlaying) {
        game.sound.setDecodedCallback([music], () => {
            music.play();
        }, this);
    }
};

const stop = (music) => {
    music.stop();
};

export {
    initialise,
    start,
    stop
};
