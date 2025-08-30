import * as THREE from 'three';

export let m1 = 2; // Mass of the first pendulum bob (kg)
export let m2 = 2; // Mass of the second pendulum bob (kg)
export let l1 = 1; // Length of the first pendulum rod (m)
export let l2 = 1; // Length of the second pendulum rod (m)
export let g = 9.81; // Acceleration due to gravity (m/s^2)
export let potentialCorrection = g * (m1 * l1) + g * m2 * (l1 + l2); // Adjustment to calculate Potential Energy at initial point
export let state = [Math.PI/1.2, Math.PI/2, 0, 0]; // Initial state: (angle1, angle2, angularVelocity1, angularVelocity2)
export let derivative = [0, 0, 0, 0]; // Derivative of the state: (d/dt_angle1, d/dt_angle2, d/dt_angularVelocity1, d/dt_angularVelocity2)
export let x1 = l1 * Math.sin(state[0]); // Initial x position of the first pendulum bob
export let y1 = -l1 * Math.cos(state[0]); // Initial y position of the first pendulum bob
export let x2 = x1 + l2 * Math.sin(state[1]); // Initial x position of the second pendulum bob
export let y2 = y1 - l2 * Math.cos(state[1]); // Initial y position of the second pendulum bob
export let dt = 0.01; // Time step for simulation (seconds)
export let tolerance = 0.000001; //Error tolerance level
export let t = 0; // Track time interval for animation (seconds)
export let speedFactor = 2; // Adjust this factor to speed up or slow down the simulation
export let limit = 450 * speedFactor; // Number of positions to calculate
export let lastIndex = limit - 1;
export let positions1 = new Array(limit).fill(0); // Position data for Pendulum Bob 1
export let positions2 = new Array(limit).fill(0); // Position data for Pendulum Bob 2
export let i = 0;

positions1[i] = (new THREE.Vector3(x1, y1 ,0));
positions2[i] = (new THREE.Vector3(x2, y2 ,0));

let PE = g * (m1 * y1 + m2 * y2) + potentialCorrection; // Potential Energy

let KE = 0.5 * m1 * (l1 ** 2) * (state[2] ** 2) + 0.5 * m2 * ((l1 ** 2) * (state[2] ** 2) + (l2 ** 2) * (state[3] ** 2) + 
                2 * l1 * l2 * state[2] * state[3] * Math.cos(state[0] - state[1])); // Kinetic Energy

let TE = PE + KE; // Total Energy

// Constants for Runge-Kutta algorithm
const c1 = 16/135 - 25/216
const c3 = 6656/12825 - 1408/2565;
const c4 = 28561/56430 - 2197/4101;
const c5 = -9/50 + 1/5;
const c6 = 2/55;

function stateDerivative(state) { // Calculate derivatives
    
    const omega1 = state[2];
    const omega2 = state[3];
    const alpha1 = angularAcceleration1(state);
    const alpha2 = angularAcceleration2(state);
    return [omega1, omega2, alpha1, alpha2];
}

function angularAcceleration1(state) { // Calculate angular acceleration of Pendulum Bob 1
    const [theta1, theta2, omega1, omega2] = state;
    const alpha1 = -g*(2*m1+m2)*Math.sin(theta1) - (m2*g*Math.sin(theta1-2*theta2)) - (2*Math.sin(theta1-theta2)*m2*(l2*(omega2**2) + 
                    (l1*(omega1**2)*Math.cos(theta1-theta2)))) / (l1*(2*m1 + m2*(1 - Math.cos(2*(theta1-theta2)))));    
    return alpha1;
} 

