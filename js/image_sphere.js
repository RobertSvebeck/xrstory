import * as THREE                   from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls }        from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter }             from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';

let group,container, camera, controls, scene, renderer,Containerwidth,ContainerHeight;

//animation
let clip,clipAction,mixer,clock;

let userImageURL='./img/Logo_texture.png';

document.getElementById("texture").addEventListener('change', (event) => {
    var userImage = texture.files[0];     
    userImageURL = URL.createObjectURL( userImage );
    usematerial.checked=true;
    CreateSphere();
});

document.getElementById('double').addEventListener('change', (event) => {CreateSphere();});
document.getElementById('color').addEventListener('change', (event) => {CreateSphere();});
document.getElementById('transparent').addEventListener('change', (event) => {CreateSphere();});
document.getElementById('usematerial').addEventListener('change', (event) => {CreateSphere();});
document.getElementById('usecolor').addEventListener('change', (event) => {CreateSphere();});

document.getElementById('option_animationX').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('option_animationY').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('option_animationZ').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('animDuration').addEventListener('change', (event) => {updateAnimation();});
document.getElementById('option_animation_dir').addEventListener('change', (event) => {updateAnimation();});

document.getElementById('screenColor').addEventListener('change', (event) => { renderer.setClearColor( document.getElementById('screenColor').value, 1 ); } );
const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594


document.getElementById( 'export_objects' ).addEventListener( 'click', function () {
	exportGLTF( group );
} );


init();
animate();


function init() {
    
    clock = new THREE.Clock();
    
	scene = new THREE.Scene();
	scene.name = 'Scene';

    // ---------------------------------------------------------------------
	// Renderer
    // ---------------------------------------------------------------------

    container = document.createElement( 'div' );
    container.className = "container";
    document.body.appendChild( container );

	renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	renderer.outputEncoding = THREE.sRGBEncoding;
	const screenColor = document.getElementById('screenColor').value;
	renderer.setClearColor( screenColor, 1 );
    
    renderer.setSize( window.innerWidth, window.innerHeight  );
	container.appendChild( renderer.domElement );
    
	// ---------------------------------------------------------------------
	// Perspective Camera
	// ---------------------------------------------------------------------
	
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500);
	camera.position.set( 1, 2, 3 );
	camera.name = "PerspectiveCamera";
	scene.add( camera );

	// ---------------------------------------------------------------------
	// Mouse Controls
	// ---------------------------------------------------------------------
	
	controls = new TrackballControls( camera, container );
	controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.autoRotate = true;
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.00001;
	controls.screenSpacePanning = false;
	controls.minDistance = 0;
	controls.maxDistance = 5000;
    controls.rotateSpeed = 5;
	controls.maxPolarAngle = Math.PI / 2;
	
	// ---------------------------------------------------------------------
	// Ambient light
	// ---------------------------------------------------------------------
	
	const ambientLight = new THREE.AmbientLight(  0xCCCCCC );
	ambientLight.name = 'AmbientLight';
	ambientLight.intensity = 0.1;
//	scene.add( ambientLight );

	// ---------------------------------------------------------------------
	// DirectLight
	// ---------------------------------------------------------------------
	const dirLight = new THREE.DirectionalLight( 0xffffff, 0.9,   );
	dirLight.lookAt( 0, 0, 0 );
	dirLight.name = 'DirectionalLight';
	dirLight.position.set(0,0,1000);
	camera.add( dirLight );
	
	// ---------------------------------------------------------------------
	// Group to be exported
	// ---------------------------------------------------------------------
	
	group = new THREE.Group();
	scene.add( group );

	// ---------------------------------------------------------------------
	// Sphere
	// ---------------------------------------------------------------------
    CreateSphere();
    
	// ---------------------------------------------------------------------
	// Animation
	// ---------------------------------------------------------------------    
    updateAnimation();
    
    window.addEventListener( 'resize', onWindowResize() );

}

function RemoveSphere() {
    group.remove(...group.children);
}  

