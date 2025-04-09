import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';

// =====================================================================
// Global variables
// =====================================================================
let group, camera, controls, scene, renderer;
let boxObject;
let clip, clipAction, mixer, clock;
let userImageURL = './img/Logo_texture.png';

// =====================================================================
// UI/UX functionality
// =====================================================================
document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    setupThemeToggle();
    setupFileInput();
    setupEventListeners();
    init3D();
    animate();
});

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs and panels
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Add active class to clicked tab and corresponding panel
            button.classList.add('active');
            const panelId = button.getAttribute('data-tab');
            document.getElementById(panelId).classList.add('active');
        });
    });
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', 
            document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
}

function setupFileInput() {
    const fileInput = document.getElementById('texture');
    const fileNameDisplay = document.getElementById('file-name');
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            fileNameDisplay.textContent = fileName;
            userImageURL = URL.createObjectURL(fileInput.files[0]);
            createBox();
            showToast(`Image loaded: ${fileName}`);
        }
    });
}

function setupEventListeners() {
    // Settings panel controls
    document.getElementById('north').addEventListener('change', () => createBox());
    document.getElementById('south').addEventListener('change', () => createBox());
    document.getElementById('east').addEventListener('change', () => createBox());
    document.getElementById('west').addEventListener('change', () => createBox());
    document.getElementById('top').addEventListener('change', () => createBox());
    document.getElementById('bottom').addEventListener('change', () => createBox());
    document.getElementById('double').addEventListener('change', () => createBox());
    document.getElementById('transparent').addEventListener('change', () => createBox());
    
    // Color inputs
    document.getElementById('color').addEventListener('input', () => createBox());
    document.getElementById('screenColor').addEventListener('input', () => {
        renderer.setClearColor(document.getElementById('screenColor').value, 1);
    });
    
    // Animation controls
    document.getElementById('option_animationX').addEventListener('change', () => updateAnimation());
    document.getElementById('option_animationY').addEventListener('change', () => updateAnimation());
    document.getElementById('option_animationZ').addEventListener('change', () => updateAnimation());
    document.getElementById('option_animation_dir').addEventListener('change', () => updateAnimation());
    document.getElementById('animDuration').addEventListener('change', () => updateAnimation());
    
    // Screenshot and export buttons
    document.getElementById('shot').addEventListener('click', takeScreenshot);
    document.getElementById('export_objects').addEventListener('click', () => {
        exportGLTF(group);
    });
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
} 

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Remove toast after animation completes
    setTimeout(() => {
        toastContainer.removeChild(toast);
    }, 3500);
}

// =====================================================================
// 3D Scene Setup
// =====================================================================
function init3D() {
    clock = new THREE.Clock();
    
    scene = new THREE.Scene();
    scene.name = 'Scene';

    // Renderer
    const container = document.getElementById('canvas-container');
    
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    const screenColor = document.getElementById('screenColor').value;
    renderer.setClearColor(screenColor, 1);
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(200, 200, 200);
    camera.name = "PerspectiveCamera";
    scene.add(camera);

    // Controls
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
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.lookAt(0, 0, 0);
    dirLight.name = 'DirectionalLight';
    dirLight.position.set(1000, 1000, 1000);
    camera.add(dirLight);
    
    // Group to be exported
    group = new THREE.Group();
    scene.add(group);

    // Create initial box
    createBox();
    
    // Setup initial animation
    updateAnimation();
}

function createBox() {
    // Remove existing box
    group.remove(...group.children);
    
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const tex = new THREE.TextureLoader().load(userImageURL, (tex) => {
        boxObject.scale.set(1, tex.image.height / tex.image.width, 1);
    });
    
    let withMat;
    
    if (document.getElementById('double').checked) {
        withMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: tex });
    } else {
        withMat = new THREE.MeshStandardMaterial({ map: tex });
    }
    
    const color = document.getElementById('color').value;
    let withoutMat = new THREE.MeshStandardMaterial({ color: color });
    
    if (document.getElementById('transparent').checked) {
        withMat.transparent = true;
        withoutMat.transparent = true;
    }
    
    const materials = [
        document.getElementById('east').checked ? withMat : withoutMat,
        document.getElementById('west').checked ? withMat : withoutMat,
        document.getElementById('top').checked ? withMat : withoutMat,
        document.getElementById('bottom').checked ? withMat : withoutMat,
        document.getElementById('north').checked ? withMat : withoutMat,
        document.getElementById('south').checked ? withMat : withoutMat
    ];
    
    boxObject = new THREE.Mesh(geometry, materials);
    boxObject.name = 'box';
    
    group.add(boxObject);
}

function updateAnimation() {
    const rotX = document.getElementById('option_animationX').checked ? 1 : 0;
    const rotY = document.getElementById('option_animationY').checked ? 1 : 0;
    const rotZ = document.getElementById('option_animationZ').checked ? 1 : 0;
    const animDuration = document.getElementById('animDuration').value;
    const direction = document.getElementById('option_animation_dir').checked ? 1 : -1;
    
    const axis = new THREE.Vector3(rotX, rotY, rotZ);
    
    // Skip if no axis is selected
    if (axis.length() === 0) {
        if (mixer) mixer = null;
        return;
    }
    
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
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

function render() {
    renderer.render(scene, camera);
}

function takeScreenshot() {
    renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob) {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = 'XRSTORY_ScreenShot.png';
        a.click();
        showToast('Screenshot saved');
    }, 'image/png', 1.0);
}

// =====================================================================
// Export functionality
// =====================================================================
function exportGLTF(input) {
    updateAnimation();
    
    const gltfExporter = new GLTFExporter();
    const options = {
        trs: true,
        onlyVisible: true,
        truncateDrawRange: true,
        binary: document.getElementById('exportFormat').value == 1,
        animations: (
            document.getElementById('option_animationX').checked || 
            document.getElementById('option_animationY').checked || 
            document.getElementById('option_animationZ').checked
        ) ? [clip] : [],
        forceIndices: true
    };
    
    gltfExporter.parse(input, function(result) {
        let gltfFileName = document.getElementById('gltfFileName').value || "box";
        
        if (result instanceof ArrayBuffer) {
            saveArrayBuffer(result, gltfFileName + '.glb');
            showToast(`Saved as ${gltfFileName}.glb`);
        } else {
            const output = JSON.stringify(result, null, 2);
            saveString(output, gltfFileName + '.gltf');
            showToast(`Saved as ${gltfFileName}.gltf`);
        }
    }, options);
}

// Helper functions for saving files
const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {
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