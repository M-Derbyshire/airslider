import Kernel from "../../../../../Kernel/Kernel";
import ASLevel from "../../../../levels/ASLevel/ASLevel";
import GangMember from "../../GangMember/GangMember";
import { IIntroObstacle } from "../types";

/**
 * A version of the GangMember obstacle that is used to introduce the GangMember 
 * to the player (entering the level in a slow way that allows the player to 
 * see what it is). The gang-members are introduced to the player in a group
 * of 3.
 * 
 * These models can either be a "leader", or a "follower". The leader controls
 * the whole group, setting the position values for the followers. The followers
 * mostly do nothing (except when they have collided with the player). The leader
 * is at the front of the group, and the 2 followers are behind him (on either side)
 */
export default class IntroGangMember extends GangMember implements IIntroObstacle
{
    // If this is true, the model is leading the group of gang members (if false, it's following the leader)
    private _isLeader:boolean;
    
    // If this model is the leader, these will need to be defined. The leading gang-member will control the
    // positions of these gang-members, so that they are following him
    private _leftFollower:IntroGangMember;
    private _rightFollower:IntroGangMember;
    
    // This determines the current behaviour of the (leader) obstacle
    private _status:"inFarDistance"|"inDistance"|"sweeping";
    
    private _sweepingXSpeed:number; // The speed of the X-axis movement, when the model is sweeping
    
    constructor(isLeader:boolean, leftFollower?:IntroGangMember, rightFollower?:IntroGangMember)
    {
        super("static", 0);
        
        this._isLeader = isLeader;
        
        const missingFollowers = !leftFollower || !rightFollower;
        if(isLeader && missingFollowers)
            throw new Error("IntroGangMember is set to be leader, but not all followers have been provided");
        
        this._leftFollower = leftFollower;
        this._rightFollower = rightFollower;
    }
    
    prepare(): void
    {
        super.prepare();
        
        this.active = false;
        this.hasCollidedWithPlayer = false;
        
        if(this._isLeader) {
            const level = Kernel.getInstance().level as ASLevel;
            
            const levelCenter = (level.rightEdge - level.leftEdge) / 2;
            this.x = levelCenter - (this.width / 2);
            
            this.z = level.vanishingPointDepth;
            
            this._status = "inFarDistance";
            this.speedModifier = 10;
            this._sweepingXSpeed = 150;
        }
    }
    
    act():void
    {
        if(!this._isLeader) {
            if(this.hasFallen())
                super.act();
            
            return;
        }
        
        this._setCorrectBehaviour();
        
        super.act();
        
        if(this._status === "sweeping")
            this._sweepMovement();
        
        this._correctFollowerPositions();
    }
    
    /**
     * Starts the intro sequence
     */
    start():void {
        this.active = true;
    }
    
    // Overriding this, as we don't want to react to the obstacle leaving the game area
    extraEvents():void {}
    
    /**
     * Sets the correct speeds and behaviours, based on the current Z-axis position
     */
    private _setCorrectBehaviour():void {
        const vanishingPointDepth = (Kernel.getInstance().level as ASLevel).vanishingPointDepth;
        
        const veryDistantZPosition = vanishingPointDepth * 0.5;
        if(this._status === "inFarDistance" && this.z < veryDistantZPosition) {
            this.speedModifier = 30;
            this._status = "inDistance";
            return;
        }
        
        const distantZPosition = vanishingPointDepth * 0.35;
        if (this._status === "inDistance" && this.z < distantZPosition) {
            this.speedModifier = 40;
            this._status = "sweeping";
        }
    }
    
    /**
     * Controls the "sweeping" behaviour (moving back and forth on the X-axis)
     */
    private _sweepMovement():void {
        this.moveRight(this._sweepingXSpeed); // Negative speeds will move it left
        
        if(this._isGroupLeavingLevelArea()) {
            this._sweepingXSpeed = -this._sweepingXSpeed;
            this.moveRight(this._sweepingXSpeed * 2);
        }
    }
    
    /**
     * Is the group of gang-members overlapping one of the level's edges?
     */
    private _isGroupLeavingLevelArea():boolean {
        const { leftEdge, rightEdge } = (Kernel.getInstance().level as ASLevel);
        
        if(this._leftFollower.x < leftEdge)
            return true;
        
        const followerRightEdge = this._rightFollower.x + this._rightFollower.width;
        if(followerRightEdge > rightEdge)
            return true;
        
        // If any of the followers are knocked down by the player, the leader
        // would just drift off of that side of the level. So we need to check
        // the leader's position as well
        const modelRightEdge = this.x + this.width;
        if(this.x < leftEdge || modelRightEdge > rightEdge)
            return true;
        
        return false;
    }
    
    /**
     * Sets the followers to the correct positions, so they're following the leader
     */
    private _correctFollowerPositions():void {
        const zGap = 10;
        const zPosition = this.z - zGap;
        
        const xPositionOverlap = this.width / 5;
        
        const leftFollowerX = (this.x - this._leftFollower.width) + xPositionOverlap;
        const rightFollowerX = (this.x + this.width) - xPositionOverlap;
        
        if(!this._leftFollower.hasFallen())
            this._setFollowerPosition(this._leftFollower, leftFollowerX, zPosition);
        
        if(!this._rightFollower.hasFallen())
            this._setFollowerPosition(this._rightFollower, rightFollowerX, zPosition);
    }
    
    /**
     * Sets the position of a "follower" obstacle
     * @param follower the follower to reposition
     * @param xPosition the new X-axis position for the follower
     * @param zPosition the new Z-axis position for the follower
     */
    private _setFollowerPosition(follower:GangMember, xPosition:number, zPosition:number) {
        follower.x = xPosition;
        follower.z = zPosition;
    }
}