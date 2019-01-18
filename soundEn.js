class SoundEn{
    constructor()
    {
        this.music;
        this.musicIsPlaying = false;
    }
    
    run()
    {
        //any extra sound code that needs to run in the loop can be placed in here
        
        //here temporarly. will be handled by the level
        if(kernel.assetsStillLoading == 0 && !this.musicIsPlaying && kernel.level.framesPassed >= kernel.fps)
        {
            kernel.soundEn.playMusic();
        }
        //console.log(kernel.assetsStillLoading);
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
}