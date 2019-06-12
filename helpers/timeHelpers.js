function secondsToFrames(seconds)
{
    return Math.floor(seconds * kernel.fps);
}

function minutesToFrames(minutes)
{
    return secondsToFrames(minutes) * 60;
}