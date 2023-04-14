import Kernel from '../Kernel';
import IKernel from '../IKernel';
import ITimeHelper from './ITimeHelper';

/**
 * Contains methods that provide information related to time
 */
export default class TimeHelper implements ITimeHelper
{
    private _kernel:IKernel;
    
    /**
     * Constructor
     */
    constructor()
    {
        this._kernel = Kernel.getInstance();
    }
    
    /**
     * Calculates the amount of frames that will be rendered during a given amount of seconds (as this 
     * is based on a dynamic FPS, the returned value can only be considered an estimate).
     * @param seconds the amount of seconds
     * @returns the estimated amount of frames that will have been rendered during the given number of seconds
     */
    secondsToFrames(seconds:number):number
    {
        return Math.floor(seconds * this._kernel.fps);
    }

    /**
     * Calculates the amount of frames that will be rendered during a given amount of minutes (as this 
     * is based on a dynamic FPS, the returned value can only be considered an estimate).
     * @param minutes the amount of minutes
     * @returns the estimated amount of frames that will have been rendered during the given number of minutes
     */
    minutesToFrames(minutes:number):number
    {
        return this.secondsToFrames(minutes) * 60;
    }

    /**
     * Gets the total amount of seconds that the level has been active for
     * @returns the amount of seconds that the level has been active for
     */
    getTotalSeconds():number
    {
        return this.getTotalMilliseconds() / 1000;
    }

    /**
     * Gets the total amount of milliseconds that the level has been active for
     * @returns the amount of milliseconds that the level has been active for
     */
    getTotalMilliseconds():number
    {
        return this._kernel.totalLevelActiveMilliseconds;
    }
}