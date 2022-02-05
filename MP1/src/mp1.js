/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Eric Shaffer <shaffer1@eillinois.edu>
 * Updated Spring 2021 to use WebGL 2.0 and GLSL 3.00
 * 
 * @author Ge Yuhao <Yuhaoge2z@illinois.edu>
 * Modified Spring 2022 to finish the MP1 of CS 418
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The vertex array object for the triangle */
var vertexArrayObject;

/** @global The rotation angle of our triangle */
var rotAngle = 0;

/** @global The ModelView matrix contains any modeling and viewing transformations */
var modelViewMatrix  = glMatrix.mat4.create();

/** @global Records time last frame was rendered */
var previousTime = 0;

/** @global  PointOffset */
var pointOffset = [0.0, 0.0, 0.0];
var fly_offset = [0.0, 0.0, 0.0];

/** @global  Used to check which select button is used */
var old_which = 1;
var which = 1;

/** @global Value between 0-1, used to denote the frame number of transfer animation */
var frame = 0;

/** @global Check if the transfer animation should start */
var start = false;

/** @global UIUC motion type*/
var mo_type = 0;

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}


/**
 * Loads a shader.
 * Retrieves the source code from the HTML document and compiles it.
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
    
  var shaderSource = shaderScript.text;
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}


/**
 * Set up the fragment and vertex shaders.
 */
function setupShaders() {
  // Compile the shaders' source code.
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  // Link the shaders together into a program.
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // We only use one shader program for this example, so we can just bind
  // it as the current program here.
  gl.useProgram(shaderProgram);
    
  // Query the index of each attribute in the list of attributes maintained
  // by the GPU. 
  shaderProgram.vertexPositionAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexColorAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexColor");
    
  //Get the index of the Uniform variable as well
  shaderProgram.modelViewMatrixUniform =
    gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
}



/**
 * Create the vertices for the picture
 * @param {Number} choose "1" means drawing the "I" symbol.
 * @return {list} The vertices' coordinates
 */
