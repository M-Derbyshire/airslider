/**
 * Position data used by a camera
 */
export default interface ICameraPositions {
    /**
     * The canvas positions/dimensions are the positions/sizes of the camera on the canvas
     * (any canvas space outside of this will be filled in by the drawLetterbox() method).
     * These are stored as actual canvas position values (not in game units).
     */
    canvas:{
        x:number;
        y:number;
        width:number;
        height:number;
    };
    
    /**
     * The draw-space positions define where the camera exists within the level's available space.
     * These values are in units, not actual canvas drawing positions.
     */
    drawSpace:{
        x:number;
        y:number;
    };
};