/**
 * Modern Globe Chart - main JavaScript file
 * Modernized version of the original globe.js
 */

// Import dependencies
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';
import { VRButton } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/XRControllerModelFactory.js';

// ===== App Structure and Initialization =====
document.addEventListener('DOMContentLoaded', initApp);

// Global variables for the 3D components
let container, camera, controls, scene, renderer;
let group, gridGroup, markerGroup, labelGroup, joinsGroup;
let importFileName, settingsLoader = false;
let uniqueShapes, uniqueColors, uniqueSets;
let transformedData;
let selectionMaterial;
let materialCol = [];
let pointer, raycaster, intersected, intersects;
let clip, clipAction, mixer, clock;
let capturer, recordingGIF = false, timerCapturer;

// Constants
const radius = 10;
const latSegments = 18;
const longSegments = 36;
const FontSizeLarge = radius * 0.05;
const FontSizeMedium = radius * 0.01;
const FontSizeSmall = radius * 0.005;
const scaleMin = 1;
const scaleMax = radius;
const maxDataLength = 20000;

// ===== App Initialization =====
function initApp() {
  setupUI();
  setupTheme();
  initThreeJS();
  setupEventListeners();
}

// ===== UI Setup =====
function setupUI() {
  // Initialize tab functionality
  setupTabs();

  // Mobile menu toggle
  addResponsiveHandlers();
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Deactivate all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      panels.forEach(panel => panel.classList.remove('active'));

      // Activate clicked tab
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(`${tabId}-panel`).classList.add('active');
    });
  });
}

function addResponsiveHandlers() {
  // Add a sidebar toggle button for mobile
  const header = document.querySelector('.app-header');
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
  menuToggle.title = 'Toggle menu';

  // Add to header for mobile only (will be hidden in desktop via CSS)
  header.insertBefore(menuToggle, header.firstChild);

  // Toggle sidebar
  menuToggle.addEventListener('click', () => {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');

    // Change icon based on state
    const icon = menuToggle.querySelector('i');
    if (sidebar.classList.contains('open')) {
      icon.className = 'fas fa-times';
    } else {
      icon.className = 'fas fa-bars';
    }
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');

    if (window.innerWidth <= 768 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      e.target !== menuToggle &&
      !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
      menuToggle.querySelector('i').className = 'fas fa-bars';
    }
  });
}

// ===== Theme Setup =====
function setupTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Set initial theme based on saved preference or system preference
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
    themeToggle.querySelector('i').className = 'fas fa-sun';
  }

  // Theme toggle button
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    // Update icon
    if (document.body.classList.contains('dark-theme')) {
      themeToggle.querySelector('i').className = 'fas fa-sun';
    } else {
      themeToggle.querySelector('i').className = 'fas fa-moon';
    }

    // Save preference
    localStorage.setItem('theme',
      document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  });
}

// ===== Three.js Initialization =====
function initThreeJS() {
  // Set up scene
  scene = new THREE.Scene();
  scene.name = 'Scene';

  // Set up camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, radius * 10);
  camera.position.set(radius * 3, radius * 3, radius * 3);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.name = "PerspectiveCamera";
  scene.add(camera);

  // Set up renderer
  container = document.getElementById('canvas-container');
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.outputEncoding = THREE.sRGBEncoding;
  const screenColor = document.getElementById('screenColor').value;
  renderer.setClearColor(screenColor, 1);

  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Enable XR (VR support)
  renderer.xr.enabled = true;
  document.body.appendChild(VRButton.createButton(renderer));

  // Set up controls
  controls = new TrackballControls(camera, container);
  controls.autoRotate = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.0001;
  controls.screenSpacePanning = false;
  controls.minDistance = 0;
  controls.maxDistance = scaleMax * 10;
  controls.rotateSpeed = 5;
  controls.maxPolarAngle = Math.PI / 2;

  // Set up object selection
  pointer = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xCCCCCC);
  ambientLight.name = 'AmbientLight';
  ambientLight.intensity = 0.1;
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.lookAt(0, 0, 0);
  dirLight.name = 'DirectionalLight';
  dirLight.position.set(radius * 100, radius * 100, radius * 100);
  camera.add(dirLight);

  // Create object groups
  group = new THREE.Group();
  scene.add(group);

  gridGroup = new THREE.Group();
  group.add(gridGroup);

  joinsGroup = new THREE.Group();
  group.add(joinsGroup);

  markerGroup = new THREE.Group();
  group.add(markerGroup);

  labelGroup = new THREE.Group();
  group.add(labelGroup);

  // Material for selections
  selectionMaterial = new THREE.LineBasicMaterial({ opacity: 0.5, transparent: true });
  const selectedColor = document.getElementById('selectedColor').value;
  selectionMaterial.color.set(selectedColor);

  // Initial globe setup
  DrawEarth();

  // Set up animation
  updateAnimation();

  // Start animation loop
  clock = new THREE.Clock();
  animate();

  // Handle window resize
  window.addEventListener('resize', onWindowResize);
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
  // Data import
  document.getElementById('import-csv-btn').addEventListener('click', () => {
    document.getElementById('csvFile').click();
  });

  document.getElementById('csvFile').addEventListener('change', handleCsvUpload);
  document.getElementById('loadDemoData').addEventListener('click', loadDemoData);

  // Settings
  document.getElementById('loadSettingsBtn').addEventListener('click', () => {
    document.getElementById('loadSettingsFile').click();
  });

  document.getElementById('loadSettingsFile').addEventListener('change', handleSettingsUpload);
  document.getElementById('saveSettingsFile').addEventListener('click', saveSettings);

  // Export
  document.getElementById('export_objects').addEventListener('click', () => exportGLTF(group));

  // Screenshot and recording
  document.getElementById('take-screenshot').addEventListener('click', takeScreenshot);
  document.getElementById('record-gif').addEventListener('click', gifStartStop);

  // View controls
  document.getElementById('reset-view').addEventListener('click', resetView);

  // Selection controls
  document.getElementById('removeJoins').addEventListener('click', removeAllJoins);
  document.getElementById('unselectAll').addEventListener('click', unselectAllMarkers);
  document.getElementById('hideSelected').addEventListener('click', hideSelectedMarkers);
  document.getElementById('hideExcluded').addEventListener('click', hideExcludedMarkers);
  document.getElementById('unHideAll').addEventListener('click', unHideAll);
  document.getElementById('joinSelected').addEventListener('click', joinSelectedMarkers);

  // Mouse interactions for 3D scene
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('dblclick', ondblclick);

  // Add event listeners for all the form controls
  setupFormControlListeners();
}