function create_vertices(choose){
  // Define triangles in clip coordinates.
  if (choose == 1){
    var vertices = [
          -0.5, 0.6, 1.0,
          -0.5, 0.4, 1.0,
          -0.2, 0.4, 1.0,
          -0.5, 0.6, 1.0,
          0.5, 0.6, 1.0,
          -0.2, 0.4, 1.0,
          -0.2, 0.4, 1.0,
          0.2, 0.4, 1.0,
          0.5, 0.6, 1.0,
          0.2, 0.4, 1.0,
          0.5, 0.4, 1.0,
          0.5, 0.6, 1.0,
          -0.5,-0.6, 1.0,
          -0.5,-0.4, 1.0,
          -0.2,-0.4, 1.0,
          -0.5,-0.6, 1.0,
          0.5,-0.6, 1.0,
          -0.2,-0.4, 1.0,
          -0.2,-0.4, 1.0,
          0.2,-0.4, 1.0,
          0.5,-0.6, 1.0,
          0.2,-0.4, 1.0,
          -0.2, 0.4, 1.0,
          -0.2,-0.4, 1.0,
          0.2,-0.4, 1.0, 
          0.5,-0.4, 1.0,
          0.5,-0.6, 1.0,
          -0.2, 0.4, 1.0,
          0.2, 0.4, 1.0,
          0.2,-0.4, 1.0,
          -0.2, 0.4, 1.0,
    ];
  } else{               // Define triangles for use of my own animation
    var vertices = [
          0.0, 0.7, 1.0,
          0.1, 0.55, 1.0,
          0.3, 0.6, 1.0,

          0.0, 0.7, 1.0,
         -0.2, 0.4, 1.0,
          0.0,-0.6, 1.0,

         -0.2, 0.4, 1.0,
          0.0,-0.6, 1.0,
         -0.1,-0.6, 1.0,

          0.0,-0.6, 1.0,
          0.0,-0.8, 1.0,
         -0.1,-0.6, 1.0,

         -0.1, -0.6, 1.0,
          0.0, -0.8, 1.0,
         -0.15,-0.6, 1.0,

         -0.4, 0.6, 1.0,
         -0.2, 0.4, 1.0,
         -0.1,-0.6, 1.0,

         -0.4, 0.6, 1.0,
         -0.1,-0.6, 1.0,
         -0.65,0.6, 1.0,

         
        -0.0, 0.7, 1.0,
        0.2, 0.4, 1.0,
        -0.0,-0.6, 1.0,

         0.2, 0.4, 1.0,
          -0.0,-0.6, 1.0,
         0.1,-0.6, 1.0,

          -0.0,-0.6, 1.0,
          -0.0,-0.8, 1.0,
         0.1,-0.6, 1.0,

         0.1, -0.6, 1.0,
          -0.0, -0.8, 1.0,
         0.15,-0.6, 1.0,

        0.4, 0.6, 1.0,
        0.2, 0.4, 1.0,
        0.1,-0.6, 1.0,

        0.4, 0.6, 1.0,
        0.1,-0.6, 1.0,
        0.65,0.6, 1.0,
    ]

    // Update the vertices according to the frame number
    vertices = trans_pic(vertices,frame);

    // Add the wing of the eagle
    for (var i=0; i<6; i++){
      x1 = -0.9 + i * 0.8 / 6 + fly_offset[0];
      y1 = 0.6 - i * 0.2 + fly_offset[1];

      x2 = -0.65 + i * 0.55/6 + fly_offset[0];
      y2 = y1;
      
      x3 = -0.9 + i * 0.8 / 6 + 0.8/12 + fly_offset[0];
      y3 = 0.5 - i * 0.2 + fly_offset[1];

      x4 = -0.65 + i * 0.55/6 + 0.55/12 + fly_offset[0];
      y4 = y3;

      //add the vertex coordinates to the array
      vertices.push(x1);
      vertices.push(y1);
      vertices.push(1.0);

      vertices.push(x2);
      vertices.push(y2);
      vertices.push(1.0);

      vertices.push(x3);
      vertices.push(y3);
      vertices.push(1.0);

      vertices.push(x2);
      vertices.push(y2);
      vertices.push(1.0);

      vertices.push(x3);
      vertices.push(y3);
      vertices.push(1.0);

      vertices.push(x4);
      vertices.push(y4);
      vertices.push(1.0);
    }

    // do the symetric
    var length = vertices.length/3;
    for (i=3*13; i<length; i++){
      vertices.push(-vertices[i*3]);
      vertices.push(vertices[i*3+1]);
      vertices.push(1.0);
    }
  }

  // Add offset to each vertice
  for (var i=0; i<vertices.length/3; i++){
    vertices[i*3+0] += pointOffset[0];
    vertices[i*3+1] += pointOffset[1];
  }

  return vertices;
}


/**
 * Create the vertices for the picture
 * @param {Number} frame Denote which stage the transition have arrived
 * @return {list} The vertices' coordinates
 */
function trans_pic(vertices_initial, frame){
  mid_vertices = []
  // Final position of all vertices
  var vertices_final = [
    0.0, 0.6, 1.0,
    0.1, 0.6, 1.0,
    0.0, 0.6, 1.0,
    0.0, 0.6, 1.0,
   -0.2, 0.6, 1.0,
    0.0,-0.4, 1.0,
   -0.2, 0.6, 1.0,
    0.0,-0.4, 1.0,
   -0.2,-0.4, 1.0,
    0.0,-0.4, 1.0,
    0.0,-0.6, 1.0,
   -0.5,-0.4, 1.0,
   -0.5, -0.4, 1.0,
   -0.0, -0.6, 1.0,
   -0.5,-0.6, 1.0,
   -0.5, 0.6, 1.0,
   -0.2, 0.6, 1.0,
   -0.2, 0.4, 1.0,
   -0.5, 0.6, 1.0,
   -0.2, 0.4, 1.0,
   -0.5, 0.4, 1.0,
   -0.0, 0.6, 1.0,
    0.2, 0.6, 1.0,
   -0.0,-0.4, 1.0,
    0.2, 0.6, 1.0,
   -0.0,-0.4, 1.0,
    0.2,-0.4, 1.0,
   -0.0,-0.4, 1.0,
   -0.0,-0.6, 1.0,
    0.5,-0.4, 1.0,
    0.5, -0.4, 1.0,
    0.0, -0.6, 1.0,
    0.5,-0.6, 1.0,
    0.5, 0.6, 1.0,
    0.2, 0.6, 1.0,
    0.2, 0.4, 1.0,
    0.5, 0.6, 1.0,
    0.2, 0.4, 1.0,
    0.5, 0.4, 1.0
]

  // calculate the middle position according to the frame number
  for (var i=0; i<vertices_initial.length/3; i++){
    point1 = [vertices_initial[3*i],vertices_initial[3*i+1]];
    point2 = [vertices_final[3*i],vertices_final[3*i+1]];

    x = point1[0] + frame * (point2[0] - point1[0]);
    y = point1[1] + frame * (point2[1] - point1[1]);
    z = 1;

    mid_vertices.push(x);
    mid_vertices.push(y);
    mid_vertices.push(z);  
  }
  
  return mid_vertices;
}




