  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext("2d");
  var drawing = false;
  var previous_x;
  var previous_y;
  var clear_button = document.getElementById('clear');
  var canvas_area = document.getElementById('canvas_area');
  var pencil = document.getElementById('pencil');
  var paintbrush = document.getElementById('brush');
  var eraser = document.getElementById('eraser');
  var sizeSlider = document.getElementById('size');
  var colourPicker = document.getElementById('color');

  clear_button.addEventListener('click', () => ctx.clearRect(0,0,canvas.width, canvas.height));

  var drawWidth = 5;
  var drawColour = '#000000';
  var drawStyle = 'round';
  sizeSlider.value = 0;

  var down = event => {
    previous_x = event.offsetX;
    previous_y = event.offsetY;
    drawing = true;
    console.log(previous_x, previous_y);
  };

  var up = event => {
    drawing = false;
  };

  var draw = event => {
    if(!drawing)
      return;

    var x = event.offsetX;
    var y = event.offsetY;

    ctx.beginPath();
    ctx.strokeStyle = drawColour;
    ctx.lineJoin = drawStyle;
    ctx.lineWidth = drawWidth;
    ctx.moveTo(previous_x,previous_y);
    ctx.lineTo(x,y);
    ctx.closePath();
    ctx.stroke();
    previous_x = x;
    previous_y = y;
  };

  pencil.addEventListener('click', () => {
    var using_pencil = true;
    drawWidth = 2;
    drawStyle = 'square';
  });

  paintbrush.addEventListener('click', () => {
    using_pencil = false;
    drawWidth = sizeSlider.value;
    drawColour = colourPicker.value;
    drawStyle = 'round';
  });

  eraser.addEventListener('click', () => {
    drawWidth = sizeSlider.value;
    drawColour = '#ffffff';
  });

  sizeSlider.addEventListener('change', () => {
    if (using_pencil === false) {
      drawWidth = sizeSlider.value;
    }
  });

  colourPicker.addEventListener('change', () => {
    drawColour = colourPicker.value;
  });


  canvas.addEventListener('mousedown', down);
  canvas.addEventListener('touchstart', down);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('mouseup', up);
  canvas.addEventListener('mouseleave', up);
  canvas.addEventListener('touchend', up);
  canvas.addEventListener('touchleave', up);

  window.onload = () => {
    var size = canvas.parentElement.getBoundingClientRect();
    canvas.height = size.height-3;
    canvas.width = size.width-3;
  };

  window.addEventListener('resize', () => {
    var size = canvas.parentElement.getBoundingClientRect();
    var data = ctx.getImageData(0,0,canvas.width, canvas.height);
    // var centerx = canvas_area.offsetLeft + canvas_area.offsetWidth / 2;
    // var centery = canvas_area.offsetTop + canvas_area.offsetHeight / 2;
    canvas.height = size.height-3;
    canvas.width = size.width-3;
    ctx.putImageData(data, Math.floor(canvas.width/2)-Math.floor(data.width/2),Math.floor(canvas.height/2)-Math.floor(data.height/2));
  });