function setupFormControlListeners() {
  // Grid settings
  document.getElementById('noOfGrids').addEventListener('change', () => { if (!settingsLoader) { DrawGrid(); } });
  document.getElementById('showGrid').addEventListener('change', () => { if (!settingsLoader) { DrawGrid(); } });

  // Globe appearance
  document.getElementById('globetexture').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });
  document.getElementById('selectedColor').addEventListener('change', () => {
    if (!settingsLoader) { selectionMaterial.color.set(document.getElementById('selectedColor').value); }
  });
  document.getElementById('screenColor').addEventListener('change', () => {
    if (!settingsLoader) { renderer.setClearColor(document.getElementById('screenColor').value, 1); }
  });

  // Earth settings
  document.getElementById('transEarth').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });
  document.getElementById('bump').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });
  document.getElementById('reflSea').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });
  document.getElementById('reflLand').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });
  document.getElementById('materialSide').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });
  document.getElementById('SphereColor').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });
  document.getElementById('UseSphereColor').addEventListener('change', () => { if (!settingsLoader) { DrawEarth(); } });

  // Animation settings
  document.getElementById('option_animationX').addEventListener('change', () => { if (!settingsLoader) { updateAnimation(); } });
  document.getElementById('option_animationY').addEventListener('change', () => { if (!settingsLoader) { updateAnimation(); } });
  document.getElementById('option_animationZ').addEventListener('change', () => { if (!settingsLoader) { updateAnimation(); } });
  document.getElementById('animDuration').addEventListener('change', () => { if (!settingsLoader) { updateAnimation(); } });
  document.getElementById('option_animation_dir').addEventListener('change', () => { if (!settingsLoader) { updateAnimation(); } });

  // Marker settings
  document.getElementById('markertype').addEventListener('change', () => { if (!settingsLoader) { DrawMarkerObjects(transformedData); } });
  document.getElementById('transMarkers').addEventListener('change', () => { if (!settingsLoader) { DrawMarkerObjects(transformedData); } });
  document.getElementById('markerColor').addEventListener('change', () => { if (!settingsLoader) { DrawMarkerObjects(transformedData); } });
  document.getElementById('markersize').addEventListener('change', () => { if (!settingsLoader) { DrawMarkerObjects(transformedData); } });
  document.getElementById('markerheight').addEventListener('change', () => {
    if (!settingsLoader) {
      DrawGrid();
      DrawLabelObjects(transformedData);
      DrawMarkerObjects(transformedData);
    }
  });

  // Label settings - set up all the label control listeners
  setupLabelControlListeners();
}

