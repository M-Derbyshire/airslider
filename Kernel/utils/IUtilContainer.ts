import ITimeHelper from "./ITimeHelper";
import IZCalc from "./ZCalc/IZCalc";

/**
 * Provides a number of utility objects
 */
export default interface IUtilContainer {
    time:ITimeHelper;
    zCalc:IZCalc;
};