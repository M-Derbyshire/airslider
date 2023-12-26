/**
 * Coordinates and dimensions for a model's hit box. A hit box will surround 
 * a part of the model, and can be used in events (such as collision detection). 
 * Multiple boxes could be used to cover the actual shape of the model's sprite.
 */
export default interface IHitBox {
    /**
     * The x position (in units) of the box
     */
    x:number;
    
    /**
     * The y position (in units) of the box
     */
    y:number;
    
    /**
     * The z position (in units) of the box
     */
    z:number;
    
    /**
     * The width (in units) of the box
     */
    width:number;
    
    /**
     * The height (in units) of the box
     */
    height:number;
    
};