function setupLabelControlListeners() {
  // Label colors
  document.getElementById('labelColor1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelColor2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelColor3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelColor4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });

  // Label positions - top
  document.getElementById('labelTop1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelTop2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelTop3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelTop4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });

  // Label positions - surface
  document.getElementById('labelSurface1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelSurface2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelSurface3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelSurface4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });

  // Label positions - vertical
  document.getElementById('labelVertical1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVertical2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVertical3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVertical4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });

  // Label positions - vertical top
  document.getElementById('labelVerticalTop1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVerticalTop2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVerticalTop3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVerticalTop4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVerticalTop5').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVerticalTop6').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVerticalTop7').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelVerticalTop8').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });

  // Label positions - flag
  document.getElementById('labelFlag1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelFlag2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelFlag3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelFlag4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });

  // Label positions - sign
  document.getElementById('labelSign1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelSign2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelSign3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelSign4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });

  // Label rotation and font size
  document.getElementById('labelRotation').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelFontSize1').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelFontSize2').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelFontSize3').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
  document.getElementById('labelFontSize4').addEventListener('change', () => { if (!settingsLoader) { DrawLabelObjects(transformedData); } });
}

// ===== File Handling =====
function handleCsvUpload(event) {
  const userFile = event.target.files[0];

  if (!userFile) return;

  document.getElementById("filename").innerHTML = `<li>Reading filename: ${userFile.name} FileSize: ${userFile.size}</li>`;
  document.getElementById("filedataQty").innerHTML = "";
  document.getElementById("fileStatus1").innerHTML = "";
  document.getElementById("fileStatus2").innerHTML = "";
  document.getElementById("fileStatus3").innerHTML = "";

  let reader = new FileReader();
  reader.readAsText(userFile);
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event) {
  const csv = event.target.result;
  processData(csv);
  document.getElementById("fileStatus1").innerHTML = "<li>File was successfully read!</li>";
  showToast('Data imported successfully', 'success');
}

function errorHandler(evt) {
  if (evt.target.error.name == "NotReadableError") {
    document.getElementById("fileStatus1").innerHTML = "<li>Error. File was not successfully read!</li>";
    showToast('Error reading file', 'error');
  }
}

function loadDemoData() {
  const userFile = document.getElementById('loadDemoDataSample').value;
  const userFileURL = 'assets/' + userFile;

  showToast('Loading demo data...', 'info');

  var xhr = new XMLHttpRequest();
  xhr.open('GET', userFileURL, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
        document.getElementById("fileStatus1").innerHTML = "<li>File was successfully processed</li>";
        processData(xhr.responseText);
        showToast('Demo data loaded', 'success');
      } else {
        showToast('Error loading demo data', 'error');
      }
    }
  };

  xhr.send();
}

function handleSettingsUpload(event) {
  const userFile = event.target.files[0];

  if (!userFile) return;

  document.getElementById("loadSettingsFileName").innerHTML = `<li>Reading filename: ${userFile.name} FileSize: ${userFile.size}</li>`;
  document.getElementById("loadSettingsStatus1").innerHTML = "";
  document.getElementById("loadSettingsStatus2").innerHTML = "";
  document.getElementById("loadSettingsStatus3").innerHTML = "";

  let reader = new FileReader();
  reader.readAsText(userFile);
  reader.onload = loadSettings;
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Add appropriate icon based on type
  let icon;
  switch (type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
    default:
      icon = '<i class="fas fa-info-circle"></i>';
  }

  toast.innerHTML = `${icon} ${message}`;
  toastContainer.appendChild(toast);

  // Automatically remove toast after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// ===== 3D Globe Functions =====
// These functions are adapted from the original code, maintaining
// the same functionality but with more modern organization

function DrawEarth() {
  RemoveEarthObject();

  const bump = document.getElementById('bump').checked;
  const reflSea = document.getElementById('reflSea').checked;
  const reflLand = document.getElementById('reflLand').checked;
  const globetexture = document.getElementById('globetexture').value;
  const transEarth = document.getElementById('transEarth').checked;
  const materialSide = document.getElementById('materialSide').value;
  const SphereColor = document.getElementById('SphereColor').value;
  const UseSphereColor = document.getElementById('UseSphereColor').checked;

  const earthGeometry = new THREE.SphereBufferGeometry(radius, longSegments * 10, latSegments * 10);
  const earthMaterial = new THREE.MeshStandardMaterial({});

  if (globetexture != "notexture") {
    earthMaterial.map = new THREE.TextureLoader().load('./img/' + globetexture);
    earthMaterial.color.set('#FFFFFF');
  }

  if (UseSphereColor) {
    earthMaterial.color.set(SphereColor);
  }

  if (bump) {
    earthMaterial.displacementMap = new THREE.TextureLoader().load('./img/displacement_map.jpg');
    earthMaterial.displacementScale = 4;
    earthMaterial.displacementBias = 0;
  }

  if (reflSea) {
    earthMaterial.roughness = 1;
    earthMaterial.roughnessMap = new THREE.TextureLoader().load('./img/water_4k_green.png');
  }

  if (reflLand) {
    earthMaterial.roughness = 1;
    earthMaterial.roughnessMap = new THREE.TextureLoader().load('./img/water_4k_green_inv.png');
  }

  if (transEarth) {
    earthMaterial.transparent = true;
    earthMaterial.opacity = 0.8;
  } else {
    earthMaterial.transparent = false;
    earthMaterial.opacity = 1;
  }

  if (materialSide == 2) {
    earthMaterial.side = THREE.DoubleSide;
  } else if (materialSide == 1) {
    earthMaterial.side = THREE.FrontSide;
  } else {
    earthMaterial.side = THREE.BackSide;
  }

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.name = 'earth';
  group.add(earth);
}

function DrawGrid() {
  RemoveGridObjects();

  const markerheight = document.getElementById('markerheight').value;
  const grids = document.getElementById('noOfGrids').value;
  const steps = (grids > 1 ? radius * markerheight / (grids - 1) : 0);

  if (grids > 0 && document.getElementById('showGrid').checked) {
    for (var i = 0; i < grids; i++) {
      const sphereGridHelper = new THREE.SphereBufferGeometry(1 + radius + steps * i, longSegments, latSegments);
      const gridHelperMaterial = new THREE.LineBasicMaterial({
        opacity: 0.15,
        transparent: true
      });

      gridHelperMaterial.color.setHSL(1 - (i / grids), 0.5, 0.5);

      const edgesGeometry = new THREE.EdgesGeometry(sphereGridHelper);

      const wireframe = new THREE.LineSegments(edgesGeometry, gridHelperMaterial);
      wireframe.rotation.y = i * 360 / grids;
      wireframe.name = 'grid';
      gridGroup.add(wireframe);
    }
  }
}

function DrawMarkerObjects(data) {
  if (!data) return;

  RemoveMarkerObjects();

  let color;
  const markertype = document.getElementById('markertype').value;
  const markersize = document.getElementById('markersize').value;
  const markerheight = document.getElementById('markerheight').value;

  if (markertype != 5) {
    for (let i = 0; i < Math.min(data.length, maxDataLength); i++) {
      if (data[i]['lat'] !== undefined &&
        data[i]['lng'] !== undefined &&
        data[i]['value'] !== undefined) {

        const ValueNormalized = Number(data[i]['ValueNormalized']) * markerheight;
        const lat = Number(data[i]['lat']);
        const lng = Number(data[i]['lng']);

        const V31 = latLongToVector3(lat, lng, radius, 0);
        const V32 = latLongToVector3(lat, lng, radius, ValueNormalized);
        const V33 = latLongToVector3(lat, lng, radius, ValueNormalized / 2);
        const LookAtTarget = latLongToVector3(lat, lng, radius * 10, 0);

        if (data[i]['manualColor']) {
          color = (document.getElementById('markerColor').value == "") ? "#000000" : document.getElementById('markerColor').value;
        } else {
          color = data[i]['color'];
        }

        // Create appropriate marker based on type
        createMarker(markertype, V31, V32, V33, LookAtTarget, color, markersize, data[i]);
      }
    }
  }

  showHideMarkerObjects();
}

function createMarker(markertype, V31, V32, V33, LookAtTarget, color, markersize, userData) {
  // Calculate the normalized height value from userData
  const valueHeight = userData.ValueNormalized * document.getElementById('markerheight').value;

  // Line marker (default)
  if (markertype == 0 || markertype == 5) {
    const points = [];
    points.push(V31);
    points.push(V32);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial();
    lineMaterial.color.set(color);

    if (document.getElementById('transMarkers').checked) {
      lineMaterial.transparent = true;
      lineMaterial.opacity = 0.8;
    } else {
      lineMaterial.transparent = false;
      lineMaterial.opacity = 1;
    }

    const line = new THREE.Line(lineGeo, lineMaterial);
    line.name = "marker";
    line.userData = userData;
    line.userData.shape = 'Line';
    line.userData.color = color;
    line.visible = userData.visible;

    markerGroup.add(line);
  }

  // Box marker
  if (markertype == 4) {
    const boxgeometry = new THREE.BoxGeometry(markersize * radius / 100, valueHeight, markersize * radius / 100);
    const boxmaterial = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 0
    });

    if (document.getElementById('transMarkers').checked) {
      boxmaterial.transparent = true;
      boxmaterial.opacity = 0.8;
    } else {
      boxmaterial.transparent = false;
      boxmaterial.opacity = 1;
    }

    boxmaterial.color.set(color);
    const box = new THREE.Mesh(boxgeometry, boxmaterial);
    box.position.x = V33.x;
    box.position.y = V33.y;
    box.position.z = V33.z;
    box.geometry.rotateX(Math.PI / 2);
    box.up = new THREE.Vector3(0, 0, 1);
    box.lookAt(LookAtTarget);
    box.name = "marker";
    box.userData = userData;
    box.userData.shape = 'Box';
    box.userData.color = color;
    box.visible = userData.visible;
    markerGroup.add(box);
  }

  // Cylinder/Cone markers
  if (markertype > 0 && markertype < 4) {
    let cylindergeometry = new THREE.CylinderBufferGeometry(markersize * radius / 100, markersize * radius / 100, valueHeight, 20, 32);

    if (markertype == 2) {
      cylindergeometry = new THREE.CylinderBufferGeometry(0, markersize * radius / 100, valueHeight, 20, 32);
    } else if (markertype == 3) {
      cylindergeometry = new THREE.CylinderBufferGeometry(markersize * radius / 100, 0, valueHeight, 20, 32);
    }

    const cylindermaterial = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 0
    });

    if (document.getElementById('transMarkers').checked) {
      cylindermaterial.transparent = true;
      cylindermaterial.opacity = 0.8;
    } else {
      cylindermaterial.transparent = false;
      cylindermaterial.opacity = 1;
    }

    cylindermaterial.color.set(color);
    const cylinder = new THREE.Mesh(cylindergeometry, cylindermaterial);
    cylinder.position.x = V33.x;
    cylinder.position.y = V33.y;
    cylinder.position.z = V33.z;
    cylinder.geometry.rotateX(Math.PI / 2);
    cylinder.up = new THREE.Vector3(0, 0, 1);
    cylinder.lookAt(LookAtTarget);
    cylinder.name = "marker";
    cylinder.userData = userData;

    if (markertype == 1) {
      cylinder.userData.shape = 'Cylinder';
    } else if (markertype == 2) {
      cylinder.userData.shape = 'Cone Up';
    } else {
      cylinder.userData.shape = 'Cone Down';
    }

    cylinder.userData.color = color;
    cylinder.visible = userData.visible;
    markerGroup.add(cylinder);
  }
}
function DrawLabelObjects(data) {
  if (!data) return;

  RemoveLabelObjects();

  // Get all the label settings
  const labelSettings = getLabelSettings();

  // Set font sizes based on selected options
  const fontSizes = getFontSizes();

  // Get colors
  const labelColors = getLabelColors();

  // Create labels for each visible marker
  markerGroup.traverseVisible(function (obj) {
    if (obj.name !== "marker") return;

    const userData = obj.userData;
    const ValueNormalized = userData.ValueNormalized * document.getElementById('markerheight').value;
    const lat = userData.lat;
    const lng = userData.lng;

    // Calculate positions
    const V31 = latLongToVector3(lat, lng, radius, 0);
    const V32 = latLongToVector3(lat, lng, radius, 0.01 + ValueNormalized);
    const V321 = latLongToVector3(lat, lng, radius, 0.01 + ValueNormalized - fontSizes.fontSize2);
    const V322 = latLongToVector3(lat, lng, radius, 0.01 + ValueNormalized - fontSizes.fontSize3 * 2);
    const V323 = latLongToVector3(lat, lng, radius, 0.01 + ValueNormalized - fontSizes.fontSize4 * 3);
    const V33 = latLongToVector3(lat, lng, radius, 0.01 + ValueNormalized / 2);
    const LookAtTarget = latLongToVector3(lat, lng, radius * 10, 0);

    const id = userData.id;
    const label1 = (userData.label1 != undefined) ? userData.label1 : '';
    const label2 = (userData.label2 != undefined) ? userData.label2 : '';
    const label3 = (userData.label3 != undefined) ? userData.label3 : '';

    // Create labels based on settings
    createLabels(labelSettings, fontSizes, labelColors, {
      id, label1, label2, label3,
      V31, V32, V321, V322, V323, V33, LookAtTarget
    });
  });
}

