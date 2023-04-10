import ITimeHelper from "./ITimeHelper";
import IUnitHelper from "./IUnitHelper";
import IZCalc from "./IZCalc";

/**
 * Provides a number of "helper" objects, that each calculate and/or provide useful values
 */
export default interface IHelpers {
    
    /**
     * Contains methods that provide information related to time
     */
    time:ITimeHelper;
    
    /**
     * Contains methods that perform calculations to convert "unit" values into actual canvas positions/dimensions. Also provides 
     * methods for keeping speeds consistent when the FPS changes
     */
    unit:IUnitHelper;
    
    /**
     * Provides methods to calculate the correct drawing position/dimensions for an element, based on it position on the z axis.
     * Also provides methods relating to consistent speed (regardless of a changing FPS) on the z axis
     */
    zCalc:IZCalc;
    
};