function angularAcceleration2(state) { // Calculate angular acceleration of Pendulum Bob 1
    const [theta1, theta2, omega1, omega2] = state;
    const alpha2 = 2*Math.sin(theta1-theta2)*((l1*(m1+m2)*(omega1**2)) + Math.cos(theta1)*g*(m1+m2) + l2*m2*(omega2**2)*Math.cos(theta1-theta2)) /
                    (l2*(2*m1+m2*(1-Math.cos(2*(theta1-theta2)))));
    return alpha2;
 }

 function rk45(currentState, h) {
    // Runge-Kutta-Fehlberg 4th/5th order method for updating the state
    let k1 = stateDerivative(currentState);
    k1 = k1.map(element => h * element);

    let k2State = currentState.map((element, index) => element + 1/4 * k1[index]);
    let k2 = stateDerivative(k2State);
    k2 = k2.map(element => h * element);
    
    let k3State = currentState.map((element, index) => element + 3/32 * k1[index]);
    k3State = k3State.map((element, index) => element + 9/32 * k2[index]);
    let k3 = stateDerivative(k3State);
    k3 = k3.map(element => h * element);

    let k4State = currentState.map((element, index) => element + 1932/2197 * k1[index]);
    k4State = k4State.map((element, index) => element - 7200/2197 * k2[index]);
    k4State = k4State.map((element, index) => element + 7296/2197 * k3[index]);
    let k4 = stateDerivative(k4State);
    k4 = k4.map(element => h * element);

    let k5State = currentState.map((element, index) => element + 439/216 * k1[index]);
    k5State = k5State.map((element, index) => element - 8 * k2[index]);
    k5State = k5State.map((element, index) => element + 3680/513 * k3[index]);
    k5State = k5State.map((element, index) => element - 845/4104 * k4[index]);
    let k5 = stateDerivative(k5State);
    k5 = k5.map(element => h * element);

    let k6State = currentState.map((element, index) => element - 8/27 * k1[index]);
    k6State = k6State.map((element, index) => element + 2 * k2[index]);
    k6State = k6State.map((element, index) => element - 3544/2565 * k3[index]);
    k6State = k6State.map((element, index) => element + 1859/4104 * k4[index]);
    k6State = k6State.map((element, index) => element - 11/40 * k5[index]);
    let k6 = stateDerivative(k6State);
    k6 = k6.map(element => h * element);


    const nextStepRK5 = currentState.map((element, index) => element + 16/135 * k1[index] + 
                        6656/12825 * k3[index] + 28561/56430 * k4[index] - 9/50 * k5[index] + 2/55 * k6[index]);

    const error = Math.abs(c1*k1[0] + c3*k3[0] + c4*k4[0] + c5*k5[0] + c6*k6[0]);
    
    if (error == 0) {
        return nextStepRK5; // No error, accept the step
    }

    else if (error > tolerance) {
        h = 0.9 * h * Math.pow(tolerance / error, 0.2); // Reduce step size
        dt = h;
        return rk45(currentState, dt); // Retry with smaller step size
    }
     else {
        h = 0.9 * h * Math.pow(tolerance / error, 0.25); // Increase step size
        dt = h;
        return nextStepRK5; // Accept the step
    }  
    
}

export function updatePendulum() {
    state = rk45(state, dt);
    t += dt;
    const [theta1, theta2, omega1, omega2] = state;

    // Update the positions of the pendulum bobs
    x1 = l1 * Math.sin(theta1);
    y1 = -l1 * Math.cos(theta1);
    x2 = x1 + l2 * Math.sin(theta2);
    y2 = y1 - l2 * Math.cos(theta2);

    if (t >= (1/(60*speedFactor))) { // Set number of positions to store based on desired playback speed
    i++;
    positions1[i] = (new THREE.Vector3(x1, y1, 0));
    positions2[i] = (new THREE.Vector3(x2, y2, 0));
    t = 0;
    }
    PE = g * (m1 * y1 + m2 * y2) + potentialCorrection; // Potential Energy
    //console.log("Potential Energy: " + PE);

    KE = 0.5 * m1 * (l1 ** 2) * (state[2] ** 2) + 0.5 * m2 * ((l1 ** 2) * (state[2] ** 2) + (l2 ** 2) * (state[3] ** 2) + 
                2 * l1 * l2 * state[2] * state[3] * Math.cos(state[0] - state[1])); // Kinetic Energy
    //console.log("Kinetic Energy: " + KE);

    TE = PE + KE; // Total Energy
    //console.log("Total Energy: " + TE);
}

