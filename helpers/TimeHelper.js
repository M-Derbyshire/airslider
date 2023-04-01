import Kernel from '/Kernel/kernel';

export default class TimeHelper
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
    }
    
    //these will only be estimates, as they are based on a dynamic fps (nevertheless, they have their uses)
    secondsToFrames(seconds)
    {
        return Math.floor(seconds * this.kernel.fps);
    }

    minutesToFrames(minutes)
    {
        return secondsToFrames(minutes) * 60;
    }

    //these are more accurate
    getTotalSeconds()
    {
        return this.kernel.totalLevelActiveMilliseconds / 1000;
    }

    getTotalMilliseconds()
    {
        return this.kernel.totalLevelActiveMilliseconds;
    }
}