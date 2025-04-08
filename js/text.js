import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';

let group, container, camera, controls, scene, renderer, textObject;
let clip, clipAction, mixer, clock;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Set up tab navigation
  setupTabs();
  
  // Set up theme toggle
  setupThemeToggle();
  
  // Set up modern UI controls
  setupModernControls();

  // Initialize 3D scene
  init();
  animate();
  
  // Set up event listeners
  addEventListeners();
});

// Tab navigation
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Deactivate all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));
      
      // Activate clicked tab
      button.classList.add('active');
      const panelId = button.id.replace('tab-', 'panel-');
      document.getElementById(panelId).classList.add('active');
    });
  });
}

// Theme toggle
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check saved theme preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
  }
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    // Save preference
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update 3D scene background
    if (renderer) {
      const bgColor = isDark ? '#121212' : '#f8f9fa';
      document.getElementById('screenColor').value = bgColor;
      renderer.setClearColor(bgColor, 1);
    }
  });
}

// Modern UI controls
function setupModernControls() {
  // Style options
  const styleOptions = document.querySelectorAll('.style-option');
  styleOptions.forEach(option => {
    option.addEventListener('click', () => {
      styleOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      // Update hidden select
      document.getElementById('curveSegments').value = option.dataset.value;
      CreateText();
    });
  });
  
  // Thickness toggle
  const bevelToggle = document.getElementById('bevel-toggle');
  bevelToggle.addEventListener('change', () => {
    document.getElementById('bevel').value = bevelToggle.checked ? '1' : '0';
    CreateText();
  });
  
  // Range slider for depth
  const heightRange = document.getElementById('height-range');
  heightRange.addEventListener('input', () => {
    // Update select based on slider value
    const heightSelect = document.getElementById('height');
    
    if (heightRange.value <= 2) {
      heightSelect.value = '0';
    } else if (heightRange.value <= 10) {
      heightSelect.value = '5';
    } else {
      heightSelect.value = '20';
    }
    
    CreateText();
  });
  
  // Color presets
  const colorPresets = document.querySelectorAll('.color-preset');
  colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      const targetInput = preset.parentElement.previousElementSibling;
      if (targetInput.jscolor) {
        targetInput.jscolor.fromString(preset.dataset.color);
        
        if (targetInput.id === 'objTextColor') {
          CreateText();
        } else if (targetInput.id === 'screenColor') {
          renderer.setClearColor(preset.dataset.color, 1);
        }
      }
    });
  });
  
  // Radio buttons for export format
  document.getElementById('exportFormatGLB').addEventListener('change', () => {
    document.getElementById('exportFormat').value = '1';
  });
  
  document.getElementById('exportFormatGLTF').addEventListener('change', () => {
    document.getElementById('exportFormat').value = '2';
  });
}

// Add event listeners
function addEventListeners() {
  document.getElementById('font').addEventListener('change', CreateText);
  document.getElementById('height').addEventListener('change', CreateText);
  document.getElementById('curveSegments').addEventListener('change', CreateText);
  document.getElementById('bevel').addEventListener('change', CreateText);
  document.getElementById('objTextColor').addEventListener('change', CreateText);
  document.getElementById('objText').addEventListener('input', CreateText);
  document.getElementById('screenColor').addEventListener('change', () => {
    renderer.setClearColor(document.getElementById('screenColor').value, 1);
  });
  
  // Animation controls
  document.getElementById('option_animationX').addEventListener('change', updateAnimation);
  document.getElementById('option_animationY').addEventListener('change', updateAnimation);
  document.getElementById('option_animationZ').addEventListener('change', updateAnimation);
  document.getElementById('option_animation_dir').addEventListener('change', updateAnimation);
  document.getElementById('animDuration').addEventListener('change', updateAnimation);
  
  // Export button
  document.getElementById('export_objects').addEventListener('click', function () {
    exportGLTF(group);
    showToast('3D model exported successfully!');
  });
}

