import * as THREE from 'three';
import { TrackballControls }        from 'three/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter }             from 'three/examples/jsm/exporters/GLTFExporter.js';

let container, camera, controls, scene, renderer,group;

//animation
let clip,clipAction,mixer,clock;

const screenColor = document.getElementById('screenColor');

screenColor.addEventListener('change', (event) => {renderer.setClearColor( screenColor.value, 1 );});

// add Screenshot listener
document.getElementById("shot").addEventListener('click', takeScreenshot);

init();
animate();

function init() {
    clock = new THREE.Clock();
    
	scene = new THREE.Scene();
	scene.name = 'Scene';

	// ---------------------------------------------------------------------
	// Perspective Camera
	// ---------------------------------------------------------------------
	camera = new THREE.PerspectiveCamera( 45, 2, 1, 100);
	camera.position.set( 50,70, -30 );
	
	camera.name = "PerspectiveCamera";
	scene.add( camera );

    // ---------------------------------------------------------------------
	// Renderer
    // ---------------------------------------------------------------------
    container = document.createElement( 'div' );
    container.className = "container";
    document.body.appendChild( container );

	renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.setClearColor( 0xAAAAAA, 1 );
    
    renderer.setSize( window.innerWidth, window.innerHeight  );
	container.appendChild( renderer.domElement );
    
	// ---------------------------------------------------------------------
	// Mouse Controls
	// ---------------------------------------------------------------------
	controls = new TrackballControls( camera, container );
    controls.autoRotate = false;
	controls.enableDamping = true; 
	controls.dampingFactor = 0.0001;
	controls.screenSpacePanning = false;
	controls.minDistance = 0;
	controls.maxDistance = 100;
    controls.rotateSpeed = 5;
	controls.maxPolarAngle = 0;//Math.PI /2;

	// ---------------------------------------------------------------------
	// Ambient light
	// ---------------------------------------------------------------------
	const ambientLight = new THREE.AmbientLight(  0xCCCCCC );
	ambientLight.name = 'AmbientLight';
	ambientLight.intensity = 0.1;
	scene.add( ambientLight );

	// ---------------------------------------------------------------------
	// DirectLight
	// ---------------------------------------------------------------------
	const dirLight = new THREE.DirectionalLight( 0xffffff, 0.9,   );
	dirLight.lookAt( 0, 0, 0 );
	dirLight.name = 'DirectionalLight';
	dirLight.position.set(100,100,100);
	camera.add( dirLight );
	
	// ---------------------------------------------------------------------
	// Group to be exported
	// ---------------------------------------------------------------------
	group = new THREE.Group();
	scene.add( group );

	// ---------------------------------------------------------------------
	// Create Flag
	// ---------------------------------------------------------------------
    DrawFlag();
    window.addEventListener( 'resize', onWindowResize() );

}

function animate() {
   const delta = clock.getDelta();
    if ( mixer ) {
        mixer.update( delta );
    }
    renderer.setAnimationLoop( animate );
    controls.update();
    onWindowResize();
	renderer.render( scene, camera );
}

function render() {

	renderer.render( scene, camera );
}

function onWindowResize() {

	camera.aspect = ( window.innerWidth / window.innerHeight );
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function takeScreenshot() {
    console.log('Take Screenshot');
    renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
    	var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'XRSTORY_ScreenShot.png';
      a.click();
    }, 'image/png', 1.0);

}



function updateAnimation () {
    const rotX = (document.getElementById( 'option_animationX' ).checked) ? 1 : 0;
    const rotY = (document.getElementById( 'option_animationY' ).checked) ? 1 : 0;
    const rotZ = (document.getElementById( 'option_animationZ' ).checked) ? 1 : 0;
    const animDuration = document.getElementById( 'animDuration' ).value;
    
	const axis = new THREE.Vector3( rotX,rotY,rotZ );
	
    axis.normalize();
    
	const qInitial = new THREE.Quaternion().setFromAxisAngle( axis, -Math.PI );
	const qMiddle= new THREE.Quaternion().setFromAxisAngle( axis, 0 );
	const qFinal = new THREE.Quaternion().setFromAxisAngle( axis, Math.PI);
	const quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', [ 0, animDuration/2, animDuration ], [ qInitial.x, qInitial.y, qInitial.z, qInitial.w, qMiddle.x, qMiddle.y, qMiddle.z, qMiddle.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w ] );
	clip = new THREE.AnimationClip( 'Action', animDuration, [ quaternionKF ] );
    mixer = new THREE.AnimationMixer( group );
    clipAction = mixer.clipAction( clip );
    clipAction.play();

}

function RemoveFlag() {
    group.remove(...group.children);
}
function DrawFlag() {
    RemoveFlag();
    const FlagPoleGeometry = new THREE.CylinderGeometry( 0.1, 0.2, 10, 24 );
    const FlagPoleMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const FlagPole = new THREE.Mesh( FlagPoleGeometry, FlagPoleMaterial );
    FlagPole.position.y=5;
    group.add( FlagPole );
    
    const FlagGeometry = new THREE.PlaneBufferGeometry ( 3,2,12,12 );
    const FlagMaterial = new THREE.MeshPhongMaterial( {
					color: 0xFFFFFF,
					flatShading: true,
					vertexColors: true,
					shininess: 0,
					opacity: 0.2,
                    transparent: true,
                    side:THREE.DoubleSide
				} );          

    const Flag = new THREE.Mesh( FlagGeometry, FlagMaterial );  
    
    Flag.position.y=9;
	Flag.position.x=1.5;
	
    group.add( Flag );
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
	    let gltfFileName = (document.getElementById('gltfFileName').value=="") ? "3dobject" : document.getElementById('gltfFileName').value;
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

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}