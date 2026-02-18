import IModelAnimationsManager from "../../../../../Kernel/entities/Model/ModelAnimationsManager/IModelAnimationsManager";
import Kernel from "../../../../../Kernel/Kernel";
import ASLevel from "../../../../levels/ASLevel/ASLevel";
import Jellyfish from "../../Jellyfish/Jellyfish";
import { IIntroObstacle } from "../types";

/**
 * A version of the Jellyfish obstacle that is used to introduce the jellyfish 
 * to the player (entering the level in a way that allows the player to 
 * see what they are)
 */
export default class IntroJellyfish extends Jellyfish implements IIntroObstacle
{
    private _endXPosition:number; // The x-axis position where the movement will end
    
    /**
     * Constructor
     * @param modelAnimationsManager manages the animations for the model
     */
    constructor(modelAnimationsManager:IModelAnimationsManager)
    {
        super(modelAnimationsManager, "static", 0, 0);
        
        this._endXPosition = 0;
    }
    
    prepare():void {
        super.prepare();
        
        const { leftEdge, rightEdge } = Kernel.getInstance().level as ASLevel;
        
        const startPositionOffset = 300;
        
        this.z = 40;
        this.x = leftEdge - startPositionOffset;
        this._endXPosition = rightEdge + startPositionOffset;
        
        this.xSpeed = 75;
    }
    
    act():void {
        this.moveRight();
        
        if(this.x >= this._endXPosition)
            this.active = false;
    }
    
    /**
     * Starts the intro sequence
     */
    start():void {
        this.active = true;
    }
    
    // Overriding this, as we don't want to react to the obstacle being outside the game area
    checkForExtraEvents():void {}
};