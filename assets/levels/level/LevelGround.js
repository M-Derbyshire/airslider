class LevelGround
{
    constructor()
    {
        this.kernel = Kernel.getInstance();
        this.helpers = this.kernel.helpers;
        
        this.ground = {
            ref: 0, //The image's index in the loadedAssets array
            height: 0, //Height to draw the image
            distance: 0, //The correct z-axis distance between each image
            offset: 0 //The amount this has moved along the z-axis (up till the distance, above)
        };
        
        this.groundZ = []; //The z-axis values of each row of ground images (1 left, 1 right)
    }
    
    set(path, height)
    {
        this.ground.ref = this.kernel.loadImage(path);
        this.ground.height = height;
        let distance = -1;
        
        this.groundZ.push(this.helpers.zCalc.vPointDepth);
        
        for(let z = this.helpers.zCalc.vPointDepth; z >= 0; z--)
        {
            if(distance == -1)
            {
                //find the correct distance on the z-axis between each image
                if(this.helpers.zCalc.y(this.kernel.graphicEn.gameCan.height, z) >= this.helpers.zCalc.y(this.kernel.graphicEn.gameCan.height, this.groundZ[this.groundZ.length - 1]) + this.helpers.zCalc.height(height, this.groundZ[this.groundZ.length - 1]))
                {
                    distance = this.groundZ[this.groundZ.length - 1] - z;
                    this.ground.distance = distance;
                    this.groundZ.push(z + 1);
                }
            } else {
                if(this.groundZ[this.groundZ.length - 1] - z == distance)
                {
                    this.groundZ.push(z + 1);
                }
            }
        }
    }
    
    draw()
    {
        for(let i = 0; i < this.groundZ.length; i++)
        {
            if(this.ground.offset > this.ground.distance)
            {
                //Once the ground reaches the distance between the images, they can
                // reset. And, as they're all the same, it will look like they're 
                // continuing their movement (even though no more are actually 
                // being created)
                this.ground.offset = 0;
            }
            
            this.ground.offset += (this.kernel.level.levelSpeed / 1000);
            
            let y = this.helpers.zCalc.y(this.kernel.graphicEn.backCan.height, this.groundZ[i] - this.ground.offset);
            let width = this.helpers.zCalc.width((this.kernel.graphicEn.backCan.width * 2), this.groundZ[i] - this.ground.offset);
            let height = this.helpers.zCalc.height(this.ground.height, this.groundZ[i] - this.ground.offset);
            
            //Need to draw it once on the left, then again on the right
            this.kernel.graphicEn.backCtx.drawImage(
                this.kernel.loadedAssets[this.ground.ref][1],
                this.helpers.zCalc.x(0 - (this.kernel.graphicEn.backCan.width * 2), this.groundZ[i] - this.ground.offset),
                y,
                width,
                height
            );
            
            this.kernel.graphicEn.backCtx.drawImage(
                this.kernel.loadedAssets[this.ground.ref][1],
                this.helpers.zCalc.x(this.kernel.graphicEn.backCan.width, this.groundZ[i] - this.ground.offset),
                y,
                width,
                height
            );
        }
    }
}