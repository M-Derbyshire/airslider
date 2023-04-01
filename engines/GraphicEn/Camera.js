import Kernel from '/Kernel/kernel';

export default class Camera {
    
    constructor(canvas, canvasCtx, aspectRatioHorizontal = 17, aspectRatioVertical = 9)
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._canvas = canvas;
        this._canvasCtx = canvasCtx;
        
        
        this._positions = {
            //The canvas attribute is the positioning of the camera on the canvas
            //(any canvas space outside of this will be filled in by the drawLetterbox() method).
            //These are stored as actual canvas position values (not in game units)
            canvas: { x: 0, y: 0, width: 0, height: 0 },
            
            //The drawSpace attribute is where the camera exists within the games-space
            //These values are in units, not in actual drawing values.
            drawSpace: { x: 0, y: 0 }
        };
        
        //Used by frame/model drawing to determine where to actually draw 
        //on canvas (based on camera position)
        this.unitCameraPositionCalc = {
            x: (xUnit) => (xUnit - this._positions.drawSpace.x),
            y: (yUnit) => (yUnit - this._positions.drawSpace.y)
        };
        
        this._aspectRatioHorizontal = aspectRatioHorizontal;
        this._aspectRatioVertical = aspectRatioVertical;
        
        this.setCameraSize();
        
        this._emptySpaceColor = "#000000";
        this._letterBoxColor = "#000000";
    }
    
    
    get canvasPositionX() { return this._positions.canvas.x; }
    get canvasPositionY() { return this._positions.canvas.y; }
    get canvasPositionWidth() { return this._positions.canvas.width; }
    get canvasPositionHeight() { return this._positions.canvas.height; }
    get drawSpacePositionX() { return this._positions.drawSpace.x; }
    get drawSpacePositionY() { return this._positions.drawSpace.y; }
    
    setCameraSize()
    {
        //Set the camera width and height to match the aspect ratio values
        
        let width;
        let height;
        let widthRatio = this._aspectRatioHorizontal / this._aspectRatioVertical;
        
        if((this._canvas.width / widthRatio) > this._canvas.height)
        {
            height = this._canvas.height
            width = height * widthRatio;
        } else {
            height = this._canvas.width / widthRatio;
            width = this._canvas.width;
        }
        
        const x = (this._canvas.width - width) / 2;
        const y = (this._canvas.height - height) / 2;
        
        this._positions.canvas = { x, y, width, height };
    }
    
    setColors(emptySpaceColor, letterBoxColor)
    {
        this._emptySpaceColor = emptySpaceColor;
        this._letterBoxColor = letterBoxColor;
    }
    
    
    
    isOnCamera(drawSpaceX, drawSpaceY, widthUnits, heightUnits, zPosition = 0)
    {
        //The drawspace is the total space within the level, rather
        //than on camera (it is given in units).
        
        const objectRealX = this.helpers.zCalc.x(this.helpers.unit.xUnit(this.unitCameraPositionCalc.x(drawSpaceX)) + this._positions.canvas.x, zPosition);
        const objectRealY = this.helpers.zCalc.y(this.helpers.unit.yUnit(this.unitCameraPositionCalc.y(drawSpaceY)) + this._positions.canvas.y, zPosition);
        const objectRealWidth = this.helpers.zCalc.width(this.helpers.unit.xUnit(widthUnits), zPosition);
        const objectRealHeight = this.helpers.zCalc.height(this.helpers.unit.yUnit(heightUnits), zPosition);
        
        return (
            (objectRealX + objectRealWidth >= this._positions.canvas.x &&
                objectRealX <= this._positions.canvas.x + this._positions.canvas.width) &&
            (objectRealY + objectRealHeight >= this._positions.canvas.y &&
                objectRealY <= this._positions.canvas.y + this._positions.canvas.height)
        );
    }
    
    
    
    drawBack()
    {
        this.drawEmptySpaceColor();
    }
    
    drawFront()
    {
        this.drawLetterbox();
    }
    
    drawEmptySpaceColor()
    {
        this._canvasCtx.fillStyle = this._emptySpaceColor;
        this._canvasCtx.rect(0, 0, this._canvas.width, this._canvas.height);
        this._canvasCtx.fill();
    }
    
    drawLetterbox()
    {
        this._canvasCtx.fillStyle = this._letterBoxColor;
        
        if(this._positions.canvas.y > 0)
        {
            //Top letterbox bar
            this._canvasCtx.rect(0, 0, this._canvas.width, this._positions.canvas.y);
            
            //Bottom letterbox bar
            this._canvasCtx.rect(
                0, 
                this._positions.canvas.y + this._positions.canvas.height,
                this._canvas.width, 
                this._positions.canvas.y
            );
        }
        else
        {
            //Left letterbox bar
            this._canvasCtx.rect(0, 0, this._positions.canvas.x, this._canvas.height);
            
            //Right letterbox bar
            this._canvasCtx.rect( 
                this._positions.canvas.x + this._positions.canvas.width,
                0,
                this._positions.canvas.x,
                this._canvas.height
            );
        }
        
        this._canvasCtx.fill();
    }
    
    
    
    moveLeft(speed)
    {
        this._positions.drawSpace.x -= this.helpers.unit.xSpeed(speed);
    }
    
    moveRight(speed)
    {
        this._positions.drawSpace.x += this.helpers.unit.xSpeed(speed);
    }
    
    moveUp(speed)
    {
        this._positions.drawSpace.y -= this.helpers.unit.ySpeed(speed);
    }
    
    moveDown(speed)
    {
        this._positions.drawSpace.y += this.helpers.unit.ySpeed(speed);
    }
}