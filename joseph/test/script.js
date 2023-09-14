// Get canvas context and initialize variables
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var gnar2draw = "sauceGnar"; //Gnar which is set originally (Gnarsauce)
let images = [];
  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);
        
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
                
    /**
     * Your drawings need to be inside this function otherwise they will be reset when 
     * you resize the browser window and the canvas goes will be cleared.
     */
    
    drawBkgd();
    drawGnar();
  }
  
// Event listeners for buttons

document.getElementById('drawBkgd').addEventListener('click', drawBkgd);
document.getElementById('drawGnar').addEventListener('click', drawGnar);
document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
document.getElementById('saveImage').addEventListener('click', saveImage);

document.getElementById('drawGnar1').addEventListener("click", function(){
    changeGnar(1);
}, false);
document.getElementById('drawGnar2').addEventListener("click", function(){
    changeGnar(2);
}, false);
document.getElementById('drawGnar3').addEventListener("click", function(){
    changeGnar(3);
}, false);



// Function to change which gnar to grab, currently just a few to test
function changeGnar(gnarnumber) {
    switch(gnarnumber) {
        case 1:
          // code block
          gnar2draw = "sauceGnar";
          break;
        case 2:
          // code block
          gnar2draw = "weedGnar";
          break;
        case 3:
            // code block
          gnar2draw = "wizardGnar";
          break;
        default:
          // should be gnarsauce
          gnar2draw = "sauceGnar"; //Gnar which is set originally (Gnarsauce)
      }
      clearCanvas();
      drawBkgd();
      drawGnar();
 }

// Make sure the image is loaded first otherwise nothing will draw./
function drawBkgd() {
    var background = new Image();
    background.src = "images/gnarsauceLabel_low.jpg";
    

    background.onload = function() {
      var imgWidth = background.naturalWidth;
      var screenWidth  = canvas.width;
      var scaleX = 1;
      if (imgWidth > screenWidth)
          scaleX = screenWidth/imgWidth;
      var imgHeight = background.naturalHeight;
      var screenHeight = canvas.height;
      var scaleY = 1;
      if (imgHeight > screenHeight)
          scaleY = screenHeight/imgHeight;
      var scale = scaleY;
      if(scaleX < scaleY)
          scale = scaleX;
      if(scale < 1){
          imgHeight = imgHeight*scale;
          imgWidth = imgWidth*scale;          
      }
  
      canvas.height = imgHeight;
      canvas.width = imgWidth;
  
      ctx.drawImage(background, 0, 0, background.naturalWidth, background.naturalHeight, 0,0, imgWidth, imgHeight);
      images.push(canvas.toDataURL());
    }
}

// Function to draw a circle on the canvas
function drawGnar() {
    var gnar = new Image();
    // lets make sure we can dynamically change the gnar shown
    // This will also be changed to SVG soon
    gnar.src = "images/" + gnar2draw + ".png";

    
    gnar.onload = function() {
        var imgWidth = gnar.naturalWidth;
        var screenWidth  = canvas.width;
        var scaleX = 1;
        if (imgWidth > screenWidth)
            scaleX = screenWidth/imgWidth;
        var imgHeight = gnar.naturalHeight;
        var screenHeight = canvas.height;
        var scaleY = 1;
        if (imgHeight > screenHeight)
            scaleY = screenHeight/imgHeight;
        var scale = scaleY;
        if(scaleX < scaleY)
            scale = scaleX;
        if(scale < 1){
            imgHeight = imgHeight*scale;
            imgWidth = imgWidth*scale;          
        }

        //Additionally this should clear the canvas of the old gnar before pushing this one.
        ctx.drawImage(gnar, screenWidth/2-(imgWidth*.67)/2, imgHeight*.244, imgWidth*.67, imgHeight*.67);
        images.push(canvas.toDataURL());
    }
}

// Function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    images = [];
}

// Function to save the combined image
function saveImage() {
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvas.width;
    combinedCanvas.height = canvas.height;
    const combinedCtx = combinedCanvas.getContext('2d');

    images.forEach((dataURL, index) => {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            combinedCtx.drawImage(img, 0, 0);
            if (index === images.length - 1) {
                // Save the combined image
                const resultImage = document.getElementById('resultImage');
                resultImage.src = combinedCanvas.toDataURL();
            }
        };
    });
}

resizeCanvas();
drawGnar("wizardGnar");
//draw_bkgd_image();