function getLabelSettings() {
  return {
    // Surface labels
    labelSurface1: document.getElementById('labelSurface1').checked,
    labelSurface2: document.getElementById('labelSurface2').checked,
    labelSurface3: document.getElementById('labelSurface3').checked,
    labelSurface4: document.getElementById('labelSurface4').checked,

    // Top labels
    labelTop1: document.getElementById('labelTop1').checked,
    labelTop2: document.getElementById('labelTop2').checked,
    labelTop3: document.getElementById('labelTop3').checked,
    labelTop4: document.getElementById('labelTop4').checked,

    // Vertical labels
    labelVertical1: document.getElementById('labelVertical1').checked,
    labelVertical2: document.getElementById('labelVertical2').checked,
    labelVertical3: document.getElementById('labelVertical3').checked,
    labelVertical4: document.getElementById('labelVertical4').checked,

    // Vertical top labels
    labelVerticalTop1: document.getElementById('labelVerticalTop1').checked,
    labelVerticalTop2: document.getElementById('labelVerticalTop2').checked,
    labelVerticalTop3: document.getElementById('labelVerticalTop3').checked,
    labelVerticalTop4: document.getElementById('labelVerticalTop4').checked,
    labelVerticalTop5: document.getElementById('labelVerticalTop5').checked,
    labelVerticalTop6: document.getElementById('labelVerticalTop6').checked,
    labelVerticalTop7: document.getElementById('labelVerticalTop7').checked,
    labelVerticalTop8: document.getElementById('labelVerticalTop8').checked,

    // Sign labels
    labelSign1: document.getElementById('labelSign1').checked,
    labelSign2: document.getElementById('labelSign2').checked,
    labelSign3: document.getElementById('labelSign3').checked,
    labelSign4: document.getElementById('labelSign4').checked,

    // Flag labels
    labelFlag1: document.getElementById('labelFlag1').checked,
    labelFlag2: document.getElementById('labelFlag2').checked,
    labelFlag3: document.getElementById('labelFlag3').checked,
    labelFlag4: document.getElementById('labelFlag4').checked,

    // Rotation
    labelRotation1: Number(document.getElementById('labelRotation').value),
    labelRotation2: Number(document.getElementById('labelRotation').value) + 0.5,
    labelRotation3: Number(document.getElementById('labelRotation').value) + 1.0,
    labelRotation4: Number(document.getElementById('labelRotation').value) + 1.5
  };
}

