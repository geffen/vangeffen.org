// Get canvas context and initialize variables
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let images = [];
  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);
        
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
                
    draw_bkgd_image();
    /**
     * Your drawings need to be inside this function otherwise they will be reset when 
     * you resize the browser window and the canvas goes will be cleared.
     */
  }
  
// Event listeners for buttons
document.getElementById('drawGnar').addEventListener('click', drawGnar);
document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
document.getElementById('saveImage').addEventListener('click', saveImage);

// Function to draw a square on the canvas

    



// Make sure the image is loaded first otherwise nothing will draw./
function draw_bkgd_image() {
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
    gnar.src = "images/gnarsauceAvatar.png";
    /*ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(200, 200, 50, 0, Math.PI * 2);
    ctx.fill();*/
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
  
    ctx.drawImage(gnar, screenWidth/2-(imgWidth*.8)/2, imgHeight*.115, imgWidth*.8, imgHeight*.8);
    images.push(canvas.toDataURL());
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
drawGnar();
//draw_bkgd_image();