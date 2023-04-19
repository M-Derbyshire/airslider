import ASModel from '../ASModel/ASModel';
import Sign from '../Sign/Sign';

/**
 * A starting light display, to be "attached" to a starting sign
 */
export default class SignDisplay extends ASModel 
{
    private _sign:Sign;
    private _lastLightChangeMS:number;
    private _lightChangeWaitMS:number;
    private _lightChangeStartWaitMS:number;
    
    /**
     * Constructor
     * @param sign the Sign that this display is "attached" to
     */
    constructor(sign:Sign)
    {
        super();
        
        this._sign = sign;
        
        this._lastLightChangeMS = 0; // the millisecond count when the light sequence last changed
        this._lightChangeWaitMS = 1000; // how long does the light sequence wait before changing (milliseconds)
        this._lightChangeStartWaitMS = 3000; // how long before the light sequence starts (milliseconds)
    }
    
    load():void
    {
        super.load();
        
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
            })
        });
    }
    
    prepare():void
    {
        super.prepare();
        this.x = 325;
        this.y = 115;
        this.state = "off";
        this.active = true;
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
     * Should the lights change to the next part of the sequence? (off, one, two, three, go)
     * @returns true if the lights should change, false if not
     */
    private _lightsShouldChangeToNext():boolean
    {
        const changeWaitMS = (this.state === "off") ? this._lightChangeStartWaitMS : this._lightChangeWaitMS;
        
        return (
            this.state !== "go" && 
            this.helpers.time.getTotalMilliseconds() >= (this._lastLightChangeMS + changeWaitMS)
        );
    }
    
    /**
     * Changes the lights to the next phase of the sequence (off, one, two, three, go)
     */
    private _changeToNextLightState():void
    {
        this._lastLightChangeMS = this.helpers.time.getTotalMilliseconds();
        
        switch(this.state)
        {
            case "off":
                this.state = "one";
                break;
            case "one":
                this.state = "two";
                break;
            case "two":
                this.state = "three";
                break;
            case "three":
                this.state = "go";
        }
    }
}