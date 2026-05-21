import Obstacle from "../../../models/Obstacle/Obstacle";
import ObstacleManager from "./ObstacleManager";

/**
 * Manages the level's "obstacle" models, setting their X-axis positions and sending them down the road.
 * This manager is designed to handle "sweeping" obstacles, while also positioning "static" obstacles aimed
 * at the player's position
 */
export default class SweepAndAimObstacleManager<T extends Obstacle> extends ObstacleManager<T>
{
    private _nextSweeperPosition!:SweeperStartPosition; // Determines the position of the next sweeping obstacle
    
    /**
     * Resets the manager
     */
    reset():void
    {
        super.reset();
        
        this._nextSweeperPosition = SweeperStartPosition.Left;
        this.minObstacleCount = 1;
        this.zModifierAbsMax = 0;
    }
    
    /**
	 * Give the manager the obstacles for the level, seperated based on their
     * behaviour (you are required to provide enough obstacles for the
     * current line count that you have set).
	 * @param sweepingModels the obstacles that "sweep"
     * @param staticModels the obstacles that are "static"
	 */
    setSeperatedObstacleModels(sweepingModels:T[], staticModels:T[]):void
    {   
        // We are going to pop models out of these, so need to make a copy
        const sweepingModelsCopy = [...sweepingModels];
        const staticModelsCopy = [...staticModels];
        
        const requiredStaticCount = Math.ceil(sweepingModelsCopy.length / 2);
        
        if(staticModelsCopy.length < requiredStaticCount)
            throw new Error("not enough static obstacles provided. the static obstacle count should be at least half the sweeping obstacle count");
        
        const orderedObstacles:T[] = [];
        const totalLineCount = sweepingModelsCopy.length * 1.5; // 1 static for every 2 sweeping
        
        for(let i = 1; i <= totalLineCount; i++)
        {
            const useStatic = i % 3 === 0;
            
            const obstacle = useStatic
                ? staticModelsCopy.pop()
                : sweepingModelsCopy.pop();
            
            orderedObstacles.push(obstacle!);
        }
        
        super.setObstacleModels(orderedObstacles);
    }
    
    /**
	 * Sends another line of obstacles, if needed
	 */
    sendObstaclesIfReady():void
    {
        this._setZModifierAbsMax();
        super.sendObstaclesIfReady();
    }
    
    /**
     * Get the X positions for a line of obstacles
     * @returns the X positions (in units) that the obstacles should be placed at
     */
    protected getObstacleXPositionsForLine():number[]
    {
        const nextObstacle = this.obstacles[this.peekIndexForNextObstacle()];
        
        if(nextObstacle.mode === "static")
        {
            const obstacleHalfWidth = nextObstacle.width / 2;
            const playerHalfWidth = this.playerModel!.width / 2;
            
            // Center on the player's current position
            const desiredPosition = (this.playerModel!.x + playerHalfWidth) - obstacleHalfWidth;
            return [desiredPosition];
        }
        else if(this._nextSweeperPosition === SweeperStartPosition.Left)
        {
            this._nextSweeperPosition = SweeperStartPosition.Right;
            return [this.areaLeftEdge];
        }
        else
        {
            this._nextSweeperPosition = SweeperStartPosition.Left;
            return [this.areaRightEdge - this.obstacleWidth];
        }
    }
    
    /**
     * Modifies the zModifierAbsMax property, to improve the gameplay
     */
    private _setZModifierAbsMax():void
    {
        // We want to make it more likely that the player will be hit, if
        // they're standing still
        this.zModifierAbsMax = (this.playerModel!.xSpeed === 0) ? 100 : 0;
    }
}

/**
 * Possible starting positions for sweeping obstacles
 */
enum SweeperStartPosition {
    Right,
    Left
};