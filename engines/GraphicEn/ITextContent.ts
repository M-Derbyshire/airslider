/**
 * Details for displaying an entity's text content
 */
export default interface ITextContent {
    
    /**
     * The text to display
     */
    content:string;
    
    /**
     * The x position, in units (relative to the position of the entity), to draw the text
     */
    x:number;
    
    /**
     * The y position, in units (relative to the position of the entity), to draw the text
     */
    y:number;
    
    /**
     * The font size for the text
     */
    size:number;
    
    /**
     * The name of the font to use
     */
    font:string;
    
    /**
     * The color of the text
     */
    color:string;
    
    /**
     * See the HTML5 Canvas's "font-style", "font-variant" and "font-weight" properties
     */
    style:string;
    
};