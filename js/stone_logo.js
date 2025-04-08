import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';
import { ConvexGeometry } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/geometries/ConvexGeometry.js';

class StoneLogoApp {
  constructor() {
    // App configuration
    this.config = {
      radius: 100,
      userImageURL: './img/Logo_texture.png',
      selectedShape: '0',
      offset: 0,
      repeat: 1
    };

    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.group = null;
    this.clock = null;
    this.mixer = null;
    this.clip = null;

    // Geometry data
    this.vertices1 = null;
    this.vertices2 = null;

    // Download link for exports
    this.downloadLink = document.createElement('a');
    this.downloadLink.style.display = 'none';
    document.body.appendChild(this.downloadLink);

    // Initialize the application
    this.initTheme();
    this.initUI();
    this.init3D();
    this.animate();
  }

  initTheme() {
    // Check for saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark-theme');
    }

    // Set up theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem(
        'theme',
        document.body.classList.contains('dark-theme') ? 'dark' : 'light'
      );
    });
  }

  initUI() {
    // Tab navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });

    // Shape selection
    const shapeOptions = document.querySelectorAll('.shape-option');
    shapeOptions.forEach(option => {
      option.addEventListener('click', () => {
        shapeOptions.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        this.config.selectedShape = option.dataset.value;
        this.vertices1 = this.createVertices();
        this.createStone();
      });
    });

    // File upload
    document.getElementById('texture').addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        this.config.userImageURL = URL.createObjectURL(file);
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('usematerial').checked = true;
        this.createStone();
        this.showToast('Logo uploaded successfully', 'success');
      }
    });

    // Control events
    document.getElementById('regenerate').addEventListener('click', () => {
      this.vertices1 = this.createVertices();
      this.vertices2 = this.createVertices();
      this.createStone();
      this.showToast('New stone generated', 'info');
    });

    document.getElementById('usematerial').addEventListener('change', () => this.createStone());
    document.getElementById('usecolor').addEventListener('change', () => this.createStone());
    document.getElementById('double').addEventListener('change', () => this.createStone());
    document.getElementById('color').addEventListener('change', () => this.createStone());

    // Background color
    document.getElementById('screenColor').addEventListener('change', (event) => {
      this.renderer.setClearColor(event.target.value, 1);
    });

    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        document.getElementById('screenColor').value = preset.dataset.color;
        this.renderer.setClearColor(preset.dataset.color, 1);
      });
    });

    // Animation controls
    document.getElementById('option_animationX').addEventListener('change', () => this.updateAnimation());
    document.getElementById('option_animationY').addEventListener('change', () => this.updateAnimation());
    document.getElementById('option_animationZ').addEventListener('change', () => this.updateAnimation());
    document.getElementById('option_animation_dir').addEventListener('change', () => this.updateAnimation());
    document.getElementById('animDuration').addEventListener('change', () => this.updateAnimation());

    // Export functions
    document.getElementById('export_objects').addEventListener('click', () => {
      this.exportGLTF(this.group);
    });

    document.getElementById('shot').addEventListener('click', () => this.takeScreenshot());
  }

  init3D() {
    // Setup clock
    this.clock = new THREE.Clock();

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.name = 'Scene';

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setClearColor(document.getElementById('screenColor').value, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const container = document.getElementById('canvas-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    this.renderer.setSize(containerWidth, containerHeight);
    document.getElementById('canvas-container').appendChild(this.renderer.domElement);


    document.getElementById('canvas-container').appendChild(this.renderer.domElement);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      containerWidth / containerHeight,
      1,
      this.config.radius * 10
    );
    this.camera.position.set(
      this.config.radius * 3,
      this.config.radius * 3,
      this.config.radius * 3
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);

    // Setup controls
    this.controls = new TrackballControls(this.camera, this.renderer.domElement);
    this.controls.autoRotate = true;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.0001;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 0;
    this.controls.maxDistance = this.config.radius * 10;
    this.controls.rotateSpeed = 5;
    this.controls.maxPolarAngle = Math.PI / 2;

    // Add lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.lookAt(0, 0, 0);
    dirLight.position.set(
      this.config.radius * 10,
      this.config.radius * 10,
      this.config.radius * 10
    );
    this.camera.add(dirLight);

    // Create object group
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Generate initial vertices and create stone
    this.vertices1 = this.createVertices();
    this.createStone();

    // Initialize animation
    this.updateAnimation();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  createVertices() {
    const vertices = [];
    const shape = this.config.selectedShape;
    let radiusX, radiusY, radiusZ, roughnessFactor;

    this.config.offset = 0;

    if (shape === '0') { // ROUND
      roughnessFactor = 1;
      this.config.repeat = 1;
      radiusX = this.config.radius;
      radiusY = this.config.radius;
      radiusZ = this.config.radius;
    } else if (shape === '5') { // NORMAL
      roughnessFactor = 50;
      this.config.repeat = THREE.MathUtils.randInt(1, 3);
      radiusX = THREE.MathUtils.randInt(this.config.radius, this.config.radius * 2) / 2;
      radiusY = THREE.MathUtils.randInt(this.config.radius, this.config.radius * 2) / 2;
      radiusZ = THREE.MathUtils.randInt(this.config.radius, this.config.radius * 2) / 2;
    } else if (shape === '9') { // BIZARRE
      roughnessFactor = 100;
      this.config.repeat = THREE.MathUtils.randInt(1, 5);
      radiusX = THREE.MathUtils.randInt(this.config.radius, this.config.radius * 4) / 4;
      radiusY = THREE.MathUtils.randInt(this.config.radius, this.config.radius * 4) / 4;
      radiusZ = THREE.MathUtils.randInt(this.config.radius, this.config.radius * 4) / 4;
    }

    for (let point = 0; point <= 5000; point += 1) {
      radiusX += THREE.MathUtils.randInt(-this.config.radius, this.config.radius) * roughnessFactor / 5000;
      radiusY += THREE.MathUtils.randInt(-this.config.radius, this.config.radius) * roughnessFactor / 5000;
      radiusZ += THREE.MathUtils.randInt(-this.config.radius, this.config.radius) * roughnessFactor / 5000;

      let x = THREE.MathUtils.randInt(-100, 100) / 1000;
      let y = THREE.MathUtils.randInt(-100, 100) / 1000;
      let z = THREE.MathUtils.randInt(-100, 100) / 1000;

      const factor = 1 / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));

      x = (x * factor * radiusX + perlin.get(x, point) * roughnessFactor / 100);
      y = (y * factor * radiusY + perlin.get(y, point) * roughnessFactor / 100);
      z = (z * factor * radiusZ + perlin.get(z, point) * roughnessFactor / 100);

      vertices.push(new THREE.Vector3(x, y, z));
    }

    return vertices;
  }

  createUVs(geometry) {
    const pos = geometry.attributes.position;
    const spherical = new THREE.Spherical();
    const v3 = new THREE.Vector3();
    const uvs = [];

    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      spherical.setFromVector3(v3);

      const theta = spherical.theta > 0.0 ? spherical.theta : Math.PI * 2 + spherical.theta;

      uvs.push(
        ((theta + Math.PI) % (Math.PI * 2)) / (Math.PI * 2),
        ((-spherical.phi + Math.PI) % (Math.PI)) / (Math.PI)
      );
    }

    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
  }

  removeStone() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
  }

  createStone() {
    this.removeStone();

    // Create geometry
    const geometry = new ConvexGeometry(this.vertices1);
    this.createUVs(geometry);

    // Apply rotations based on shape
    const shape = this.config.selectedShape;
    if (shape === '5') {
      geometry.rotateX(Math.PI * THREE.MathUtils.randInt(-15, 15) / 180);
      geometry.rotateY(Math.PI * THREE.MathUtils.randInt(-15, 15) / 180);
      geometry.rotateZ(Math.PI * THREE.MathUtils.randInt(-15, 15) / 180);
    } else if (shape === '9') {
      geometry.rotateX(Math.PI * THREE.MathUtils.randInt(-90, 90) / 180);
      geometry.rotateY(Math.PI * THREE.MathUtils.randInt(-90, 90) / 180);
      geometry.rotateZ(Math.PI * THREE.MathUtils.randInt(-90, 90) / 180);
    }

    // Create stone material
    const stoneTexture = new THREE.TextureLoader().load('./img/stone.jpg');
    const materialStone = new THREE.MeshStandardMaterial();
    materialStone.map = stoneTexture;
    materialStone.roughness = 1;
    materialStone.metalness = 0.125;

    if (document.getElementById('usecolor').checked) {
      materialStone.color.set(document.getElementById('color').value);
    }

    materialStone.opacity = 0.8;
    materialStone.transparent = false;

    // Create stone mesh
    const stoneObject = new THREE.Mesh(geometry, materialStone);
    stoneObject.name = 'Stone';
    this.group.add(stoneObject);

    // Create logo material
    const logoTexture = new THREE.TextureLoader().load(this.config.userImageURL);
    const materialLogo = new THREE.MeshStandardMaterial();

    if (document.getElementById('usematerial').checked) {
      logoTexture.offset.set(this.config.offset, this.config.offset);
      logoTexture.repeat.set(this.config.repeat, this.config.repeat);
      materialLogo.map = logoTexture;
      materialLogo.opacity = 0.7;
      materialLogo.transparent = true;
    }

    if (document.getElementById('double').checked) {
      materialLogo.side = THREE.DoubleSide;
    }

    // Create logo mesh
    const logoObject = new THREE.Mesh(geometry, materialLogo);
    logoObject.name = 'Logo';
    this.group.add(logoObject);
  }

  updateAnimation() {
    const rotX = document.getElementById('option_animationX').checked ? 1 : 0;
    const rotY = document.getElementById('option_animationY').checked ? 1 : 0;
    const rotZ = document.getElementById('option_animationZ').checked ? 1 : 0;
    const animDuration = parseFloat(document.getElementById('animDuration').value);
    const direction = document.getElementById('option_animation_dir').checked ? 1 : -1;

    if (rotX === 0 && rotY === 0 && rotZ === 0) return;

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

    this.clip = new THREE.AnimationClip('Action', animDuration, [quaternionKF]);
    this.mixer = new THREE.AnimationMixer(this.group);
    this.mixer.clipAction(this.clip).play();
  }

  exportGLTF(input) {
    this.updateAnimation();

    this.showToast('Preparing export...', 'info');

    const gltfExporter = new GLTFExporter();
    const options = {
      trs: true,
      onlyVisible: true,
      truncateDrawRange: true,
      binary: document.getElementById('exportFormat').value === '1',
      animations: [this.clip],
      forceIndices: true
    };

    gltfExporter.parse(input, result => {
      const fileName = document.getElementById('gltfFileName').value || 'stone';

      if (result instanceof ArrayBuffer) {
        this.saveData(result, fileName + '.glb', 'application/octet-stream');
      } else {
        const output = JSON.stringify(result, null, 2);
        this.saveData(output, fileName + '.gltf', 'text/plain');
      }

      this.showToast('3D model exported successfully', 'success');
    }, options);
  }

  saveData(data, fileName, type) {
    const blob = type === 'text/plain'
      ? new Blob([data], { type })
      : new Blob([data], { type });

    this.downloadLink.href = URL.createObjectURL(blob);
    this.downloadLink.download = fileName;
    this.downloadLink.click();
  }

  takeScreenshot() {
    this.renderer.render(this.scene, this.camera);
    this.renderer.domElement.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'StoneLogoScreenshot.png';
      a.click();

      this.showToast('Screenshot saved', 'success');
    }, 'image/png', 1.0);
  }

  onWindowResize() {
    // Get dimensions from the container instead of window
    const container = document.getElementById('canvas-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    this.camera.aspect = containerWidth / containerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(containerWidth, containerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');

    toast.className = `toast ${type} show`;
    toast.querySelector('.toast-message').textContent = message;

    setTimeout(() => {
      toast.className = 'toast';
    }, 3000);
  }
}

// Initialize the application when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  new StoneLogoApp();
});