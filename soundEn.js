class SoundEn{
    constructor()
    {
        this.music;
        this.musicIsPlaying = false;
    }
    
    run()
    {
        //any extra sound code that needs to run in the loop can be placed in here
    }
    
    setMusic(ref, loop = false)
    {
        this.music = kernel.loadedAssets[ref][1];
        this.music.loop = loop;
    }
    
    playMusic()
    {
        this.music.play();
        this.musicIsPlaying = true;
    }
    
    pauseMusic()
    {
        this.music.pause();
        this.musicIsPlaying = false;
    }
    
    stopMusic()
    {
        this.music.pause();
        this.music.currentTime = 0;
        this.musicIsPlaying = false;
    }
    
    playSound(ref, loop = false)
    {
        //position needs to be reset so sounds will restart
        //if they're triggered mid-way through playing
        kernel.loadedAssets[ref][1].currentTime = 0;
        kernel.loadedAssets[ref][1].loop = loop;
        kernel.loadedAssets[ref][1].play();
    }
    
    stopSound(ref)
    {
        //sound position will be reset in playSound() method
        kernel.loadedAssets[ref][1].pause();
    }
}