import Kernel from '../Kernel';

/**
 * Contains methods that provide information related to time
 */
export default class TimeHelper
{
    /**
     * Calculates the amount of frames that will be rendered during a given amount of seconds (as this 
     * is based on a dynamic FPS, the returned value can only be considered an estimate).
     * @param seconds the amount of seconds
     * @returns the estimated amount of frames that will have been rendered during the given number of seconds
     */
    static secondsToFrames(seconds:number):number
    {
        return Math.floor(seconds * Kernel.getInstance().fps);
    }

    /**
     * Calculates the amount of frames that will be rendered during a given amount of minutes (as this 
     * is based on a dynamic FPS, the returned value can only be considered an estimate).
     * @param minutes the amount of minutes
     * @returns the estimated amount of frames that will have been rendered during the given number of minutes
     */
    static minutesToFrames(minutes:number):number
    {
        return this.secondsToFrames(minutes) * 60;
    }
};