import ITimeHelper from "./ITimeHelper";
import IUnitHelper from "./IUnitHelper";
import IZCalc from "./ZCalc/IZCalc";

/**
 * Provides a number of "helper" objects, that each calculate and/or provide useful values
 */
export default interface IHelpers {
    time:ITimeHelper;
    unit:IUnitHelper;
    zCalc:IZCalc;
};