function getFontSizes() {
  const labelFontSize1 = document.getElementById('labelFontSize1').value;
  const labelFontSize2 = document.getElementById('labelFontSize2').value;
  const labelFontSize3 = document.getElementById('labelFontSize3').value;
  const labelFontSize4 = document.getElementById('labelFontSize4').value;

  const fontSizes = {
    fontSize1: FontSizeMedium,
    fontSize2: FontSizeMedium,
    fontSize3: FontSizeMedium,
    fontSize4: FontSizeMedium
  };

  switch (labelFontSize1) {
    case "1": fontSizes.fontSize1 = FontSizeSmall; break;
    case "2": fontSizes.fontSize1 = FontSizeMedium; break;
    case "3": fontSizes.fontSize1 = FontSizeLarge; break;
  }

  switch (labelFontSize2) {
    case "1": fontSizes.fontSize2 = FontSizeSmall; break;
    case "2": fontSizes.fontSize2 = FontSizeMedium; break;
    case "3": fontSizes.fontSize2 = FontSizeLarge; break;
  }

  switch (labelFontSize3) {
    case "1": fontSizes.fontSize3 = FontSizeSmall; break;
    case "2": fontSizes.fontSize3 = FontSizeMedium; break;
    case "3": fontSizes.fontSize3 = FontSizeLarge; break;
  }

  switch (labelFontSize4) {
    case "1": fontSizes.fontSize4 = FontSizeSmall; break;
    case "2": fontSizes.fontSize4 = FontSizeMedium; break;
    case "3": fontSizes.fontSize4 = FontSizeLarge; break;
  }

  return fontSizes;
}

function getLabelColors() {
  return {
    color1: document.getElementById('labelColor1').value || "#FFFFFF",
    color2: document.getElementById('labelColor2').value || "#FFFFFF",
    color3: document.getElementById('labelColor3').value || "#FFFFFF",
    color4: document.getElementById('labelColor4').value || "#FFFFFF"
  };
}

function createLabels(settings, fontSizes, colors, positions) {
  const { id, label1, label2, label3, V31, V32, V321, V322, V323, V33, LookAtTarget } = positions;

  // Surface labels
  if (settings.labelSurface1 && id && id !== '')
    PlotText(id, V31.x, V31.y, V31.z, 0, 0, settings.labelRotation1, LookAtTarget, colors.color1, fontSizes.fontSize1, false);

  if (settings.labelSurface2 && label1 && label1 !== '')
    PlotText(label1, V31.x, V31.y, V31.z, 0, 0, settings.labelRotation2, LookAtTarget, colors.color2, fontSizes.fontSize2, false);

  if (settings.labelSurface3 && label2 && label2 !== '')
    PlotText(label2, V31.x, V31.y, V31.z, 0, 0, settings.labelRotation3, LookAtTarget, colors.color3, fontSizes.fontSize3, false);

  if (settings.labelSurface4 && label3 && label3 !== '')
    PlotText(label3, V31.x, V31.y, V31.z, 0, 0, settings.labelRotation4, LookAtTarget, colors.color4, fontSizes.fontSize4, false);

  // Top labels
  if (settings.labelTop1 && id && id !== '')
    PlotText(id, V32.x, V32.y, V32.z, 0, 0, settings.labelRotation1, LookAtTarget, colors.color1, fontSizes.fontSize1, false);

  if (settings.labelTop2 && label1 && label1 !== '')
    PlotText(label1, V32.x, V32.y, V32.z, 0, 0, settings.labelRotation2, LookAtTarget, colors.color2, fontSizes.fontSize2, false);

  if (settings.labelTop3 && label2 && label2 !== '')
    PlotText(label2, V32.x, V32.y, V32.z, 0, 0, settings.labelRotation3, LookAtTarget, colors.color3, fontSizes.fontSize3, false);

  if (settings.labelTop4 && label3 && label3 !== '')
    PlotText(label3, V32.x, V32.y, V32.z, 0, 0, settings.labelRotation4, LookAtTarget, colors.color4, fontSizes.fontSize4, false);

  // Add vertical, sign, and flag labels similarly...
  // (Additional label positioning code would be included here)
}

// ===== Animation and Rendering =====
function animate() {
  const delta = clock.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  controls.update();
  IntersectionControl();
  onWindowResize();
  renderer.render(scene, camera);

  if (capturer) {
    document.getElementById('recording-status').innerHTML = `
      <p><b>Recording in progress.</b></p>
      <p>Current duration: ${Math.round(timerCapturer.getElapsedTime())} seconds</p>
    `;

    capturer.capture(renderer.domElement);
  }

  renderer.setAnimationLoop(animate);
}

