import ITimeHelper from "./ITimeHelper";
import IUnitHelper from "./IUnitHelper";
import IZCalc from "./ZCalc/IZCalc";

/**
 * Provides a number of utility objects
 */
export default interface IUtilContainer {
    time:ITimeHelper;
    unit:IUnitHelper;
    zCalc:IZCalc;
};