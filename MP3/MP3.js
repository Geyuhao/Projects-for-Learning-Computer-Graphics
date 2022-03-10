/**
 * @file MP2.js - A simple WebGL rendering engine
 * @author Ian Rudnick <itr2@illinois.edu>
 * @brief Starter code for CS 418 MP2 at the University of Illinois at
 * Urbana-Champaign.
 * 
 * @author Yuhao Ge <yuhaoge2@illinois.edu>
 * @brief Modified version
 * 
 * Updated Spring 2021 for WebGL 2.0/GLSL 3.00 ES.
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas to draw on */
var canvas;

/** @global The GLSL shader program */
var shaderProgram;

/** @global An object holding the geometry for your 3D terrain */
var myTerrain;

/** @global The Model matrix */
var modelViewMatrix = glMatrix.mat4.create();
/** @global The Projection matrix */
var projectionMatrix = glMatrix.mat4.create();
/** @global The Normal matrix */
var normalMatrix = glMatrix.mat3.create();

// Material parameters
/** @global Ambient material color/intensity for Phong reflection */
var kAmbient = [1.0, 1.0, 1.0];
/** @global Diffuse material color/intensity for Phong reflection */
var kDiffuse = [0.8, 0.8, 0.8];
/** @global Specular material color/intensity for Phong reflection */
var kSpecular = [0.05, 0.05, 0.05];
/** @global Shininess exponent for Phong reflection */
var shininess = 2;

// Light parameters
/** @global Light position in VIEW coordinates */
var lightPosition = [1, 1, 2];
/** @global Ambient light color/intensity for Phong reflection */
var ambientLightColor = [0.3, 0.3, 0.3];
/** @global Diffuse light color/intensity for Phong reflection */
var diffuseLightColor = [1, 1, 1];
/** @global Specular light color/intensity for Phong reflection */
var specularLightColor = [0.9, 0.9, 0.9];

/** @global Edge color for black wireframe */
var kEdgeBlack = [0.0, 0.0, 0.0];
/** @global Edge color for white wireframe */
var kEdgeWhite = [0.7, 0.7, 0.7];


/** @global used the change position */
var camPosition = glMatrix.vec3.create();           //the camera's current position
var camOrientation = glMatrix.quat.create();        //the camera's current orientation
var camSpeed;                                       //the camera's current speed in the forward direction
var camInitialDir = glMatrix.vec3.create();         //the camera's initial view direction 
var camUP = glMatrix.vec3.create();     
var camLook = glMatrix.vec3.create();
var keys = {};





/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


//-----------------------------------------------------------------------------
// Setup functions (run once)
/**
 * Startup function called from the HTML code to start program.
 */
function startup() {

  initialize_view();
  document.onkeydown = keyDown;
  document.onkeyup = keyUp;

  // Set up the canvas with a WebGL context.
  canvas = document.getElementById("glCanvas");
  gl = createGLContext(canvas);

  // Compile and link the shader program.
  setupShaders();

  // Let the Terrain object set up its own buffers.
  myTerrain = new Terrain(128, -1, 1, -1, 1);
  myTerrain.setupBuffers(shaderProgram);

  // Set the background color to sky blue (you can change this if you like).
  gl.clearColor(129/256, 183/256, 256/256, 1.0);

  gl.enable(gl.DEPTH_TEST);
  requestAnimationFrame(animate);
}