/**
 * Set up the buffers to hold the triangle's vertex positions and colors.
 */
function setupBuffers() {
  // Create the vertex array object, which holds the list of attributes for
  // the triangle.
  vertexArrayObject = gl.createVertexArray();
  gl.bindVertexArray(vertexArrayObject); 

  // Create a buffer for positions, and bind it to the vertex array object.
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

  // Generate the vertices position according to which picture we want to draw
  vertices = create_vertices(which);

  // Populate the buffer with the position data.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = vertices.length / vertexPositionBuffer.itemSize;

  // Binds the buffer that we just made to the vertex position attribute.
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  // Do the same steps for the color buffer.
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [];

  // Define color for the UIUC LOGO
  if (which == 1){
    for (var i=0; i<vertices.length; i++){ 
      colors.push((14*16+1)/256);
      colors.push((4*16+7)/256);
      colors.push((2*16+5)/256);
      colors.push(1.0);
    }
  } else{   // Define color fot the ZJU Logo
    for (var i=0; i<vertices.length; i++){

      start_rgb = [0.0,(4*16+12)/256,(9*16+12)/256];
      end_rgb = [(14*16+1)/256,(4*16+7)/256,(2*16+5)/256];

      // calculate the middle stage of the color during the trainsition
      r = start_rgb[0] + frame * (end_rgb[0] - start_rgb[0]);
      g = start_rgb[1] + frame * (end_rgb[1] - start_rgb[1]);
      b = start_rgb[2] + frame * (end_rgb[2] - start_rgb[2]);

      colors.push(r);
      colors.push(g);
      colors.push(b);
      colors.push(1.0);
    }
  }

  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = colors.length / vertexColorBuffer.itemSize;  
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                         vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
   // Enable each attribute we are using in the VAO.  
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
  // Unbind the vertex array object to be safe.
  gl.bindVertexArray(null);
}


/**
 * Draws a frame to the screen.
 */
function draw() {
  // Transform the clip coordinates so the render fills the canvas dimensions.
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  // Clear the screen.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Use the vertex array object that we set up.
  gl.bindVertexArray(vertexArrayObject);
    
  // Send the ModelView matrix with our transformations to the vertex shader.
  gl.uniformMatrix4fv(shaderProgram.modelViewMatrixUniform,
                      false, modelViewMatrix);
    
  // Render the triangle. 
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
  
  // Unbind the vertex array object to be safe.
  gl.bindVertexArray(null);
}


/**
 * Animates the triangle by updating the ModelView matrix with a rotation
 * each frame.
 */
 function animate(currentTime) {
  // Read the speed slider from the web page.
  var speed = document.getElementById("speed").value;

  // Convert the time to seconds.
  currentTime *= 0.001;
  // Subtract the previous time from the current time.
  var deltaTime = currentTime - previousTime;
  // Remember the current time for the next frame.
  previousTime = currentTime;
     
  // Update geometry to rotate 'speed' degrees per second.
  rotAngle += speed * deltaTime;
  if (rotAngle > 360.0)
      rotAngle = 0.0;
  


  document.getElementById("submit1").addEventListener('click', function()
  {
    if (mo_type==0){
      mo_type = 1;
    } 
    rotAngle = 0; 
  }, false);

  document.getElementById("submit2").addEventListener('click', function()
  {
    if (mo_type==1){
      mo_type = 0;
    } 
    rotAngle = 0; 
  }, false);

  if (mo_type == 1){
    pointOffset = [(Math.abs(rotAngle-180)-90)/180, Math.sin(rotAngle*Math.PI/30)/6,1];
    modelViewMatrix = glMatrix.mat4.create();;
  } else{
    pointOffset = [0,0,1];
    modelViewMatrix  = matrix1(rotAngle);
  }
  setupBuffers();     

  // Draw the frame.
  draw();

  // Animate the next frame. The animate function is passed the current time in
  // milliseconds.
  test();
}

