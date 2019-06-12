//these will only be estimates, as they are based on a dynamic fps (nevertheless, they have their uses)
function secondsToFrames(seconds)
{
    return Math.floor(seconds * kernel.fps);
}

function minutesToFrames(minutes)
{
    return secondsToFrames(minutes) * 60;
}

//these are more accurate
function getTotalSeconds()
{
    return kernel.totalTime / 1000;
}

function getTotalMilliseconds()
{
    return kernel.totalTime;
}