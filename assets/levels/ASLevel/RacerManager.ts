import Kernel from "../../../Kernel/Kernel";
import Racer from "../../models/Racer/Racer";
import { RacerColor } from "../../models/Racer/RacerColor";

/**
 * Manages the other racers on the track
 */
export default class RacerManager
{
    private _frontRacers: Racer[]; // The racers that start at the front of the grid
    private _backRacers: Racer[]; // The racers that start further back in the grid
    
    private _frontLaunchSpeed: number; // The z speed of the front racers, on launch
    private _backLaunchSpeed: number; // The z speed of the back racers, on launch
    
    private _leftEdge: number; // The left edge of the level's area
    private _rightEdge: number; // The right edge of the level's area
    private _levelWidth: number; // The width of the level's area
    
    private _lastColorChosen: RacerColor; // The last color chosen when setting the racer's color
    
    /**
     * Constructor
     */
    constructor()
    {
        this._frontLaunchSpeed = 150;
        this._backLaunchSpeed = -15;
        
        this._leftEdge = 0;
        this._rightEdge = Kernel.getInstance().unitsWithinCamera;
        this._levelWidth = this._rightEdge - this._leftEdge;
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
        this._frontRacers.forEach(r => r.zSpeed = this._frontLaunchSpeed);
        this._backRacers.forEach(r => r.zSpeed = this._backLaunchSpeed);
    }
    
    /**
     * Any action that should occur every frame
     */
    act()
    {
        const kernel = Kernel.getInstance();
        
        // Take any racers that have left the screen, and 
        // set them up to overtake the player on loss (or 
        // to follow behind the player on win)
        this._frontRacers.forEach(racer => {
            if(racer.z > kernel.helpers.zCalc.vanishingPointDepth)
                this._prepareRacerForOvertaking(racer);
        });
        
        this._backRacers.forEach(racer => {
            if(racer.z < 0)
                this._prepareRacerForOvertaking(racer);
        });
    }
    
    
    
    /**
     * Creates and populates the racers at the front of the grid
     */
    private _populateFrontRacers()
    {
        const levelQuarter = this._levelWidth / 4;
        const zPosition = 70;
        
        const leftRacer = new Racer(this._getRandomColor(), zPosition, levelQuarter);
        const centerRacer = new Racer(this._getRandomColor(), zPosition + 10, levelQuarter * 2);
        const rightRacer = new Racer(this._getRandomColor(), zPosition, levelQuarter * 3);
        
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
        
        const leftRacer = new Racer(this._getRandomColor(), zPosition, levelQuarter);
        const rightRacer = new Racer(this._getRandomColor(), zPosition, levelQuarter * 3);
        
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
    
    /**
     * Sets up a racer to be an overtaker on player loss (or to 
     * follow behind the racer on player win)
     */
    private _prepareRacerForOvertaking(racer: Racer)
    {
        racer.zSpeed = 0;
        racer.z = 0;
        racer.active = false;
    }
};