/**
 * My own animation
 */
 function My_animate(currentTime) {
  // Read the speed slider from the web page.
  var speed = document.getElementById("speed").value;

  // Convert the time to seconds.
  currentTime *= 0.001;
  // Subtract the previous time from the current time.
  var deltaTime = currentTime - previousTime;
  // Remember the current time for the next frame.
  previousTime = currentTime;
     
  // Update geometry to rotate 'speed' degrees per second.
  if (rotAngle > 480.0){
    rotAngle = 0.0;
    start = false;
  }

  document.getElementById("button").addEventListener('click', function(){start = true}, false);
  if (start == true){
    rotAngle += speed * deltaTime;
  } else {
    rotAngle = 0;
  }

  if(rotAngle<360){
    frame = rotAngle/360; 
  } else{
    frame = 1;
  }

  // Use offset to realise the motion of wings
  fly_offset = [-frame, 0.03*Math.sin(frame*30), 0];
  pointOffset = [0,frame/2-0.2,1];

  setupBuffers();     

  // Draw the frame.
  draw();

  // Animate the next frame. The animate function is passed the current time in
  // milliseconds.
  test();
}


/**
 * Define the affine matrix
 * @param {Number} rotAngle The rotating angle
 * @return {mat4} The affine matrix
 */
 function matrix1(rotAngle){
  var modelViewMatrix1 = glMatrix.mat4.create();  // used as new transformation matrix
  var modelViewMatrix2 = glMatrix.mat4.create();  // used as new transformation matrix
  var modelViewMatrix3 = glMatrix.mat4.create();  // used as new transformation matrix
  var modelViewMatrix4 = glMatrix.mat4.create();  // used as new transformation matrix
  new_matrix = glMatrix.mat4.fromValues(1, 0, 0, 0, 
                                        0, 1, 0, 0, 
                                        0, 0, 1, 0, 
                                        0, 0, 0, 1)
  glMatrix.mat4.fromZRotation(modelViewMatrix1, degToRad(rotAngle));
  glMatrix.mat4.fromScaling(modelViewMatrix2, [Math.abs(rotAngle-180)/360+0.5,Math.abs(rotAngle-180)/360+0.5,1]);
  glMatrix.mat4.multiply(modelViewMatrix3,modelViewMatrix1,modelViewMatrix2);
  glMatrix.mat4.multiply(modelViewMatrix4,modelViewMatrix3,new_matrix);
  return modelViewMatrix3;
 }


/**
 * read the button status to decide which picture to draw
 */
 function test(){
   // Check the status of the button
  if (document.getElementById("I").checked == true && old_which == 1){
      //bind the VAO for the I logo
      which = 1;
      change = 0;
      old_which = 1;
  } else if (document.getElementById("I").checked == true && old_which == 0){
      which = 1;
      change = 1;
      old_which = 1;
  } else if (document.getElementById("MyAnimation").checked == true && old_which == 1){
      //bind the VAO for my animation
      which = 0;
      change = 1;
      old_which = 0;
  } else if (document.getElementById("MyAnimation").checked == true && old_which == 0){
      which = 0;
      change = 0;
      old_which = 0;
  } else{
      console.log("ERROR with the check button");
  }

  // Initialize the all the parameters
  if (change == 1){  // true means there is a change in the check button
    rotAngle = 0; 
    start = false;
    fly_offset = [0,0,0];
    pointOffset = [0,0,0];
    modelViewMatrix  = glMatrix.mat4.create();
  }

  if (which == 1){    // 1 means the I logo
    requestAnimationFrame(animate);
  } else if (which == 0){   // 0 means my own animation
    requestAnimationFrame(My_animate);
  }
 }

/**
 * Ask the user to give feedback
 */
// function ask_input(){
//   document.getElementById("submit").addEventListener('click', function()
//   {
//     var output = document.getElementById("text").value;
//     console.log(output);
//     document.getElementById('text').value='';
//   }, false)
// }


/**
 * Startup function called from html code to start the program.
 */
 function startup() {
  console.log("Starting animation...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(animate); 
  // ask_input();
}

