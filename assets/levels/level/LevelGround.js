class LevelGround
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this._camera; //Set in load
        
        this.ground = {
            ref: 0, //The image's index in the loadedAssets array
            height: 0, //Height to draw the image
            distance: 0, //The correct z-axis distance between each image (which will place one on top of the other)
            offset: 0 //The amount the images have moved along the z-axis (up till the distance property above)
        };
        
        this.groundZ = []; //The z-axis positions of each of the ground images
    }
    
    set(camera, path, height)
    {
        this._camera = camera;
        
        //Can't set in constructor as graphicEn hasn't been initialised
        const canvasPositions = { 
            x: camera.canvasPositionX, 
            y: camera.canvasPositionY,
            width: camera.canvasPositionWidth,
            height: camera.canvasPositionHeight
        };
        
        this.ground.ref = this.kernel.loadImage(path);
        this.ground.height = height;
        let distance = -1;
        
        this.groundZ.push(this.helpers.zCalc.vPointDepth); //The position of the first ground piece
        
        
        for(let z = this.helpers.zCalc.vPointDepth; z >= 0; z--)
        {
            if(distance == -1) //If the only piece is the first piece
            {
                //Find the correct distance on the z-axis between each image.
                //This takes the height of the image into account to figure out if the top of this
                //ground image would now be at the bottom of the last image, if drawn at this 
                //z-position.
                if(this.helpers.zCalc.y(canvasPositions.height, z) >= this.helpers.zCalc.y(canvasPositions.height, this.groundZ[this.groundZ.length - 1]) + this.helpers.zCalc.height(height, this.groundZ[this.groundZ.length - 1]))
                {
                    distance = this.groundZ[this.groundZ.length - 1] - z;
                    this.ground.distance = distance;
                    this.groundZ.push(z + 1);
                }
            } else {
                
                //If z is now far enough away from the last added piece, add a new one
                if(this.groundZ[this.groundZ.length - 1] - z == distance)
                {
                    this.groundZ.push(z + 1);
                }
            }
        }
    }
    
    
    //This works by moving all of the images on the z-axis, until they have
    //moved into the preceeding image's starting position. As all the images
    //are the same, the positions can then just be reset, and it will look
    //like they are just continuing to move towards the camera.
    draw(levelSpeed)
    {
        for(let i = 0; i < this.groundZ.length; i++)
        {
            //The offset is subtracted from the starting z position of the image,
            //to make it move. 
            if(this.ground.offset > this.ground.distance)
            {
                //Once the ground reaches the distance between the images, they can
                // reset. And, as they're all the same, it will look like they're 
                // continuing their movement (even though no more are actually 
                // being created)
                this.ground.offset = 0;
            }
            
            this.ground.offset += (levelSpeed / 250);
            
            let y = this.helpers.zCalc.y(this._camera.canvasPositionY + this._camera.canvasPositionHeight, this.groundZ[i] - this.ground.offset);
            let width = this.helpers.zCalc.width((this._camera.canvasPositionX + this._camera.canvasPositionWidth * 2), this.groundZ[i] - this.ground.offset);
            let height = this.helpers.zCalc.height(this.ground.height, this.groundZ[i] - this.ground.offset);
            
            //Need to draw it once on the left, then again on the right
            this.kernel.graphicEn.gameCtx.drawImage(
                this.kernel.loadedAssets[this.ground.ref].asset,
                this.helpers.zCalc.x(this._camera.canvasPositionX - (this._camera.canvasPositionX + this._camera.canvasPositionWidth * 2), this.groundZ[i] - this.ground.offset),
                y,
                width,
                height
            );
            
            this.kernel.graphicEn.gameCtx.drawImage(
                this.kernel.loadedAssets[this.ground.ref].asset,
                this.helpers.zCalc.x(this._camera.canvasPositionX + this._camera.canvasPositionWidth, this.groundZ[i] - this.ground.offset),
                y,
                width,
                height
            );
        }
    }
}