/**
 * Creates a WebGL 2.0 context.
 * @param {element} canvas The HTML5 canvas to attach the context to.
 * @return {Object} The WebGL 2.0 context.
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
 * Loads a shader from the HTML document and compiles it.
 * @param {string} id ID string of the shader script to load.
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
    
  // Return null if we don't find an element with the specified id
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
 * Sets up the vertex and fragment shaders.
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

  // We only need the one shader program for this rendering, so we can just
  // bind it as the current program here.
  gl.useProgram(shaderProgram);

  // Query the index of each attribute and uniform in the shader program.
  shaderProgram.locations = {};
  shaderProgram.locations.vertexPosition =
    gl.getAttribLocation(shaderProgram, "vertexPosition");
  shaderProgram.locations.vertexNormal =
    gl.getAttribLocation(shaderProgram, "vertexNormal");

  shaderProgram.locations.modelViewMatrix =
    gl.getUniformLocation(shaderProgram, "modelViewMatrix");
  shaderProgram.locations.projectionMatrix =
    gl.getUniformLocation(shaderProgram, "projectionMatrix");
  shaderProgram.locations.normalMatrix =
    gl.getUniformLocation(shaderProgram, "normalMatrix");

  shaderProgram.locations.kAmbient =
    gl.getUniformLocation(shaderProgram, "kAmbient");
  shaderProgram.locations.kDiffuse =
    gl.getUniformLocation(shaderProgram, "kDiffuse");
  shaderProgram.locations.kSpecular =
    gl.getUniformLocation(shaderProgram, "kSpecular");
  shaderProgram.locations.shininess =
    gl.getUniformLocation(shaderProgram, "shininess");
  
  shaderProgram.locations.lightPosition =
    gl.getUniformLocation(shaderProgram, "lightPosition");
  shaderProgram.locations.ambientLightColor =
    gl.getUniformLocation(shaderProgram, "ambientLightColor");
  shaderProgram.locations.diffuseLightColor =
    gl.getUniformLocation(shaderProgram, "diffuseLightColor");
  shaderProgram.locations.specularLightColor =
    gl.getUniformLocation(shaderProgram, "specularLightColor");

  shaderProgram.locations.maxz = 
    gl.getUniformLocation(shaderProgram,"maxz");

  shaderProgram.locations.minz = 
    gl.getUniformLocation(shaderProgram,"minz");
}

/**
 * Draws the terrain to the screen.
 */
function draw() {
  // Transform the clip coordinates so the render fills the canvas dimensions.
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  // Clear the color buffer and the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Generate the projection matrix using perspective projection.
  const near = 0.1;
  const far = 200.0;
  glMatrix.mat4.perspective(projectionMatrix, degToRad(45), 
                            gl.viewportWidth / gl.viewportHeight,
                            near, far);
  
  // Generate the view matrix using lookat.
  const lookAtPt = camLook;
  const eyePt = camPosition;
  const up = camUP;

  // console.log("camLook ",lookAtPt,"camPosition",eyePt,"camUP",up);

  glMatrix.mat4.lookAt(modelViewMatrix, eyePt, lookAtPt, up);

  setMatrixUniforms();
  setLightUniforms(ambientLightColor, diffuseLightColor, specularLightColor,
                   lightPosition);
  setZUniforms(myTerrain.maxz, myTerrain.minz);
  
  // Draw the triangles, the wireframe, or both, based on the render selection.
  if (document.getElementById("polygon").checked) { 
    setMaterialUniforms(kAmbient, kDiffuse, kSpecular, shininess);
    myTerrain.drawTriangles();
  }
  else if (document.getElementById("wirepoly").checked) {
    setMaterialUniforms(kAmbient, kDiffuse, kSpecular, shininess); 
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    myTerrain.drawTriangles();
    gl.disable(gl.POLYGON_OFFSET_FILL);
    setMaterialUniforms(kEdgeBlack, kEdgeBlack, kEdgeBlack, shininess);
    myTerrain.drawEdges();
  }
  else if (document.getElementById("wireframe").checked) {
    setMaterialUniforms(kEdgeBlack, kEdgeBlack, kEdgeBlack, shininess);
    myTerrain.drawEdges();
  }

  if (document.getElementById("fog").checked == true)
  {
      //update a uniform variable to let 
      //fragment shader know whether or not to fog
  }
}


/**
 * Sends the three matrix uniforms to the shader program.
 */
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.locations.modelViewMatrix, false,
                      modelViewMatrix);
  gl.uniformMatrix4fv(shaderProgram.locations.projectionMatrix, false,
                      projectionMatrix);

  // We want to transform the normals by the inverse-transpose of the
  // Model/View matrix
  glMatrix.mat3.fromMat4(normalMatrix,modelViewMatrix);
  glMatrix.mat3.transpose(normalMatrix,normalMatrix);
  glMatrix.mat3.invert(normalMatrix,normalMatrix);

  gl.uniformMatrix3fv(shaderProgram.locations.normalMatrix, false,
                      normalMatrix);
}


/**
 * Sends material properties to the shader program.
 * @param {Float32Array} a Ambient material color.
 * @param {Float32Array} d Diffuse material color.
 * @param {Float32Array} s Specular material color.
 * @param {Float32} alpha shininess coefficient
 */
function setMaterialUniforms(a, d, s, alpha) {
  gl.uniform3fv(shaderProgram.locations.kAmbient, a);
  gl.uniform3fv(shaderProgram.locations.kDiffuse, d);
  gl.uniform3fv(shaderProgram.locations.kSpecular, s);
  gl.uniform1f(shaderProgram.locations.shininess, alpha);
}