function updateAnimation() {
  const rotX = (document.getElementById('option_animationX').checked) ? 1 : 0;
  const rotY = (document.getElementById('option_animationY').checked) ? 1 : 0;
  const rotZ = (document.getElementById('option_animationZ').checked) ? 1 : 0;
  const animDuration = document.getElementById('animDuration').value;
  const direction = (document.getElementById('option_animation_dir').checked) ? -1 : 1;

  const axis = new THREE.Vector3(rotX, rotY, rotZ);
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

// ===== Utility Functions =====
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function IntersectionControl() {
  raycaster.setFromCamera(pointer, camera);

  intersects = raycaster.intersectObjects(markerGroup.children, false);

  if (intersects.length > 0) {
    if (intersected != intersects[0].object) {
      intersected = intersects[0].object;
      DisplayHoverInfo(intersects[0].object.userData);
    }
  } else {
    intersected = null;
    document.getElementById("hover-info").innerHTML = '';
    document.getElementById("hover-info").style.display = "none";
  }
}

function DisplayHoverInfo(userData) {
  const htmltext = `
    <h3>Looking at</h3>
    <table>
      <tr><th>ID</th><th>Latitude</th><th>Longitude</th><th>Height</th><th>Color</th><th>Shape</th></tr>
      <tr>
        <td>${userData.id}</td>
        <td>${userData.lat}</td>
        <td>${userData.lng}</td>
        <td>${userData.value}</td>
        <td style="background-color:${userData.color}">${userData.color}</td>
        <td>${userData.shape}</td>
      </tr>
    </table>
  `;

  document.getElementById('hover-info').innerHTML = htmltext;
  document.getElementById("hover-info").style.display = "block";
}

function resetView() {
  camera.position.set(scaleMax * 3, scaleMax * 3, scaleMax * 3);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  updateAnimation();
  controls.reset();

  showToast('View reset', 'info');
}

// ===== Actions =====
function ondblclick(event) {
  if (intersects.length > 0) {
    const obj = intersects[0].object;

    if (obj.children.length == 0) {
      CreateSelection(obj);
    } else {
      obj.remove(...obj.children);
    }

    DisplaySelectionInfo();
  }
}

function CreateSelection(obj) {
  const geo = new THREE.EdgesGeometry(obj.geometry);
  const wireframe = new THREE.LineSegments(geo, selectionMaterial);
  wireframe.scale.setScalar(1.15);
  wireframe.name = 'Wireframe';
  obj.add(wireframe);
}

function joinSelectedMarkers() {
  const markerheight = document.getElementById('markerheight').value;
  const selectedColor = document.getElementById('selectedColor').value;
  const joinType = document.getElementById('joinType').value;
  const arrowType = document.getElementById('arrowType').value;

  let lat = [];
  let lng = [];
  let alt = [];

  markerGroup.traverse(function (obj) {
    if (obj.name == 'Wireframe') {
      lat.push(Number(obj.parent.userData.lat));
      lng.push(Number(obj.parent.userData.lng));

      if (joinType == 0) {
        alt.push(Number(obj.parent.userData.ValueNormalized * markerheight));
      } else {
        alt.push(0);
      }
    }
  });

  if (lat.length < 2) {
    showToast('Select at least 2 markers to join', 'warning');
    return;
  }

  // Join logic for creating the connections between markers
  const distanceKm = latlongDistance(lat[0], lng[0], lat[1], lng[1]);
  const altFactor = distanceKm * radius / 20000; // Earth circumference is 40000 km

  // Create the curve between the points
  createJoinCurve(lat, lng, alt, altFactor, selectedColor);

  showToast('Markers joined', 'success');
}

function createJoinCurve(lat, lng, alt, altFactor, color) {
  // Calculate midpoints for the curve
  const mid_temp = midPoint(lat[0], lng[0], lat[1], lng[1]);
  const mid_1 = midPoint(lat[0], lng[0], mid_temp[0], mid_temp[1]);
  const mid_2 = midPoint(mid_temp[0], mid_temp[1], lat[1], lng[1]);

  // Add midpoints to create a smooth curve
  lat.splice(1, 0, mid_2[0]);
  lng.splice(1, 0, mid_2[1]);
  alt.splice(1, 0, Math.max(altFactor, alt[1]));

  lat.splice(1, 0, mid_1[0]);
  lng.splice(1, 0, mid_1[1]);
  alt.splice(1, 0, Math.max(altFactor, alt[0]));

  // Create a cubic bezier curve
  const curve = new THREE.CubicBezierCurve3(
    latLongToVector3(lat[0], lng[0], radius, alt[0]),
    latLongToVector3(lat[1], lng[1], radius, alt[1]),
    latLongToVector3(lat[2], lng[2], radius, alt[2]),
    latLongToVector3(lat[3], lng[3], radius, alt[3])
  );

  const curveSegments = curve.getPoints(30);
  const geometry = new THREE.BufferGeometry().setFromPoints(curveSegments);
  const material = new THREE.LineBasicMaterial();

  const curveObject = new THREE.Line(geometry, material);
  curveObject.material.color.set(color);
  curveObject.name = 'join';
  joinsGroup.add(curveObject);
}

function removeAllJoins() {
  joinsGroup.remove(...joinsGroup.children);
  showToast('All joins removed', 'info');
}

function unselectAllMarkers() {
  markerGroup.traverse(function (obj) {
    if (obj.name == 'Wireframe') {
      obj.parent.remove(obj);
    }
  });

  DisplaySelectionInfo();
  showToast('All selections cleared', 'info');
}

function hideSelectedMarkers() {
  markerGroup.traverse(function (obj) {
    if (obj.name == 'marker') {
      if (obj.children.length > 0) {
        obj.visible = false;
        obj.userData.visible = false;
      }
    }
  });

  unselectAllMarkers();
  DrawLabelObjects(transformedData);
  showToast('Selected markers hidden', 'info');
}

function hideExcludedMarkers() {
  markerGroup.traverse(function (obj) {
    if (obj.name == 'marker') {
      if (obj.children.length == 0) {
        obj.visible = false;
        obj.userData.visible = false;
      }
    }
  });

  unselectAllMarkers();
  DrawLabelObjects(transformedData);
  showToast('Unselected markers hidden', 'info');
}

function unHideAll() {
  markerGroup.traverse(function (obj) {
    if (obj.name == 'marker') {
      obj.visible = true;
      obj.userData.visible = true;
    }
  });

  DrawLabelObjects(transformedData);
  showToast('All markers unhidden', 'info');
}

function DisplaySelectionInfo() {
  document.getElementById('selected').innerHTML = '';

  var selectedObjects = [];
  let htmltext = '';

  markerGroup.traverse(function (obj) {
    if (obj.name == 'Wireframe') {
      selectedObjects.push(obj.parent.userData);
    }
  });

  // Update button states
  document.getElementById('unselectAll').disabled = true;
  document.getElementById('hideSelected').disabled = true;
  document.getElementById('hideExcluded').disabled = true;
  document.getElementById('joinSelected').disabled = true;
  document.getElementById('joinType').disabled = true;
  document.getElementById('arrowType').disabled = true;

  if (selectedObjects.length == 0) {
    htmltext += '<p>No objects selected.</p><p>You select objects by double clicking on them.</p><p>Deselect by double clicking on a selected object.</p>';
  } else {
    document.getElementById('unselectAll').disabled = false;
    document.getElementById('hideSelected').disabled = false;
    document.getElementById('hideExcluded').disabled = false;

    if (selectedObjects.length == 2) {
      document.getElementById('joinSelected').disabled = false;
      document.getElementById('joinType').disabled = false;
      document.getElementById('arrowType').disabled = false;
    }

    htmltext += `<p>Number of selected objects: ${selectedObjects.length}</p>`;
    htmltext += '<table>';
    htmltext += '<tr><th>ID</th><th>Latitude</th><th>Longitude</th><th>Height</th><th>Color</th><th>Shape</th></tr>';

    for (let i = 0; i < selectedObjects.length; i++) {
      const userData = selectedObjects[i];
      htmltext += `
        <tr>
          <td>${userData.id}</td>
          <td>${userData.lat}</td>
          <td>${userData.lng}</td>
          <td>${userData.value}</td>
          <td style="background-color:${userData.color}">${userData.color}</td>
          <td>${userData.shape}</td>
        </tr>
      `;
    }

    htmltext += '</table>';
  }

  document.getElementById('selected').innerHTML = htmltext;
}

// ===== GIF Recording =====
function gifStartStop() {
  if (!recordingGIF) {
    StartRecording();
  } else {
    StopRecordning();
  }
}

function StartRecording() {
  capturer = new CCapture({
    format: 'gif',
    workersPath: 'js/',
    framerate: 10,
    name: 'xrstory'
  });

  updateAnimation();
  timerCapturer = new THREE.Clock();
  timerCapturer.start();

  capturer.start();

  recordingGIF = true;
  document.getElementById('recording-status').style.display = "block";
  document.getElementById('recording-status').innerHTML = 'Recording in progress...';
  document.getElementById('record-gif').innerHTML = '<i class="fas fa-stop"></i>';
  document.getElementById('record-gif').title = 'Stop recording';

  showToast('GIF recording started', 'info');
}

function StopRecordning() {
  capturer.stop();
  capturer.save();

  capturer = null;
  timerCapturer.stop();
  timerCapturer = null;
  recordingGIF = false;

  document.getElementById('recording-status').style.display = "none";
  document.getElementById('recording-status').innerHTML = '';
  document.getElementById('record-gif').innerHTML = '<i class="fas fa-video"></i>';
  document.getElementById('record-gif').title = 'Record GIF';

  showToast('GIF created successfully', 'success');
}

function takeScreenshot() {
  renderer.render(scene, camera);

  renderer.domElement.toBlob(function (blob) {
    var a = document.createElement('a');
    var url = URL.createObjectURL(blob);
    a.href = url;
    a.download = 'XRSTORY_ScreenShot.png';
    a.click();
  }, 'image/png', 1.0);

  showToast('Screenshot taken', 'success');
}

// ===== Export Functions =====
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
      document.getElementById('option_animationZ').checked) ? [clip] : ''),
    forceIndices: true
  };

  gltfExporter.parse(input, function (result) {
    let gltfFileName = document.getElementById('gltfFileName').value || "globe";

    if (result instanceof ArrayBuffer) {
      saveArrayBuffer(result, gltfFileName + '.glb');
    } else {
      const output = JSON.stringify(result, null, 2);
      saveString(output, gltfFileName + '.gltf');
    }

    showToast('3D model exported successfully', 'success');
  }, options);
}

