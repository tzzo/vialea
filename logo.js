// import * as THREE from 'three';
// import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
// import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// 
// // Create scene, camera, and renderer
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);
// 
// // Bloom effect setup
// const composer = new EffectComposer(renderer);
// const renderPass = new RenderPass(scene, camera);
// composer.addPass(renderPass);
// 
// // Load SVG
// const loader = new SVGLoader();
// loader.load('./logo.svg', function (data) {
//     const paths = data.paths;
//     const group = new THREE.Group();
// 
//     paths.forEach(path => {
//         const shapes = path.toShapes(true);
//         shapes.forEach(shape => {
//             const geometry = new THREE.ExtrudeGeometry(shape, {
//                 depth: 40,
//                 bevelEnabled: true,
//                 bevelThickness: 8,  // More rounded edges
//                 bevelSize: 2,  // Smoother transitions
//                 bevelSegments: 16, // High segments for smoothness
//                 curveSegments: 20 // More curve detail
//             });
// 
//             const material = new THREE.MeshPhysicalMaterial({
//                 color: 0xF00111,
//                 metalness: 0.9,
//                 roughness: 0.1,
//                 clearcoat: 10,
//                 clearcoatRoughness: 0.05, // Small amount of roughness for less overexposure
//                 reflectivity: 0.9, // Reduced reflectivity slightly
//                 emissive: 0x012900,
//                 emissiveIntensity: 1 // Lowered from 0.5
//             });
// 
//             const mesh = new THREE.Mesh(geometry, material);
//             group.add(mesh);
//         });
//     });
// 
//     group.scale.set(0.2, 0.2, 0.2);
//     group.rotation.x = Math.PI;
// 
//     // Compute bounding box and recenter group
//     const box = new THREE.Box3().setFromObject(group);
//     const center = box.getCenter(new THREE.Vector3());
//     group.position.sub(center);
// 
//     // Create a pivot and add the group to it
//     const pivot = new THREE.Group();
//     pivot.add(group);
//     scene.add(pivot);
// 
//     // Store the pivot for rotation in the animation loop
//     window.rotatingPivot = pivot;
// });
// 
// // Lighting setup
// const pointLight = new THREE.PointLight(0xffffff, 1.8, 150); // Reduced intensity from 3
// pointLight.position.set(20, 30, 50);
// 
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Reduced from 1.5
// directionalLight.position.set(-20, 30, 30);
// 
// const ambientLight = new THREE.AmbientLight(0x404040, 1); // Reduced from 1.5
// scene.add(ambientLight);
// 
// // Camera position
// camera.position.set(0, 0, 120);
// 
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
// // Adjusted Bloom Effect - Lower brightness
// bloomPass.threshold = 0;
// bloomPass.strength = .7; // Reduced from 1.5
// bloomPass.radius = 1; // Reduced from 1
// composer.addPass(bloomPass);
// 
// // Render loop
// function animate() {
//     requestAnimationFrame(animate);
// 
//     // Rotate the pivot for a dynamic effect
//     if (window.rotatingPivot) {
//         window.rotatingPivot.rotation.y -= 0.01;
//     }
// 
//     composer.render();
// }
// animate();

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
// import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
// import { SVGLoader } from 'https://unpkg.com/three@0.155.0/examples/jsm/loaders/SVGLoader.js';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
document.getElementById('logo-wrapper').appendChild(renderer.domElement);

function resizeCanvas() {
    const aspect = window.innerWidth / window.innerHeight;
    
    if (aspect > 1) {
        camera.fov = 45;
        camera.position.z = 100;
    } else {
        camera.fov = 70;
        camera.position.z = 120;
    }
    
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let materials = [];

// Load SVG
const loader = new SVGLoader();
loader.load('./logo.svg', function (data) {
    const paths = data.paths;
    const group = new THREE.Group();

    paths.forEach(path => {
        const shapes = path.toShapes(true);
        
        shapes.forEach(shape => {
            const extrudeGeometry = new THREE.ExtrudeGeometry(shape, {
                depth: 40, 
                bevelEnabled: true, 
                bevelSize: 1.5
            });
            const material = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color(`hsl(180, 100%, 50%)`), 
                metalness: 1, 
                roughness: 0.4,
                side: THREE.DoubleSide 
            });
            materials.push(material);
            const mesh = new THREE.Mesh(extrudeGeometry, material);
            group.add(mesh);

            // Solid back face
            const shapeGeometry = new THREE.ShapeGeometry(shape);
            const backMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color(`hsl(160, 100%, 40%)`), 
                metalness: 1, 
                roughness: 0 
            });
            materials.push(backMaterial);
            const backMesh = new THREE.Mesh(shapeGeometry, backMaterial);
            backMesh.position.z = -0.5;
            group.add(backMesh);
        });

        // Convert strokes (outlines) into 3D lines
        const strokeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 5 });
        path.subPaths.forEach(subPath => {
            const strokePoints = subPath.getPoints();
            const strokeGeometry = new THREE.BufferGeometry().setFromPoints(strokePoints);
            const strokeMesh = new THREE.Line(strokeGeometry, strokeMaterial);
            group.add(strokeMesh);
        });
    });

    var scale = 0.15;
    group.scale.set(scale, scale, scale);
    group.rotation.x = Math.PI;

    // Compute bounding box and recenter group
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);

    // Create a pivot and add the group to it
    const pivot = new THREE.Group();
    pivot.add(group);
    scene.add(pivot);

    window.rotatingPivot = pivot;
});

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 50, 100);
pointLight.position.set(20, 20, 20);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(-10, 10, 15);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

