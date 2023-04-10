/**
 * A light mask is an image with a gradient (with some transparency) that will be displayed over the level, to give the 
 * effect of light/darkness 
 */
export default interface ILightMask {
    
    /**
     * The light mask image
     */
    image:HTMLImageElement;
    
    /**
     * A number between 0 and 1, used to set the opacity of the image
     */
    luminosity:number;
    
};