import ASHUD from "../ASHUD/ASHUD";
import TextOnlyButton from "../../HUDComponents/UI-Components/TextOnlyButton/TextOnlyButton";
import TextOnly from "../../HUDComponents/UI-Components/TextOnly/TextOnly";

/**
 * Displays text for a warning screen
 */
export default class WarningScreenTexts extends ASHUD
{
    /**
     * Constructor
     * @param titleText the title for the warning
     * @param bodyText the body of the warning
     * @param continueText the text to be clicked by the player to continue
     * @param textColor the color of the text to display
     * @param onContinue a callback that will be called when the user clicks to continue
     */
    constructor(
        titleText:string, 
        bodyText:string, 
        continueText:string,
        textColor:string, 
        onContinue:()=>void
    )
    {
        super();
        
        const fontName = "Arial";
        
        const title = new TextOnly(
            titleText,
            500,
            100,
            50,
            fontName,
            textColor,
            "bold",
            "center"
        );
        
        const body = new TextOnly(
            bodyText,
            500,
            250,
            25,
            fontName,
            textColor,
            "bold",
            "center",
            20
        );
        
        const continueBtn = new TextOnlyButton(
            onContinue,
            375,
            800,
            250,
            50,
            continueText,
            25,
            fontName,
            textColor,
            "bold",
            false
        );
        
        this.components = [
            title,
            body,
            continueBtn
        ];
    }
};