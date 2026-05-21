import ModelAnimationsManager from "../../../Kernel/entities/Model/ModelAnimationsManager/ModelAnimationsManager";
import Kernel from "../../../Kernel/Kernel";
import Racer from "../../models/Racer/Racer";
import { RacerColor } from "../../models/Racer/RacerColor";
import ASLevel from "./ASLevel";

/**
 * Manages the other racers on the track
 */
export default class RacerManager
{
    private _frontRacers: Racer[]; // The racers that start at the front of the grid
    private _backRacers: Racer[]; // The racers that start further back in the grid
    
    private _frontLaunchSpeedMin: number; // The min z speed of the front racers, on launch
    private _frontLaunchSpeedMax: number; // The max z speed of the front racers, on launch
    private _backLaunchSpeed: number; // The z speed of the back racers, on launch
    
    private _leftEdge: number; // The left edge of the level's area
    private _rightEdge: number; // The right edge of the level's area
    private _levelWidth: number; // The width of the level's area
    
    private _lastColorChosen?: RacerColor; // The last color chosen when setting the racer's color
    
    private _overtakingSequenceStarted: boolean; // Has the overtaking sequence started?
    private _overtakingInitialGap: number; // The gap (on the z axis) between the first overtaker, and the screen
    private _overtakingRacerGap: number; // The gap (on the z axis) between the racers when overtaking
    private _overtakingSpeed: number; // The speed that racers overtake at
    
    /**
     * Constructor
     */
    constructor()
    {
        this._frontLaunchSpeedMin = 150;
        this._frontLaunchSpeedMax = 200;
        this._backLaunchSpeed = -15;
        
        this._leftEdge = 0;
        this._rightEdge = Kernel.getInstance().settings.unitsWithinCameraX;
        this._levelWidth = this._rightEdge - this._leftEdge;
        
        this._overtakingInitialGap = 1000;
        this._overtakingRacerGap = 100;
        this._overtakingSpeed = 500;
        this._overtakingSequenceStarted = false;
        
        this._frontRacers = [];
        this._backRacers = [];
    }
    
    /**
     * Creates and returns the racer models
     */
    getModels():Racer[]
    {
        this._populateFrontRacers();
        this._populateBackRacers();
        
        return [
            ...this._frontRacers,
            ...this._backRacers
        ];
    }
    
    /**
     * Triggers the race launch sequence
     */
    startLaunchSequence()
    {
        this._frontRacers.forEach(r => r.zSpeed =this._getRandomLaunchSpeed(this._frontLaunchSpeedMin, this._frontLaunchSpeedMax));
        this._backRacers.forEach(r => r.zSpeed = this._backLaunchSpeed);
    }
    
    /**
     * Triggers the overtake sequence on player loss (or following 
     * behind the player on player win)
     */
    startOvertakeSequence()
    {
        this._overtakingSequenceStarted = true;
        
        const allRacers = [
            ...this._frontRacers,
            ...this._backRacers
        ];
        
        let nextZPosition = -this._overtakingInitialGap;
        
        allRacers.forEach(racer => {
            racer.active = true;
            racer.zSpeed = this._overtakingSpeed;
            racer.z = nextZPosition;
            
            nextZPosition -= this._overtakingRacerGap;
        });
    }
    
    /**
     * Prepare the manager on level start/restart
     */
    prepare()
    {
        this._overtakingSequenceStarted = false;
    }
    
    /**
     * Any action that should occur every frame
     */
    act()
    {
        const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        
        // Take any racers that have left the screen, and 
        // set them up to overtake the player on loss (or 
        // to follow behind the player on win)
        this._frontRacers.forEach(racer => {
            if(!this._overtakingSequenceStarted && racer.z > vanishingPointDepth)
                this._prepareRacerForOvertaking(racer);
        });
        
        this._backRacers.forEach(racer => {
            if(!this._overtakingSequenceStarted && racer.z < 0)
                this._prepareRacerForOvertaking(racer);
        });
        
        if(this._overtakingSequenceStarted)
        {
            [...this._frontRacers, ...this._backRacers].forEach(racer => {
                if(racer.z > vanishingPointDepth)
                    racer.active = false;
            });
        }
    }
    
    
    
    
    /**
     * Creates and populates the racers at the front of the grid
     */
    private _populateFrontRacers()
    {
        const levelQuarter = this._levelWidth / 4;
        const zPosition = 70;
        
        const leftRacer = new Racer(new ModelAnimationsManager(), this._getRandomColor(), zPosition, levelQuarter);
        const centerRacer = new Racer(new ModelAnimationsManager(), this._getRandomColor(), zPosition + 10, levelQuarter * 2);
        const rightRacer = new Racer(new ModelAnimationsManager(), this._getRandomColor(), zPosition, levelQuarter * 3);
        
        this._frontRacers = [
            leftRacer,
            centerRacer,
            rightRacer
        ];
    }
    
    /**
     * Creates and populates the racers further back in the grid
     */
    private _populateBackRacers()
    {
        const levelQuarter = this._levelWidth / 4;
        const zPosition = 10;
        
        const leftRacer = new Racer(new ModelAnimationsManager(), this._getRandomColor(), zPosition, levelQuarter);
        const rightRacer = new Racer(new ModelAnimationsManager(), this._getRandomColor(), zPosition, levelQuarter * 3);
        
        this._backRacers = [
            leftRacer,
            rightRacer
        ];
    }
    
    /**
     * Gets a random color for a racer (wont select the last one chosen)
     */
    private _getRandomColor(): RacerColor
    {
        const colors = [
            RacerColor.Blue,
            RacerColor.Red,
            RacerColor.Yellow
        ].filter(color => color !== this._lastColorChosen);
        
        const choiceIndex = Math.round(Math.random() * (colors.length - 1));
        const chosenColor = colors[choiceIndex];
        
        this._lastColorChosen = chosenColor;
        return chosenColor;
    }
    
    private _getRandomLaunchSpeed(min:number, max:number):number {
        const range = max - min;
        
        return Math.round(Math.random() * range) + min;
    }
    
    /**
     * Sets up a racer to be an overtaker on player loss (or to 
     * follow behind the player on player win)
     */
    private _prepareRacerForOvertaking(racer: Racer)
    {
        racer.zSpeed = 0;
        racer.z = 0;
        racer.active = false;
    }
};