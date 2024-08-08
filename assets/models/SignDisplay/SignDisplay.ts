import Kernel from '../../../Kernel/Kernel';
import ASModel from '../ASModel/ASModel';
import IModelAnimationsManager from '../Model/ModelAnimationsManager/IModelAnimationsManager';
import Sign from '../Sign/Sign';

/**
 * A starting light display, to be "attached" to a starting sign
 */
export default class SignDisplay extends ASModel 
{
    private _sign:Sign; // The Sign that this is attached to
    
    private _lightChangeStartWaitMS:number; // How long before the light sequence starts (in milliseconds)
    private _lightChangeWaitMS:number; // How many millseconds should the sign wait between each light change?
    private _lastLightChangeMS:number; // The milliseconds since the lights last changed
    private _finalLightChangeWaitMS:number; // The milliseconds the end of the light sequence will last, before state changes to "finished"
    
    private _countdownBeep:HTMLAudioElement; // The beep sound effect, whenever the lights change
    private _startBeep:HTMLAudioElement; // The "go" beep sound, to be played on the last light change
    
    /**
     * Constructor
     * @param sign the Sign that this display is "attached" to
     */
    constructor(sign:Sign)
    {
        super();
        
        this._sign = sign;
        
        this._finalLightChangeWaitMS = 500; 
        this._lightChangeStartWaitMS = 3000;
    }
    
    load(animationManager:IModelAnimationsManager):void
    {
        super.load(animationManager);
        
        const kernel = Kernel.getInstance();
        
        // Not adding these to assetsToUnload, as every level needs this
        this._countdownBeep = kernel.loadAudio("/assets/models/SignDisplay/sounds/countdown_beep.mp3");
        this._startBeep = kernel.loadAudio("/assets/models/SignDisplay/sounds/countdown_go.mp3");
        
        const sheetPath = "/assets/models/SignDisplay/anim/display_open_spritesheet.png";
        
        const width = 527;
        const height = 113;
        const drawWidth = 350;
        const drawHeight = 125;
        
        this.animationManager.registerAnimations({
            off: this.animationManager.createAnimation({
                sheetPath,
                frameCoordinates: [
                    { x: 0, y: 0, width, height }
                ],
                fps: 1,
                drawWidth,
                drawHeight
            }),
            one: this.animationManager.createAnimation({
                sheetPath,
                frameCoordinates: [
                    { x: 0, y: 114, width, height }
                ],
                fps: 1,
                drawWidth,
                drawHeight
            }),
            two: this.animationManager.createAnimation({
                sheetPath,
                frameCoordinates: [
                    { x: 0, y: 228, width, height }
                ],
                fps: 1,
                drawWidth,
                drawHeight
            }),
            three: this.animationManager.createAnimation({
                sheetPath,
                frameCoordinates: [
                    { x: 0, y: 342, width, height }
                ],
                fps: 1,
                drawWidth,
                drawHeight
            }),
            go: this.animationManager.createAnimation({
                sheetPath,
                frameCoordinates: [
                    { x: 0, y: 456, width, height }
                ],
                fps: 1,
                drawWidth,
                drawHeight
            }),
            finished: this.animationManager.createAnimation({
                sheetPath,
                frameCoordinates: [
                    { x: 0, y: 456, width, height }
                ],
                fps: 1,
                drawWidth,
                drawHeight
            }),
        });
    }
    
    prepare():void
    {
        super.prepare();
        
        const kernel = Kernel.getInstance();
        
        this.x = 325;
        this.y = 115;
        
        this.state = "off";
        this.active = true;
        
        kernel.soundEngine.forceLoad(this._countdownBeep);
        kernel.soundEngine.forceLoad(this._startBeep);
        
        this._lastLightChangeMS = 0;
        this._lightChangeWaitMS = 1500;
    }
    
    act():void
    {
        this._setZPosition();
        
        if(this._lightsShouldChangeToNext())
            this._changeToNextLightState();
        
        if(this.z < 0)
            this.active = false;
    }
    
    /**
     * Sets the z position, based on the Sign's z position
     */
    private _setZPosition():void
    {
        this.z = this._sign.z - 1;
    }
    
    /**
     * Should the lights change to the next part of the sequence?
     * @returns true if the lights should change, false if not
     */
    private _lightsShouldChangeToNext():boolean
    {
        let changeWaitMS:number;
        
        if(this._lastLightChangeMS < this._lightChangeStartWaitMS)
            changeWaitMS = this._lightChangeStartWaitMS;
        else if(this.state === "go")
            changeWaitMS = this._finalLightChangeWaitMS;
        else
            changeWaitMS = this._lightChangeWaitMS;
        
        const totalActiveMS = Kernel.getInstance().helpers.time.getTotalMilliseconds();
        
        return (
            this.state !== "finish" && 
            totalActiveMS >= (this._lastLightChangeMS + changeWaitMS)
        );
    }
    
    /**
     * Changes the lights to the next phase of the sequence
     */
    private _changeToNextLightState():void
    {
        const kernel = Kernel.getInstance();
        
        this._lastLightChangeMS = kernel.helpers.time.getTotalMilliseconds();
        
        switch(this.state)
        {
            case "off":
                this.state = "one";
                kernel.soundEngine.playSound(this._countdownBeep);
                break;
            case "one":
                this.state = "two";
                kernel.soundEngine.playSound(this._countdownBeep);
                break;
            case "two":
                this.state = "three";
                kernel.soundEngine.playSound(this._countdownBeep);
                break;
            case "three":
                this.state = "go";
                kernel.soundEngine.playSound(this._startBeep);
                break;
            case "go":
                this.state = "finished";
        }
    }
}