import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';

// Global variables
let group, camera, controls, scene, renderer;
let mixer, clock, clip, clipAction;
let userImageURL = './img/Logo_texture.png';

// DOM Elements
const canvasContainer = document.getElementById('canvas-container');
const themeToggle = document.getElementById('theme-toggle');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const screenshotBtn = document.getElementById('screenshot-btn');
const exportBtn = document.getElementById('export_objects');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupThemeToggle();
    setupTabs();
    setupMobileUI();
    initializeScene();
    setupEventListeners();
});

// Theme toggle functionality
function setupThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeIcon = themeToggle.querySelector('i');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeIcon.classList.toggle('fa-sun');
        themeIcon.classList.toggle('fa-moon');
        
        localStorage.setItem('theme', 
            document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
}

// Tab switching functionality
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active state for buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show the selected tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Mobile UI setup
function setupMobileUI() {
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

// Main scene initialization
function initializeScene() {
    clock = new THREE.Clock();
    
    // Create scene
    scene = new THREE.Scene();
    scene.name = 'Scene';
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    const screenColor = document.getElementById('screenColor').value;
    renderer.setClearColor(screenColor, 1);
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvasContainer.appendChild(renderer.domElement);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 1, 500);
    camera.position.set(1, 2, 3);
    camera.name = "PerspectiveCamera";
    scene.add(camera);
    
    // Controls setup
    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.autoRotate = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.00001;
    controls.screenSpacePanning = false;
    controls.minDistance = 0;
    controls.maxDistance = 5000;
    controls.rotateSpeed = 5;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.lookAt(0, 0, 0);
    dirLight.name = 'DirectionalLight';
    dirLight.position.set(0, 0, 1000);
    camera.add(dirLight);
    
    // Group to be exported
    group = new THREE.Group();
    scene.add(group);
    
    // Create initial sphere
    createSphere();
    
    // Setup animation
    updateAnimation();
    
    // Handle window resizing
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    animate();
}

// Event listeners setup
function setupEventListeners() {
    // Texture upload
    document.getElementById("texture").addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            const userImage = event.target.files[0];
            userImageURL = URL.createObjectURL(userImage);
            document.getElementById('usematerial').checked = true;
            showToast(`Loaded image: ${userImage.name}`, 'success');
            createSphere();
            
            // Update file info
            const fileInfo = document.getElementById('file-info');
            fileInfo.textContent = userImage.name;
        }
    });
    
    // Sphere appearance controls
    const appearanceControls = ['double', 'transparent', 'usematerial', 'usecolor', 'color'];
    appearanceControls.forEach(id => {
        document.getElementById(id).addEventListener('change', createSphere);
    });
    
    // Animation controls
    const animationControls = ['option_animationX', 'option_animationY', 'option_animationZ', 
                              'animDuration', 'option_animation_dir'];
    animationControls.forEach(id => {
        document.getElementById(id).addEventListener('change', updateAnimation);
    });
    
    // Background color
    document.getElementById('screenColor').addEventListener('change', (event) => {
        renderer.setClearColor(event.target.value, 1);
    });
    
    // Screenshot button
    screenshotBtn.addEventListener('click', takeScreenshot);
    
    // Export button
    exportBtn.addEventListener('click', () => {
        exportGLTF(group);
    });
}

// Handle window resize
function handleResize() {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    controls.handleResize();
}

// Create or update the sphere
function createSphere() {
    // Remove existing sphere
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
    
    // Create geometry
    const geometry = new THREE.SphereBufferGeometry(1, 60, 60);
    const material = new THREE.MeshStandardMaterial();

    // Apply settings
    if (document.getElementById('usecolor').checked) {
        material.color.set(document.getElementById('color').value);
    }
    
    if (document.getElementById('usematerial').checked) {
        material.map = new THREE.TextureLoader().load(userImageURL);
    }
    
    if (document.getElementById('double').checked) {
        material.side = THREE.DoubleSide;
    }
    
    if (document.getElementById('transparent').checked) {
        material.opacity = 1;
        material.transparent = true;
    }

    // Create and add mesh
    const sphereObject = new THREE.Mesh(geometry, material);
    sphereObject.name = 'sphere';
    group.add(sphereObject);
}

// Update animation settings
function updateAnimation() {
    // Get animation settings from controls
    const rotX = (document.getElementById('option_animationX').checked) ? 1 : 0;
    const rotY = (document.getElementById('option_animationY').checked) ? 1 : 0;
    const rotZ = (document.getElementById('option_animationZ').checked) ? 1 : 0;
    const animDuration = document.getElementById('animDuration').value;
    const direction = (document.getElementById('option_animation_dir').checked) ? 1 : -1;
    
    // No animation if all axes are off
    if (rotX === 0 && rotY === 0 && rotZ === 0) {
        if (mixer) {
            mixer.stopAllAction();
        }
        return;
    }
    
    // Create animation
    const axis = new THREE.Vector3(rotX, rotY, rotZ);
    axis.normalize();
    const qInitial = new THREE.Quaternion().setFromAxisAngle(axis, -Math.PI * direction);
    const qMiddle = new THREE.Quaternion().setFromAxisAngle(axis, 0);
    const qFinal = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI * direction);
    
    const quaternionKF = new THREE.QuaternionKeyframeTrack(
        '.quaternion', 
        [0, animDuration/2, animDuration], 
        [
            qInitial.x, qInitial.y, qInitial.z, qInitial.w,
            qMiddle.x, qMiddle.y, qMiddle.z, qMiddle.w,
            qFinal.x, qFinal.y, qFinal.z, qFinal.w
        ]
    );
    
    clip = new THREE.AnimationClip('Action', animDuration, [quaternionKF]);
    mixer = new THREE.AnimationMixer(group);
    clipAction = mixer.clipAction(clip);
    clipAction.play();
    
    showToast('Animation updated', 'success');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Render function
function render() {
    renderer.render(scene, camera);
}

// Take a screenshot
function takeScreenshot() {
    renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'XRSTORY_ScreenShot.png';
        a.click();
        
        showToast('Screenshot saved!', 'success');
    }, 'image/png', 1.0);
}

// Export the 3D model
function exportGLTF(input) {
    updateAnimation();
    
    const gltfExporter = new GLTFExporter();
    const options = {
        trs: true,
        onlyVisible: true,
        truncateDrawRange: true,
        binary: (document.getElementById('exportFormat').value == 1),
        animations: ((document.getElementById('option_animationX').checked || 
                    document.getElementById('option_animationY').checked || 
                    document.getElementById('option_animationZ').checked) ? 
                    [clip] : []),
        forceIndices: true
    };
    
    gltfExporter.parse(input, function(result) {
        let gltfFileName = document.getElementById('gltfFileName').value || "sphere";
        
        if (result instanceof ArrayBuffer) {
            saveArrayBuffer(result, gltfFileName + '.glb');
            showToast(`Exported as ${gltfFileName}.glb`, 'success');
        } else {
            const output = JSON.stringify(result, null, 2);
            saveString(output, gltfFileName + '.gltf');
            showToast(`Exported as ${gltfFileName}.gltf`, 'success');
        }
    }, options);
}

// Helper functions for saving files
function save(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

function saveString(text, filename) {
    save(new Blob([text], { type: 'text/plain' }), filename);
}

function saveArrayBuffer(buffer, filename) {
    save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}