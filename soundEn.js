class SoundEn{
    constructor()
    {
        this._music;
        this._musicIsPlaying = false;
    }
    
    //getters and setters -----------------------------------
    set musicRef(ref)
    {
        this._music = kernel.loadedAssets[ref][1];
    }
    
    set musicRepeat(repeat)
    {
        this._music.loop = repeat;
    }
    
    get musicIsPlaying() {return this._musicIsPlaying;}
    //-------------------------------------------------------
    
    run()
    {
        //any extra sound code that needs to run in the loop can be placed in here
    }
    
    playMusic()
    {
        this._music.play();
        this._musicIsPlaying = true;
    }
    
    pauseMusic()
    {
        this._music.pause();
        this._musicIsPlaying = false;
    }
    
    stopMusic()
    {
        this._music.pause();
        this._music.currentTime = 0;
        this._musicIsPlaying = false;
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