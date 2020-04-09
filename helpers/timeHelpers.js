class TimeHelpers
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
        return this.kernel.totalActiveMilliseconds / 1000;
    }

    getTotalMilliseconds()
    {
        return this.kernel.totalActiveMilliseconds;
    }
}