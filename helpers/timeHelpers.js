function secondsToFrames(seconds)
{
    return seconds * kernel.fps;
}

function minutesToFrames(minutes)
{
    return secondsToFrames(minutes) * 60;
}