/**
 * Sends light information to the shader program.
 * @param {Float32Array} a Ambient light color/intensity.
 * @param {Float32Array} d Diffuse light color/intensity.
 * @param {Float32Array} s Specular light color/intensity.
 * @param {Float32Array} loc The light position, in view coordinates.
 */
function setLightUniforms(a, d, s, loc) {
  gl.uniform3fv(shaderProgram.locations.ambientLightColor, a);
  gl.uniform3fv(shaderProgram.locations.diffuseLightColor, d);
  gl.uniform3fv(shaderProgram.locations.specularLightColor, s);
  gl.uniform3fv(shaderProgram.locations.lightPosition, loc);
}


/**
 * Sends maxZ and minZ to the shader program.
 * @param {Float32} maxz
 * @param {Float32} minz 
 */
function setZUniforms(maxz,minz){
  gl.uniform1f(shaderProgram.locations.minz, minz);
  gl.uniform1f(shaderProgram.locations.maxz, maxz);
}


/**
 * Animates...allows user to change the geometry view between
 * wireframe, polgon, or both.
 */
 function animate(currentTime) {
  // Draw the frame.
  draw();

  // console.log(lightPosition);
  update_view();  

  // Animate the next frame. 
  requestAnimationFrame(animate);
}

/**
 * Redraw the terrain
 */
function regenerate(){
  myTerrain = new Terrain(128, -1, 1, -1, 1);
  myTerrain.setupBuffers(shaderProgram);
  initialize_view();
}


function initialize_view(){
  camPosition = glMatrix.vec3.fromValues(0, -1.4, 0.2);           //the camera's current position
  camOrientation = glMatrix.quat.create();                    //the camera's current orientation
  camSpeed = 0.001;                                          //the camera's current speed in the forward direction
  camInitialDir = glMatrix.vec3.fromValues(0, 1, 0);          //the camera's initial view direction 
  camUP = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
  camLook = glMatrix.vec3.fromValues(0.0, 2.0, -1.5);
  eulerX = 0;
  eulerY = 0;
  eulerZ = 0;
}


function update_view(){
  var eulerX = 0;
  var eulerY = 0;
  var eulerZ = 0;
  var accelerate = 0;

  if (keys["="] && accelerate < 0.001) accelerate += 0.00005;
  if (keys["-"] && accelerate > -0.001) accelerate -= 0.00005;
  if (keys["Escape"]) initialize_view();
  if (keys["w"]) eulerX -= 0.2;
  if (keys["s"]) eulerX += 0.2;
  if (keys["d"]) eulerY += 0.2;
  if (keys["a"]) eulerY -= 0.2;
  if (keys["ArrowLeft"]) eulerZ += 0.2;
  if (keys["ArrowRight"]) eulerZ -= 0.2;


  if (camSpeed >= 0.01 && accelerate > 0){
    accelerate = 0;
  }
  if (camSpeed <= 0.001 && accelerate < 0){
    accelerate = 0;
  }
  camSpeed += accelerate;

  // store the degree of rotation
  var orientationDelta = glMatrix.quat.create();
  var deltaPosition = glMatrix.quat.create();
  var localInitialDir = glMatrix.vec3.fromValues(0, 1, 0);          //the camera's initial view direction 
  var localUP = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);

  glMatrix.quat.fromEuler(orientationDelta, eulerX, eulerY, eulerZ);
  glMatrix.quat.multiply(camOrientation,camOrientation,orientationDelta);

  // update the forward direction
  glMatrix.vec3.transformQuat(camInitialDir,localInitialDir,camOrientation);
  glMatrix.vec3.normalize(camInitialDir,camInitialDir);

  // update the up direction
  glMatrix.vec3.transformQuat(camUP,localUP,camOrientation);
  glMatrix.vec3.normalize(camUP,camUP);

  // update the camera position
  glMatrix.quat.scale(deltaPosition, camInitialDir, camSpeed); // calculate the delta positon
  glMatrix.quat.add(camPosition, camPosition, deltaPosition);     // update camera postion

  // update the look at point
  glMatrix.vec3.add(camLook,camPosition,deltaPosition);

}



/** 
 * Logs keys as "down" when pressed 
 */
function keyDown(event) {
  keys[event.key] = true;
}

/** 
 * Logs keys as "up" when pressed 
 */
function keyUp(event) {
  keys[event.key] = false;
}