// Show toast notification
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Initialize 3D scene
function init() {
  clock = new THREE.Clock();
  
  // Scene setup
  scene = new THREE.Scene();
  scene.name = 'Scene';
  
  // Camera setup
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(0, 0, 1000);
  camera.name = "PerspectiveCamera";
  scene.add(camera);
  
  // Renderer setup
  container = document.getElementById('canvas-container');
  
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  const screenColor = document.getElementById('screenColor').value;
  renderer.setClearColor(screenColor, 1);
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Controls setup
  controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 2;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x999999);
  ambientLight.name = 'AmbientLight';
  ambientLight.intensity = 0.4;
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(1, 1, 1).normalize();
  scene.add(dirLight);
  
  // Create group for exporting
  group = new THREE.Group();
  scene.add(group);
  
  // Create initial text
  CreateText();
  
  // Setup animation
  updateAnimation();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

// Remove existing text object
function RemoveText() {
  if (scene.getObjectByName('text')) {
    const objectToRemove = scene.getObjectByName('text');
    objectToRemove.geometry.dispose();
    objectToRemove.geometry = undefined;
    objectToRemove.material.dispose();
    objectToRemove.material = undefined;
    group.remove(objectToRemove);
  }
}

// Create text based on current settings
function CreateText() {
  RemoveText();
  
  const objText = document.getElementById('objText').value || "write a text in Settings";
  const objTextColor = document.getElementById('objTextColor').value || "#888888";
  const font = document.getElementById('font').value || "helvetiker_regular.typeface";
  const height = document.getElementById('height').value || 0;
  const curveSegments = document.getElementById('curveSegments').value || 3;
  const bevel = document.getElementById('bevel').value || 0;
  const bevelEnabled = bevel !== "0";
  
  const loader = new THREE.FontLoader();
  
  loader.load('./fonts/' + font + '.json', function(font) {
    const geometry = new THREE.TextBufferGeometry(objText, {
      font: font,
      size: 100,
      height: parseInt(height),
      curveSegments: parseInt(curveSegments),
      bevelEnabled: bevelEnabled,
      bevelThickness: 0,
      bevelSize: 10,
      bevelSegments: 10
    });
    
    geometry.center();
    
    const material = new THREE.MeshStandardMaterial({
      color: objTextColor,
      metalness: 0.3,
      roughness: 0.6
    });
    
    textObject = new THREE.Mesh(geometry, material);
    textObject.name = 'text';
    
    group.add(textObject);
  });
}

// Update animation
function updateAnimation() {
  const rotX = document.getElementById('option_animationX').checked ? 1 : 0;
  const rotY = document.getElementById('option_animationY').checked ? 1 : 0;
  const rotZ = document.getElementById('option_animationZ').checked ? 1 : 0;
  const animDuration = parseInt(document.getElementById('animDuration').value);
  const direction = document.getElementById('option_animation_dir').checked ? 1 : -1;
  
  const axis = new THREE.Vector3(rotX, rotY, rotZ);
  
  // Skip if no rotation is selected
  if (axis.length() === 0) {
    if (mixer) {
      mixer.stopAllAction();
    }
    return;
  }
  
  axis.normalize();
  
  const qInitial = new THREE.Quaternion().setFromAxisAngle(axis, -Math.PI * direction);
  const qMiddle = new THREE.Quaternion().setFromAxisAngle(axis, 0);
  const qFinal = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI * direction);
  
  const quaternionKF = new THREE.QuaternionKeyframeTrack(
    '.quaternion', 
    [0, animDuration / 2, animDuration],
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

// Handle window resize
function onWindowResize() {
  if (container && camera && renderer) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
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

// Export model
function exportGLTF(input) {
  updateAnimation();
  
  const gltfExporter = new GLTFExporter();
  const options = {
    trs: true,
    onlyVisible: true,
    truncateDrawRange: true,
    binary: document.getElementById('exportFormat').value === "1",
    animations: (
      document.getElementById('option_animationX').checked || 
      document.getElementById('option_animationY').checked || 
      document.getElementById('option_animationZ').checked
    ) ? [clip] : [],
    forceIndices: true
  };
  
  gltfExporter.parse(
    input,
    function(result) {
      let gltfFileName = document.getElementById('gltfFileName').value || "text";
      
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, gltfFileName + '.glb');
      } else {
        const output = JSON.stringify(result, null, 2);
        saveString(output, gltfFileName + '.gltf');
      }
    },
    options
  );
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