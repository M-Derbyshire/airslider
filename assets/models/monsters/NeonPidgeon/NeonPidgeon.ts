import { IDamageFlashImages } from '../../../HUDs/components/DamageFlash/DamageFlash';
import IBoundaryBox from '../../Model/IBoundaryBox';
import IModel from '../../Model/IModel';
import Monster from '../../Monster/Monster';
import Tarian from '../../Tarian/Tarian';

/**
 * The Neon Pidgeon monster (should be 2 in the level, at the same time)
 */
export default class NeonPidgeon extends Monster {
    
    private _playerModel:Tarian;
    private _topLevelMonster:boolean; // Is this pidgeon above another, on the y axis?
    private _nextDrop:number; // The next drop time (in milliseconds)
    
    /**
     * Is this pidgeon currently overlapping the player?
     */
    overlapping:boolean;
    
    /**
     * How much damage does this monster do?
     */
    damageDealt:number;
    
    /**
     * The color of the DamageFlash
     */
    color:keyof IDamageFlashImages;
    
    /**
     * A minimum span of time (in milliseconds) before the next drop
     */
    dropWaitOffset:number;
    
    /**
     * A span of time, in milliseconds.
     * This is the total amount that can be added to the dropWaitOffset, to get a new drop time.
     */
    dropWaitRange:number;
    
    /**
     * The amount of time (in milliseconds) the monster will wait before its initial drop
     */
    initialDropWait:number;
    
    
    
    /**
     * Constructor
     * @param playerModel the model of the player 
     * @param topLevelMonster is this pidgeon above another, on the y axis?
     */
    constructor(playerModel:Tarian, topLevelMonster:boolean = false)
    {
        super();
        
        this._playerModel = playerModel;
        this._topLevelMonster = topLevelMonster;
        
        this.overlapping = false;
        
        this.damageDealt = 10;
        this.color = "none";
    }
    
