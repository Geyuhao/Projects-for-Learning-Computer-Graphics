var sphere_num = 2;
var step = 0.05;
var drag = 0.1;
var sphere_list = [];
var gravity = 9.8;
var bounce = 0.9;

class Ball {
    constructor()
    {
        this.Position = glMatrix.vec3.create();
        this.Velocity = glMatrix.vec3.create();
        this.Acceleration = glMatrix.vec3.create();
        this.Radius = 0;
        this.Color = [0,0,0];
        this.Mass = 0;
    }

    reset_randomly(){
        glMatrix.vec3.random(this.Position);
        glMatrix.vec3.multiply(this.Position,this.Position,[2,2,2]);
        this.Radius = Math.random()*0.2+0.5;
        this.Color[0] = Math.random();
        this.Color[1] = Math.random();
        this.Color[2] = Math.random();
        glMatrix.vec3.random(this.Velocity);
    }
}

function generate_sphere_list(){
    sphere_list = [];
    for (var i=0; i< sphere_num; i++){
        var ball = new Ball();
        ball.reset_randomly();
        sphere_list.push(ball);
    }
}

function add_one_sphere(){
    var ball = new Ball();
    ball.reset_randomly();
    sphere_list.push(ball);
}

function give_a_burst(){
    for (var i=0; i< sphere_num; i++){
        glMatrix.vec3.random(sphere_list[i].Velocity);
        glMatrix.vec3.multiply(sphere_list[i].Velocity,sphere_list[i].Velocity,[5,5,5]);
    }
}

