secondsToFrames(seconds)
{
    return seconds * kernel.fps;
}

minutesToFrames(minutes)
{
    return secondsToFrames(minutes) * 60;
}