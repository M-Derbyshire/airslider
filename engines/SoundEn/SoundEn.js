import Kernel from '/Kernel/kernel';

export default class SoundEn{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        
        this._music;
        this._musicIsPlaying = false;
    }
    
    //getters and setters -----------------------------------
    set musicRef(ref)
    {
        this._music = this.kernel.loadedAssets[ref].asset;
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
        this.kernel.loadedAssets[ref].asset.currentTime = 0;
        this.kernel.loadedAssets[ref].asset.loop = loop;
        this.kernel.loadedAssets[ref].asset.play();
    }
    
    stopSound(ref)
    {
        //sound position will be reset in playSound() method
        this.kernel.loadedAssets[ref].asset.pause();
    }
}