let hue = 0;
// let time = 0;

function animate() {
    requestAnimationFrame(animate);

    // Rotate the pivot to make the SVG rotate around its center
    if (window.rotatingPivot) {
        window.rotatingPivot.rotation.y -= 0.009;
    }

    // Update hue for color animation
    hue = (hue + 0.01) % 360;
    const newColor = new THREE.Color(`hsl(${hue}, 100%, 50%)`);

    // Animate metalness value between 0.9 and 1.5
    // time += 0.001; // Controls speed of oscillation
    // const metalnessValue = 0.95 + (Math.sin(time) * 0.15); // Oscillates between 0.9 and 1.5

    materials.forEach(material => {
        material.color.set(newColor);
        //material.metalness = metalnessValue;
    });

    renderer.render(scene, camera);
}
animate();






//import * as THREE from 'three';
//import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
//import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
//import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
//import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
//import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
//
//// Scene, Camera, Renderer
//const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
//const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.toneMapping = THREE.ACESFilmicToneMapping;
//renderer.toneMappingExposure = 2.2;
//document.body.appendChild(renderer.domElement);
//
//// Load Bright HDRI Environment
//new RGBELoader().setPath('textures/').load('studio_hdri.hdr', function (texture) {
//    texture.mapping = THREE.EquirectangularReflectionMapping;
//    scene.environment = texture;
//    scene.background = new THREE.Color(0x000000); // Keep background dark for contrast
//});
//
//// Load SVG
//const loader = new SVGLoader();
//loader.load('./logo.svg', function (data) {
//    const paths = data.paths;
//    const group = new THREE.Group();
//
//    paths.forEach(path => {
//        const shapes = path.toShapes(true);
//
//        shapes.forEach(shape => {
//            // 🌟 **Frosted Ice & Glossy Plastic Combo**
//            const material = new THREE.MeshPhysicalMaterial({
//                color: 0xccf2ff,        // Cool ice blue
//                metalness: 0.1,         // Slight metallic feel
//                roughness: 0.1,         // Smooth reflections
//                transmission: 1.0,      // Fully see-through like ice
//                ior: 1.5,               // Refractive index for icy effect
//                thickness: 8,           // More thickness to scatter light
//                envMapIntensity: 2.5,   // Boost reflections
//                clearcoat: 1.0,         // Outer glossy layer
//                clearcoatRoughness: 0.05,
//                specularIntensity: 2,   // Sharp reflections
//                attenuationDistance: 3, // Light diffusion inside
//                attenuationColor: new THREE.Color(0xaad4ff), // Light blue tint inside
//            });
//
//            // Extruded Front & Sides
//            const extrudeGeometry = new THREE.ExtrudeGeometry(shape, {
//                depth: 40, 
//                bevelEnabled: true,
//                bevelThickness: 2,
//                bevelSize: 2,
//                bevelSegments: 8, // Smooth edges
//            });
//            const mesh = new THREE.Mesh(extrudeGeometry, material);
//            group.add(mesh);
//        });
//    });
//
//    group.scale.set(0.2, 0.2, 0.2);
//    group.rotation.x = Math.PI;
//
//    // Center the group
//    const box = new THREE.Box3().setFromObject(group);
//    const center = box.getCenter(new THREE.Vector3());
//    group.position.sub(center);
//
//    // Create a pivot for rotation
//    const pivot = new THREE.Group();
//    pivot.add(group);
//    scene.add(pivot);
//
//    window.rotatingPivot = pivot;
//});
//
//// Better Lighting for Shiny Look
//const pointLight = new THREE.PointLight(0xffffff, 20, 300);
//pointLight.position.set(20, 50, 30);
//scene.add(pointLight);
//
//const ambientLight = new THREE.AmbientLight(0xffffff, 2);
//scene.add(ambientLight);
//
//// Post-Processing Effects
//const composer = new EffectComposer(renderer);
//composer.addPass(new RenderPass(scene, camera));
//
//// 🌟 **Bloom Effect for Glow**
//const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.6, 0.9);
//composer.addPass(bloomPass);
//
//// Camera Position
//camera.position.set(0, 0, 150);
//
//// Animation Loop
//function animate() {
//    requestAnimationFrame(animate);
//    if (window.rotatingPivot) {
//        window.rotatingPivot.rotation.y -= 0.01;
//    }
//    composer.render();
//}
//animate();
//