function CreateSphere() {
    RemoveSphere();
    
    const geometry = new THREE.SphereBufferGeometry( 1, 60, 60 );
    const material = new THREE.MeshStandardMaterial( );

    const color = document.getElementById('color').value;
    if (document.getElementById('usecolor').checked) {
        material.color.set(color);
    }
    
    if (document.getElementById('usematerial').checked) {
        material.map = new THREE.TextureLoader().load(userImageURL);
    }
    
    if (document.getElementById('double').checked) {
        material.side=THREE.DoubleSide;
    }
    
    if (document.getElementById('transparent').checked) {
        material.opacity = 1;
        material.transparent= true;
    }

    const sphereObject = new THREE.Mesh(geometry, material);
    sphereObject.name = 'sphere';
    group.add( sphereObject );	
    scene.add( group );
}

function takeScreenshot() {
    renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
    	var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'XRSTORY_ScreenShot.png';
      a.click();
    }, 'image/png', 1.0);

}

function onWindowResize() {

	camera.aspect = (window.innerWidth / window.innerHeight);
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
   const delta = clock.getDelta();
    if ( mixer ) {
        mixer.update( delta );
    }
    
	requestAnimationFrame( animate );
    controls.update();
    onWindowResize();
	renderer.render( scene, camera );
}

function updateAnimation () {
    // ---------------------------------------------------------------------
	// Animation (Rotation)
	// ---------------------------------------------------------------------
	
    const rotX = (document.getElementById( 'option_animationX' ).checked) ? 1 : 0;
    const rotY = (document.getElementById( 'option_animationY' ).checked) ? 1 : 0;
    const rotZ = (document.getElementById( 'option_animationZ' ).checked) ? 1 : 0;
    const animDuration = document.getElementById( 'animDuration' ).value;
    const direction = (document.getElementById( 'option_animation_dir' ).checked) ? 1 : -1;
	const axis = new THREE.Vector3( rotX,rotY,rotZ );
    axis.normalize();
	const qInitial = new THREE.Quaternion().setFromAxisAngle( axis, -Math.PI*direction );
	const qMiddle= new THREE.Quaternion().setFromAxisAngle( axis, 0 );
	const qFinal = new THREE.Quaternion().setFromAxisAngle( axis, Math.PI*direction);
	const quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, animDuration/2, animDuration ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qMiddle.x, qMiddle.y, qMiddle.z, qMiddle.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w ] );
	clip = new THREE.AnimationClip( 'Action', animDuration, [ quaternionKF ] );
    mixer = new THREE.AnimationMixer( group );
    clipAction = mixer.clipAction( clip );
    clipAction.play();

}


function render() {
	renderer.render( scene, camera );
}


function exportGLTF( input ) {
    
    updateAnimation();
	
	
	const gltfExporter = new GLTFExporter();
	const options = {
		trs: true, //document.getElementById( 'option_trs' ).checked,
		onlyVisible: true, //document.getElementById( 'option_visible' ).checked,
		truncateDrawRange: true, //document.getElementById( 'option_drawrange' ).checked,
		binary: (document.getElementById( 'exportFormat' ).value==1) ? (true) : false,
		animations: ((document.getElementById( 'option_animationX' ).checked || document.getElementById( 'option_animationY' ).checked || document.getElementById( 'option_animationZ' ).checked) ? ([clip]) : ([])),
		forceIndices:true
		//maxTextureSize: Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value
	};
	

	gltfExporter.parse( input, function ( result ) {
	    let gltfFileName = (document.getElementById('gltfFileName').value=="") ? "sphere" : document.getElementById('gltfFileName').value;
		if ( result instanceof ArrayBuffer ) {
			saveArrayBuffer( result, gltfFileName + '.glb' );
		} else {
			const output = JSON.stringify( result, null, 2 );
			saveString( output, gltfFileName + '.gltf' );
		}
	}, options );
}




function save( blob, filename ) {
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
}

function saveString( text, filename ) {
	save( new Blob( [ text ], { type: 'text/plain' } ), filename );
}

function saveArrayBuffer( buffer, filename ) {
	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
}


function exportSceneToJSON(input){

    scene.updateMatrixWorld();
    var result=scene.toJSON();
    var output =JSON.stringify(result);
    download(output, 'scene.json', 'application/json');
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function importScene(inp){

  if (inp.files && inp.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var loader = new THREE.ObjectLoader();
     loader.load(e.target.result,
        function ( json ) {
          console.log(json);
          scene = json;
        }
      );
    }
    reader.readAsDataURL(inp.files[0]);
  }
 }