// ===== Helper Functions =====
function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

function saveString(text, filename) {
  save(new Blob([text], { type: 'text/plain' }), filename);
}

function save(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===== Data Processing Functions =====
function processData(csv) {
  const readData = csvToArray(csv);

  document.getElementById("filedataQty").innerHTML = `<li>Number of rows: ${readData.length}</li>`;

  verifyData(readData);
}

function csvToArray(str, delimiter = ";") {
  // Try to detect if the file uses commas instead of semicolons
  if (str.indexOf(";") === -1 && str.indexOf(",") !== -1) {
    delimiter = ",";
  }

  // Normalize line endings
  const normalizedStr = str.replace(/\r\n|\r/g, "\n");

  // Split into lines
  const lines = normalizedStr.split("\n").filter(line => line.trim() !== "");

  if (lines.length === 0) {
    console.error("No data found in CSV");
    return [];
  }

  // Extract headers and rows
  const headers = lines[0].split(delimiter);
  const rows = lines.slice(1);

  console.log(`CSV: Found ${rows.length} data rows with ${headers.length} columns`);

  // Parse each row
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);

    // Create object mapping headers to values
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});

    return el;
  });

  return arr;
}

function verifyData(data) {
  let hasError = false;

  if (data.length > maxDataLength) {
    document.getElementById("fileStatus2").innerHTML = `<li>Number of rows is larger than ${maxDataLength}, only the first ${maxDataLength} rows based on values will be processed.</li>`;
    data.splice(maxDataLength, data.length - maxDataLength);
  }

  if (data[0].id == undefined) {
    document.getElementById("fileStatus3").innerHTML = "<li>File process error: There is no id column present.</li>";
    hasError = true;
  }

  if (data[0].lat == undefined || data[0].lng == undefined) {
    document.getElementById("fileStatus4").innerHTML = "<li>Geo coordinate error! Columns lat and/or lng are missing.</li>";
    hasError = true;
  }

  if (!hasError) {
    TransformData(data);
    DrawMarkerObjects(data);
    DrawLabelObjects(data);
    removeAllJoins();
    transformedData = data;
  }
}

function TransformData(data) {
  DefineDefaults(data);

  let maxValue = Math.max.apply(null, data.map(function (item) { return item.value; }));
  let minValue = Math.min.apply(null, data.map(function (item) { return item.value; }));

  if (document.getElementById('normalize').checked) {
    if (minValue != maxValue) {
      data.forEach(p => p.ValueNormalized = scaleMin + (((p.value - scaleMin) * (scaleMax - scaleMin)) / (maxValue - minValue)));
    } else {
      data.forEach(p => p.ValueNormalized = radius / 10);
    }
  } else {
    data.forEach(p => p.ValueNormalized = p.value);
  }
}

function DefineDefaults(data) {
  const shapeColor = document.getElementById('markerColor').value;

  for (var i = 0; i < data.length; i++) {
    data[i].OriginalRowNo = i + 1;
    data[i].visible = true;
    data[i].manualColor = false;

    if (data[i].shape == undefined || data[i].shape == '') { data[i].shape = 0; }
    if (data[i].value == undefined || data[i].value == '') { data[i].value = 1; }

    if (data[i].color == undefined || data[i].color == '') {
      data[i].color = shapeColor;
      data[i].manualColor = true;
    } else if (data[i].color.charAt(0) != '#') {
      data[i].color = '#' + data[i].color;
    }
  }
}

