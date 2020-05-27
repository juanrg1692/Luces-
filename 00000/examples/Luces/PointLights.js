



var easycam;
var phongshader;
let human;


var matWhite  = { diff:[1   ,1   ,1   ], spec:[1,1,1], spec_exp:400.0 };
var matDark   = { diff:[0.2 ,0.3 ,0.4 ], spec:[1,1,1], spec_exp:400.0 };
var matRed    = { diff:[1   ,0.05,0.01], spec:[1,0,0], spec_exp:400.0 };
var matBlue   = { diff:[0.01,0.05,1   ], spec:[0,0,1], spec_exp:400.0 };
var matGreen  = { diff:[0.05,1   ,0.01], spec:[0,1,0], spec_exp:400.0 };
var matYellow = { diff:[1   ,1   ,0.01], spec:[1,1,0], spec_exp:400.0 };
var matYellow0 = { diff:[1   ,1   ,0.01], spec:[1,1,0], spec_exp:400.0 };

var materials = [ matWhite, matRed, matBlue, matGreen, matYellow,matYellow0 ];



var ambientlight = { col : [0,0,0] };

var directlights = [
  { dir:[-1,-1,0], col:[0,0,0] },
];

function preload() {
  human = loadModel('FinalBaseMesh.obj', true);
}



function setup () {
  
  pixelDensity(1);
  
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
 
  var phong_vert = document.getElementById("phong.vert").textContent;
  var phong_frag = document.getElementById("phong.frag").textContent;
  
  phongshader = new p5.Shader(this._renderer, phong_vert, phong_frag);
  
  

easycam = new Dw.EasyCam(this._renderer, {distance : 200}); 
  

}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0,0,windowWidth, windowHeight]);
}



function draw () {

push();
rotateX(radians(90));
rotateZ(frameCount*0.005);
var val0 = map(sin(frameCount*0.07),-1,1,0,300);
var val = map(noise(frameCount*0.1),0,1,0,val0);
var pointlights = [
  { pos:[0,0,0,1], col:[0.00, 1.00, 1.00], rad:val},
  { pos:[0,0,0,1], col:[1.00, 1.00, 0.00], rad:val},
  { pos:[0,0,0,1], col:[1.00, 0.00, 0.00], rad:val},
  { pos:[0,0,0,1], col:[0.00, 0.00, 1.00], rad:val},
  { pos:[0,0,0,1], col:[1.00, 0.00, 1.00], rad:val},
];

  
  setShader(phongshader);
 
  setAmbientlight(phongshader, ambientlight);
  addDirectlight(phongshader, directlights, 0);
 

  perspective(60 * PI/180, width/height, 1, 20000);
  

  background(0);
  noStroke();
 

  

randomSeed(5);
  for(var i = 0; i<pointlights.length; i++){
    var xx = random(-200,200);
    var yy = random(-200,200);
    var zz = random(-200,200);

    var yval = map(sin(frameCount*0.03+i),-1,1,-0,0);

      push();  
      translate(0, 0, 0);
      translate(-200+i*100,yval,0);
      addPointLight(phongshader, pointlights, i);
      pop();
    }

  setShader(phongshader);
  

  var sz = 2000;

for(var i = 0; i<100; i++){
 push();
 translate(random(-sz/6,sz/6),random(-sz/6,sz/6),-5);
 rotateZ(radians(random(360)));
 rotateX(radians(90));
 scale(0.1);
 setMaterial(phongshader, matWhite);
 model(human);
 pop();
}

  push();  
  translate(0, 0,-20);
  setMaterial(phongshader, matWhite);
  box(sz,sz,10);
  pop();


  push();  
  translate(0, 0, 20);
  setMaterial(phongshader, matWhite);
  box(sz,sz,10);
  pop();


  for(var i = -sz/2; i<sz/2; i+=50){
    for(var j = -sz/2; j<sz/2; j+=50){
    var xx = random(-sz/2,sz/2);
    var yy = random(-sz/2,sz/2);
    var zz = random(-200,5);

    push();
    translate(i,j,0);
    rotateX(radians(90));
    setMaterial(phongshader, matWhite);
    cylinder(7,30,30);
    pop();
}
    }

pop();

}







function setShader(shader){
  shader.uniforms.uUseLighting = true; 
  this.shader(shader);
}


function setMaterial(shader, material){
  shader.setUniform('material.diff'    , material.diff);
  shader.setUniform('material.spec'    , material.spec);
  shader.setUniform('material.spec_exp', material.spec_exp);
}


function setAmbientlight(shader, ambientlight){
  shader.setUniform('ambientlight.col', ambientlight.col);
}


var m4_modelview = new p5.Matrix();
var m3_directions = new p5.Matrix('mat3');

function addDirectlight(shader, directlights, idx){
  

  m4_modelview.set(easycam.renderer.uMVMatrix);
  m3_directions.inverseTranspose(m4_modelview);
  
  var light = directlights[idx];

  var [x,y,z] = light.dir;
  var mag = Math.sqrt(x*x + y*y + z*z); 
  var light_dir = [x/mag, y/mag, z/mag];

  light_dir = m3_directions.multVec(light_dir);

  shader.setUniform('directlights['+idx+'].dir', light_dir);
  shader.setUniform('directlights['+idx+'].col', light.col);
}


function addPointLight(shader, pointlights, idx){
  
  var light = pointlights[idx];
  
  light.pos_cam = easycam.renderer.uMVMatrix.multVec(light.pos);
  
  shader.setUniform('pointlights['+idx+'].pos', light.pos_cam);
  shader.setUniform('pointlights['+idx+'].col', light.col);
  shader.setUniform('pointlights['+idx+'].rad', light.rad);
  
  var col = light.col;
  

  fill(col[0]*255, col[1]*255, col[2]*255);
  sphere(0);
}



p5.Matrix.prototype.multVec = function(vsrc, vdst){
  
  vdst = (vdst instanceof Array) ? vdst : [];
  
  var x=0, y=0, z=0, w=1;
  
  if(vsrc instanceof p5.Vector){
    x = vsrc.x;
    y = vsrc.y;
    z = vsrc.z;
  } else if(vsrc instanceof Array){
    x = vsrc[0];
    y = vsrc[1];
    z = vsrc[2];
    w = vsrc[3]; w = (w === undefined) ? 1 : w;
  } 

  var mat = this.mat4 || this.mat3;
  if(mat.length === 16){
    vdst[0] = mat[0]*x + mat[4]*y + mat[ 8]*z + mat[12]*w;
    vdst[1] = mat[1]*x + mat[5]*y + mat[ 9]*z + mat[13]*w;
    vdst[2] = mat[2]*x + mat[6]*y + mat[10]*z + mat[14]*w;
    vdst[3] = mat[3]*x + mat[7]*y + mat[11]*z + mat[15]*w; 
  } else {
    vdst[0] = mat[0]*x + mat[3]*y + mat[6]*z;
    vdst[1] = mat[1]*x + mat[4]*y + mat[7]*z;
    vdst[2] = mat[2]*x + mat[5]*y + mat[8]*z;
  }
 
  return vdst;
}
