import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { x1,y1,x2,y2,positions1,positions2,updatePendulum,speedFactor,limit,lastIndex,i } from './pendulum.js';
let j = 0;
//let traceArray = [new THREE.Vector3(0,0,0)]; 
  while (i < (limit - 1)) {
    updatePendulum();
    }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });

const controls = new OrbitControls(camera, renderer.domElement);
const color = 'white';
const intensity = 3;

const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 8);
scene.add(light);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(0.1, 32, 16);
const material = new THREE.MeshPhongMaterial({ color: 'blue' });
const material2 = new THREE.MeshPhongMaterial({ color: 'red' });
const pendulumBob1 = new THREE.Mesh(geometry, material);

pendulumBob1.position.set(x1, y1, 0);
const pendulumBob2 = new THREE.Mesh(geometry, material2);
pendulumBob2.position.set(x2, y2, 0);


const rodGeometry1 = new LineGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(x1, y1, 0)]);
const rodGeometry2 = new LineGeometry().setFromPoints([new THREE.Vector3(x1, y1, 0), new THREE.Vector3(x2, y2, 0)]);
const traceGeometry = new LineGeometry().setFromPoints(positions2);

const rodMaterial = new LineMaterial({ linewidth: 1, color: 0xffffff });
const traceMaterial = new LineMaterial({ linewidth: 1, color: 0x008000 }); 

const rod1 = new Line2(rodGeometry1, rodMaterial);
const rod2 = new Line2(rodGeometry2, rodMaterial);
const lineTrace = new Line2(traceGeometry, traceMaterial);

scene.add(lineTrace);
scene.add(pendulumBob1);
scene.add(pendulumBob2);
scene.add(rod1);
scene.add(rod2);    

camera.position.set(0, 0, 4);

scene.add(camera);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
/*
window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        // Reset the pendulum state
        state = (0, 0, 0, 0);
    }
});
*/    
function animate() {
 
    // Update the positions in the 3D scene
    
   pendulumBob1.position.set(positions1[j].x, positions1[j].y, 0);
   pendulumBob2.position.set(positions2[j].x, positions2[j].y, 0);

   rod1.geometry.attributes.position.setXYZ(1, positions1[j].x, positions1[j].y, 0);
   rod2.geometry.attributes.position.setXYZ(0, positions1[j].x, positions1[j].y, 0);
   rod2.geometry.attributes.position.setXYZ(1, positions2[j].x, positions2[j].y, 0);

   traceGeometry.setDrawRange(0,j);
   //console.log("got this far");
    
    j = (j + 1) % limit;
  
  
   rod1.geometry.computeBoundingSphere();
   rod2.geometry.computeBoundingSphere();
   //lineTrace.geometry.computeBoundingSphere();
    rod1.geometry.attributes.position.needsUpdate = true;
    rod2.geometry.attributes.position.needsUpdate = true;
    lineTrace.geometry.attributes.position.needsUpdate = true;
   
    renderer.render(scene, camera);
    controls.update();
   
    requestAnimationFrame( animate );
    
}

animate();

