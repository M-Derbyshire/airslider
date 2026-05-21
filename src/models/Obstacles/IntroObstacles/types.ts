/**
 * A special version of an obstacle that is use to introduce the 
 * obstacle to the player (giving them enough time to see what it is)
 */
interface IIntroObstacle {
    /**
     * Starts the intro sequence
     */
    start():void
}

export { IIntroObstacle };