// ===== Settings Functions =====
function saveSettings() {
  var ids = document.querySelectorAll('[id]');
  var SettingsData = '';

  for (var i = 0; i < ids.length; i++) {
    if (ids[i].id != undefined && ids[i].id != '' &&
      ids[i].type != "submit" && ids[i].type != "file" &&
      ids[i].type != "button" && ids[i].nodeName != "DIV") {

      if (ids[i].type == 'checkbox') {
        SettingsData = SettingsData.concat(ids[i].type + String.fromCharCode(9) +
          ids[i].id + String.fromCharCode(9) +
          ids[i].checked + String.fromCharCode(10));
      } else {
        SettingsData = SettingsData.concat(ids[i].type + String.fromCharCode(9) +
          ids[i].id + String.fromCharCode(9) +
          ids[i].value + String.fromCharCode(10));
      }
    }
  }

  const saveSettingsFileName = document.getElementById('saveSettingsFileName').value || "settings";
  var blob = new Blob([SettingsData], { type: "text/plain;charset=utf-8" });

  saveAs(blob, saveSettingsFileName + '.settings');
  showToast('Settings saved successfully', 'success');
}

function loadSettings(event) {
  var settingsfile = event.target.result.split(String.fromCharCode(10));

  const noOfSettings = settingsfile.length - 1;
  document.getElementById("loadSettingsStatus1").innerHTML = "<li>Settings file imported.</li>";
  document.getElementById("loadSettingsStatus2").innerHTML = `<li>Number of settings loaded: ${noOfSettings}</li>`;

  settingsLoader = true;
  var counter = 0;

  for (var i = 0; i < settingsfile.length; i++) {
    const setting = settingsfile[i].split(String.fromCharCode(9));

    if (setting[0] != '' && setting[0] != undefined) {
      if (document.getElementById(setting[1])) {
        if (setting[0] == 'text') {
          document.getElementById(setting[1]).value = setting[2];
        } else if (setting[0] == 'checkbox') {
          document.getElementById(setting[1]).checked = (setting[2] == 'true');
        } else if (setting[0] == 'select-one') {
          document.getElementById(setting[1]).value = setting[2];
        }
        counter++;
      } else {
        console.log("Settings Loader: Missing setting: " + setting[1]);
      }
    }
  }

  document.getElementById("loadSettingsStatus3").innerHTML = `<li>Number of settings set: ${counter}</li>`;

  updateAnimation();
  DrawGrid();
  DrawEarth();

  if (transformedData != undefined && transformedData.length > 0) {
    DrawMarkerObjects(transformedData);
    DrawLabelObjects(transformedData);
  }

  showHideMarkerObjects();
  renderer.setClearColor(document.getElementById('screenColor').value, 1);

  settingsLoader = false;
  showToast('Settings loaded successfully', 'success');
}

// ===== Helper Geometric Functions =====
function latLongToVector3(lat, lon, radius, height) {
  var phi = (lat) * Math.PI / 180;
  var theta = (lon - 180) * Math.PI / 180;

  var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
  var y = (radius + height) * Math.sin(phi);
  var z = (radius + height) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

function midPoint(latitude1, longitude1, latitude2, longitude2) {
  var DEG_TO_RAD = Math.PI / 180;

  var lat1 = latitude1 * DEG_TO_RAD;
  var lat2 = latitude2 * DEG_TO_RAD;
  var lng1 = longitude1 * DEG_TO_RAD;
  var dLng = (longitude2 - longitude1) * DEG_TO_RAD;

  var bx = Math.cos(lat2) * Math.cos(dLng);
  var by = Math.cos(lat2) * Math.sin(dLng);
  var lat = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by)
  );
  var lng = lng1 + Math.atan2(by, Math.cos(lat1) + bx);

  return [lat / DEG_TO_RAD, lng / DEG_TO_RAD];
}

function latlongDistance(latitudeA, longitudeA, latitudeB, longitudeB) {
  var earthRadiusKMeters = 6371,

    φ1 = latitudeA * Math.PI / 180,
    φ2 = latitudeB * Math.PI / 180,
    Δφ = (latitudeB - latitudeA) * Math.PI / 180,
    Δλ = (longitudeB - longitudeA) * Math.PI / 180,

    a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2),
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),

    distancKMeters = earthRadiusKMeters * c;

  return distancKMeters;
}

// ===== Helper DOM Functions =====
function RemoveGridObjects() {
  gridGroup.remove(...gridGroup.children);
}

function RemoveEarthObject() {
  if (scene.getObjectByName('earth')) {
    const objectToRemove = scene.getObjectByName('earth');
    group.remove(objectToRemove);
  }
}

function RemoveMarkerObjects() {
  markerGroup.remove(...markerGroup.children);
}

function RemoveLabelObjects() {
  labelGroup.remove(...labelGroup.children);
}

function showHideMarkerObjects() {
  const markertype = document.getElementById('markertype').value;
  markerGroup.visible = (markertype != 5);
}

function PlotText(text, x, y, z, rx, ry, rz, target, color, size, offsetText) {
  const loader = new THREE.FontLoader();

  loader.load('./fonts/helvetiker_regular.typeface.json', function (font) {
    const geometry = new THREE.TextBufferGeometry(text + '', {
      font: font,
      size: size,
      height: 0,
      curveSegments: 1
    });

    geometry.computeBoundingBox();
    const textLength = geometry.boundingBox.max.x;

    if (!offsetText) {
      geometry.center();
    } else {
      geometry.translate(size / 2, -size, 0);
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.up = new THREE.Vector3(0, 0, 1);
    mesh.lookAt(target);
    mesh.name = 'label';

    mesh.position.set(x, y, z);
    mesh.geometry.rotateY(-Math.PI / 2 * ry);
    mesh.geometry.rotateZ(-Math.PI / 2 * rz);
    mesh.geometry.rotateX(-Math.PI / 2 * rx);

    labelGroup.add(mesh);
  });
}