    load():void
    {
        super.load();
        
        const spritesheetPath = "/assets/models/monsters/NeonPidgeon/anim/neonPidgeon-spritesheet.png";
        this.assetsToUnload.push(spritesheetPath);
        
        this.animationManager.registerAnimations({
            falling: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 0, width: 337, height: 240 },
				],
            }),
            flapping: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 242, width: 337, height: 228 },
					{ x: 0, y: 471, width: 337, height: 228 },
					{ x: 0, y: 700, width: 337, height: 228 },
					{ x: 0, y: 929, width: 337, height: 228 },
					{ x: 0, y: 1158, width: 337, height: 228 },
					{ x: 0, y: 1387, width: 337, height: 228 },
					{ x: 0, y: 1616, width: 337, height: 228 },
					{ x: 0, y: 1845, width: 337, height: 228 },
				],
            }),
            rising: this.animationManager.createAnimation({
                sheetPath: spritesheetPath,
                fps: 24,
                drawWidth: 250,
                drawHeight: 200,
				frameCoordinates: [
					{ x: 0, y: 2074, width: 337, height: 240 },
				],
            }),
        });
        
    }
    
    prepare():void
    {
        super.prepare();
        
        this.actions = [
            this.moveSideways,
            this.drop,
            this.rise
        ];
        
        this.enterXSpeed = 90;
        this.exitXSpeed = 240;
        this.offScreenUnits = (this._topLevelMonster) ? 650 : 500;
        this.startY = (this._topLevelMonster) ? 150 : 250;
        this.startX = this.levelRightEdge + this.offScreenUnits;
        this.startZ = this._playerModel.z;
        this.ySpeed = 1250;
        this.dropWaitOffset = 2000; //2 seconds
        this.dropWaitRange = 2000; //2 seconds
        this.initialDropWait = 8000;
        
        this.reset();
    }
    
    // This is required to run the flapping sound effect while flapping, entering and exiting
    act():void
    {
        super.act();
        
        const flappingAnimation = this.animationManager.animations.flapping;
        
        // The frame index will always be 0 when off screen, as the animation won't be progressed (since the model won't be drawn),
        // so play the sound every time it's on the second frame
        if(this.state === "flapping" && flappingAnimation.currentFrameIndex === 1) 
            console.log("play sound right now");
    }
    
    // Collision boxes --------------------------------------------------------
    getBoundaryBoxes():IBoundaryBox[]
    {
        if(this.state === "falling")
        {
            return [
                {
                    x: this.x,
                    y: this.y + (this.height / 2.5),
                    z: this.z,
                    width: this.width,
                    height: this.height / 4
                },
                {
                    x: this.x + (this.width / 2.24),
                    y: this.y,
                    z: this.z,
                    width: this.width / 8,
                    height: this.height
                }
            ];
        }
        
        return [];
    }
    
    //entering and exiting and resetting-----------------------------------------
    
    enter():void
    {
        if(this.levelRightEdge < (this.x + this.width))
        {
            this.moveLeft(this.enterXSpeed);
        } else {
            this.entering = false;
            this._nextDrop = this.helpers.time.getTotalMilliseconds() + this.initialDropWait;
        }
    }
    
    exit():void
    {
        if(this.y != this.startY)
        {
            //if not at correct height, don't leave yet
            this.state = "rising";
            this.rise();
        } else {
            this.state = "flapping";
        
            this.moveLeft(this.exitXSpeed);
            
            if((this.x + this.width) < (this.levelLeftEdge - this.offScreenUnits))
            {
                this._handleMonsterExitingScreen();
            }
        }
    }
	
    /**
     * Handle the monster leaving the screen, on exit
     */
	private _handleMonsterExitingScreen():void
	{
		this.exiting = false;
    	this.active = false;
	}
	
    reset():void
    {
        this._nextDrop = -1;
        this.y = this.startY;
        this.x = this.startX;
        this.z = this.startZ;
        this.xSpeed = (this._topLevelMonster) ? -760 : -880;
        this.state = "flapping";
    }
    
    //movement-----------------------------------------------------
    
    /**
     * Handles the monster moving left and right
     */
    moveSideways():void
    {
        this.moveRight(this.xSpeed);
        
        this._handleMonsterOverlappingLevelEdges();
        
        if(this._nextDrop === -1)
        {
            this._nextDrop = this._getNextDropTime();
        } 
		else if(this._monsterShouldDrop())
        {
            this._startMonsterDrop();
        }
        
		//If this should be true, it will be set to true by neonPidgeonOverlappingEventAction, so end on this.
        this.overlapping = false;
    }
	
    /**
     * Starts the monster's drop
     */
	private _startMonsterDrop():void
	{
		this._nextDrop = -1;
        this.state = "falling";
        this.nextAction();
	}
	
    /**
     * Generates the next time to drop
     * @returns the next time (in milliseconds)
     */
	private _getNextDropTime():number
	{
		return this.helpers.time.getTotalMilliseconds() + 
									this.dropWaitOffset + 
									Math.floor(Math.random() * this.dropWaitRange);
	}
	
    /**
     * Should the monster drop?
     * @returns true if the monster should drop, false if not
     */
	private _monsterShouldDrop():boolean
	{
		return ((this.helpers.time.getTotalMilliseconds() >= this._nextDrop) && 
				!this.overlapping && 
            	((this.x + this.width >= this._playerModel.x) && 
				(this.x <= this._playerModel.x + this._playerModel.width)));
	}
	
    /**
     * Stops the monster from going outside the level's edges
     */
	private _handleMonsterOverlappingLevelEdges():void
	{
		if(this.x <= this.levelLeftEdge || this.x + this.width >= this.levelRightEdge)
        {
            this.xSpeed = -this.xSpeed;
            
            this.x = (this.xSpeed > 0) ? 
                (this.levelLeftEdge + 1) :
                ((this.levelRightEdge - this.width) - 1);
        }
	}
	
	
    /**
     * The monster diving down at the player
     */
    drop():void
    {
        this.moveDown(this.ySpeed);
    }
    
    /**
     * The monster rising back up
     */
    rise():void
    {
        this.moveUp(this.ySpeed);
        
        if(this.y <= this.startY)
        {
            this.y = this.startY;
            this.state = "flapping";
            this.nextAction();
        }
    }
    
    //events------------------------------------------------------------
    
    /**
     * Handles the pidgeon's x position overlapping the player's x position
     * @param otherModel the player model
     */
    neonPidgeonOverlappingEventAction(otherModel:IModel):void
    {
        this.overlapping = true;
    }
    
    /**
     * Handles collision with the player
     * @param otherModel the player model
     */
    hitPlayerOrGroundEventAction(otherModel:IModel):void
    {
        if(((this.y + this.height) > otherModel.y) && 
            (this.y + this.height < this.kernel.unitsWithinCamera))
        {
            //makes sure the player doesn't lose extra health if they collide from the side
            this.y = otherModel.y - this.height - 1;
        }
        
        if(this.state == "falling" )
        {
            this.state = "rising";
            this.nextAction();
        }
    }
}