function update_instance(sphere){
    /* Update position */
    var delta_position = glMatrix.vec3.create();
    glMatrix.vec3.multiply(delta_position, sphere.Velocity, [step,step,step]);
    glMatrix.vec3.add(sphere.Position,sphere.Position,delta_position);


    // var delta_position = glMatrix.vec3.create();
    // glMatrix.vec3.multiply(delta_position, sphere.Velocity, [step,step,step]);
    // glMatrix.vec3.negate(delta_position, delta_position);
    // glMatrix.vec3.add(sphere.Position,sphere.Position, delta_position);


    if (sphere.Position[1] - sphere.Radius <= -3.2 ){
        sphere.Position[1] = sphere.Radius - 3.2;
        glMatrix.vec3.multiply(sphere.Velocity, sphere.Velocity, [1,-bounce,1]);
    } else if (sphere.Position[1]+sphere.Radius > 3.2){
        sphere.Position[1] = 3.2 - sphere.Radius;
        glMatrix.vec3.multiply(sphere.Velocity, sphere.Velocity, [1,-bounce,1]);
    }

    if (sphere.Position[0] - sphere.Radius <= -3.2){
        sphere.Position[0] = sphere.Radius - 3.2;
        glMatrix.vec3.multiply(sphere.Velocity, sphere.Velocity, [-bounce,1,1]);
    } else if (sphere.Position[0] + sphere.Radius > 3.2) {
        sphere.Position[0] = 3.2 - sphere.Radius;
        glMatrix.vec3.multiply(sphere.Velocity, sphere.Velocity, [-bounce,1,1]);
    }

    if (sphere.Position[2] - sphere.Radius <= -3.2){
        sphere.Position[2] = sphere.Radius - 3.2;
        glMatrix.vec3.multiply(sphere.Velocity, sphere.Velocity, [1,1,-bounce]);
    } else if (sphere.Position[2] + sphere.Radius > 3.2) {
        sphere.Position[2] = 3.2 - sphere.Radius;
        glMatrix.vec3.multiply(sphere.Velocity, sphere.Velocity, [1,1,-bounce]);
    }

    /* Update speed */   // Not sure
    glMatrix.vec3.multiply(sphere.Velocity, sphere.Velocity, [Math.pow((1-drag),step),Math.pow((1-drag),step),Math.pow((1-drag),step)]);
    var delta_velocity = glMatrix.vec3.create();
    glMatrix.vec3.multiply(delta_velocity, sphere.Acceleration, [step,step,step]);
    glMatrix.vec3.add(sphere.Velocity,sphere.Velocity,delta_velocity);

    // /* Update acceleration */
    sphere.Acceleration = [0,-0.3*gravity,0];


    // check between balls
    // for (var i=0; i < sphere_num; i++){
    //     var other_position = glMatrix.vec3.clone(sphere_list[i].Position);
    //     var self_position = glMatrix.vec3.clone(sphere.Position);
        
    //     if (other_position[0] == self_position[0] && other_position[1] == self_position[1] && other_position[2] == self_position[2]){
    //         continue;
    //     }

    //     var delta_position = glMatrix.vec3.create();
    //     glMatrix.vec3.multiply(delta_position, sphere.Velocity, [step,step,step]);
    //     glMatrix.vec3.add(self_position, self_position, delta_position);

    //     var delta_position = glMatrix.vec3.create();
    //     glMatrix.vec3.multiply(delta_position, sphere_list[i].Velocity, [step,step,step]);
    //     glMatrix.vec3.add(other_position, sphere_list[i].Position, delta_position);

    //     var distance0 = Math.pow((other_position[0]-self_position[0]),2);
    //     var distance1 = Math.pow((other_position[1]-self_position[1]),2);
    //     var distance2 = Math.pow((other_position[2]-self_position[2]),2);
    //     var distance = Math.sqrt(distance0+distance1+distance2);

    //     if (distance < (sphere_list[i].Radius + sphere.Radius)){
    //         var normal = glMatrix.vec3.fromValues((other_position[0]-self_position[0]),(other_position[1]-self_position[1]),(other_position[2]-self_position[2]));
    //         glMatrix.vec3.normalize(normal,normal);

    //         /* Update myself */
    //         var delta_position = glMatrix.vec3.create();
    //         glMatrix.vec3.multiply(delta_position, sphere.Velocity, [step,step,step]);
    //         glMatrix.vec3.negate(delta_position, delta_position);
    //         glMatrix.vec3.add(sphere.Position,sphere.Position, delta_position);

    //         var temp = glMatrix.vec3.create();
    //         var result = glMatrix.vec3.create();
    //         glMatrix.vec3.multiply(temp, sphere.Velocity, normal);
    //         glMatrix.vec3.multiply(temp, temp, normal);
    //         glMatrix.vec3.multiply(temp, temp, [2,2,2]);
    //         glMatrix.vec3.negate(result,temp);
    //         result = glMatrix.vec3.add(result,sphere.Velocity,result);
    //         sphere.Velocity = result;

    //         /* Update others */
    //         var delta_position = glMatrix.vec3.create();
    //         glMatrix.vec3.multiply(delta_position, sphere_list[i].Velocity, [step,step,step]);
    //         glMatrix.vec3.negate(delta_position, delta_position);
    //         glMatrix.vec3.add(sphere_list[i].Position,sphere_list[i].Position, delta_position);

    //         var temp = glMatrix.vec3.create();
    //         var result = glMatrix.vec3.create();
    //         glMatrix.vec3.multiply(temp, sphere_list[i].Velocity, normal);
    //         glMatrix.vec3.multiply(temp, temp, normal);
    //         glMatrix.vec3.multiply(temp, temp, [2,2,2]);
    //         glMatrix.vec3.negate(result,temp);
    //         result = glMatrix.vec3.add(result,sphere_list[i].Velocity,result);
    //         sphere_list[i].Velocity = result;
    //     }
    // }
}


function fetch_parameters(){
    if (keys["q"]) {
        sphere_num += 1;
        add_one_sphere();
    }

    if (keys["w"]) {
        sphere_num = 0;
        sphere_list = [];
    }

    gravity = parseFloat(document.getElementById("gravity").value);
    document.getElementById("gravityValue").innerHTML = gravity;
    drag = parseFloat(document.getElementById("drag").value);
    document.getElementById("dragValue").innerHTML = drag;
    bounce = parseFloat(document.getElementById("bounce").value);
    document.getElementById("bounceValue").innerHTML = bounce;
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
  