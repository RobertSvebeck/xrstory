import * as THREE                   from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls }        from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter }             from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';

//VR CODE: Add VR Button and XR controllers
import { VRButton }                 from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/XRControllerModelFactory.js';

let container, camera, controls, scene, renderer;
let group,gridGroup,markerGroup,labelGroup,joinsGroup;
let importFileName,settingsLoader=false;

let uniqueShapes,uniqueColors,uniqueSets;
let transformedData;

let selectionMaterial;
let materialCol = [];

let pointer,raycaster,intersected,intersects;

//animation
let clip,clipAction,mixer,clock;

let capturer, recordingGIF = false, timerCapturer;

const radius = 10;
const latSegments = 18; 
const longSegments = 36;

var FontSizeLarge = radius*0.05;
var FontSizeMedium = radius*0.01;
var FontSizeSmall = radius*0.005;

var scaleMin = 1;
var scaleMax = radius;

const maxDataLength = 20000;

document.getElementById("noOfGrids").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); } } );
document.getElementById("showGrid").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); } } );
document.getElementById("globetexture").addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById('selectedColor').addEventListener('change', (event) => { if(!settingsLoader) { selectionMaterial.color.set( document.getElementById('selectedColor').value ); } } );
document.getElementById('screenColor').addEventListener('change', (event) => { if(!settingsLoader) { renderer.setClearColor( document.getElementById('screenColor').value, 1 ); } } );
document.getElementById('option_animationX').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('option_animationY').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('option_animationZ').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('animDuration').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('option_animation_dir').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById("transEarth").addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById("bump").addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById("reflSea").addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById("reflLand").addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById('materialSide').addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById('SphereColor').addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById('UseSphereColor').addEventListener('change', (event) => { if(!settingsLoader) { DrawEarth(); } } );
document.getElementById('markertype').addEventListener('change', (event) => { if(!settingsLoader) { DrawMarkerObjects(transformedData); } } );
document.getElementById('transMarkers').addEventListener('change', (event) => { if(!settingsLoader) { DrawMarkerObjects(transformedData); } } );
document.getElementById('markerColor').addEventListener('change', (event) => { if(!settingsLoader) { DrawMarkerObjects(transformedData); } } );
document.getElementById('markersize').addEventListener('change', (event) => { if(!settingsLoader) { DrawMarkerObjects(transformedData); } } );
document.getElementById('labelColor1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelColor2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelColor3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelColor4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById('labelTop1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelTop2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelTop3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelTop4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById('labelSurface1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelSurface2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelSurface3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelSurface4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById('labelVertical1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVertical2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVertical3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVertical4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById('labelVerticalTop1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVerticalTop2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVerticalTop3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVerticalTop4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVerticalTop5').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVerticalTop6').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVerticalTop7').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelVerticalTop8').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById('labelFlag1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelFlag2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelFlag3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelFlag4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById('labelSign1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelSign2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelSign3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelSign4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById('labelRotation').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelFontSize1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelFontSize2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelFontSize3').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );
document.getElementById('labelFontSize4').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(transformedData); } } );

document.getElementById( 'export_objects' ).addEventListener( 'click', function () { exportGLTF( group ); } );
document.getElementById("shot").addEventListener('click', takeScreenshot);
document.getElementById('resetView').addEventListener('click', resetView );
document.getElementById("removeJoins").addEventListener('click', removeAllJoins );
document.getElementById('unselectAll').addEventListener('click', unselectAllMarkers );
document.getElementById('hideSelected').addEventListener('click', hideSelectedMarkers );
document.getElementById('hideExcluded').addEventListener('click', hideExcludedMarkers );
document.getElementById('unHideAll').addEventListener('click', unHideAll );
document.getElementById('joinSelected').addEventListener('click', joinSelectedMarkers );
document.getElementById('gifStartStop').addEventListener('click', gifStartStop );
document.getElementById("saveSettingsFile").addEventListener('click', saveSettings);
document.getElementById("loadSettingsFile").addEventListener('change', (event) => { 
    
    const userFile = loadSettingsFile.files[0];   
    const userFileURL = URL.createObjectURL( userFile );
    
    document.getElementById("loadSettingsFileName").innerHTML = "<li>Reading filename: " + userFile.name + " FileSize: " + userFile.size + "</li>"; 
    document.getElementById("loadSettingsStatus1").innerHTML = "";
    document.getElementById("loadSettingsStatus2").innerHTML = "";
    document.getElementById("loadSettingsStatus3").innerHTML = "";
    
    let reader = new FileReader();
    reader.readAsText(userFile);
    reader.onload = loadSettings;
                                              
});
document.getElementById('markerheight').addEventListener('change', (event) => { 
    if(!settingsLoader) { 
        DrawGrid();
        DrawLabelObjects(transformedData)
        DrawMarkerObjects(transformedData);
    } 
}) ;
document.getElementById( 'loadDemoData' ).addEventListener( 'click', function () {

    const userFile = document.getElementById('loadDemoDataSample').value;
    
    const userFileURL = 'https://xrstory.io/objects/assets/' + userFile;
    
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', userFileURL, true );
    xhr.onreadystatechange = function() {
    
        if( xhr.readyState == 4 ) {
    
            if( xhr.status >= 200 && xhr.status<300 || xhr.status == 304  ) {
                document.getElementById("fileStatus1").innerHTML = "<li>File was sucessfully processed</li>"; 
            	processData(xhr.responseText);

            }
    
        }
    
    }
    
    xhr.send();                                                 
});

document.getElementById("csvFile").addEventListener('change', (event) => {  
    
    var userFile = csvFile.files[0];   
    
    const userFileURL = URL.createObjectURL( userFile );
 
    document.getElementById("filename").innerHTML = "<li>Reading filename: " + userFile.name + " FileSize: " + userFile.size + "</li>"; 
	document.getElementById("filedataQty").innerHTML = "";
	document.getElementById("fileStatus1").innerHTML = "";
	document.getElementById("fileStatus2").innerHTML = "";
	document.getElementById("fileStatus3").innerHTML = "";
	document.getElementById("fileStatus4").innerHTML = "";
	document.getElementById("fileStatus5").innerHTML = ""; 
    
    let reader = new FileReader();
    reader.readAsText(userFile);
    reader.onload = loadHandler;
    reader.onerror = errorHandler;
} );


const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594


init();
animate();

function init() {
    
    clock = new THREE.Clock();
    
	scene = new THREE.Scene();
	scene.name = 'Scene';
	
	// ---------------------------------------------------------------------
	// Perspective Camera
	// ---------------------------------------------------------------------
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, radius*10);
	camera.position.set( radius*3,radius*3, radius*3 );
	camera.lookAt(new THREE.Vector3(0,0,0));
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
	const screenColor = document.getElementById('screenColor').value;
	renderer.setClearColor( screenColor, 1 );
    
    renderer.setSize( window.innerWidth, window.innerHeight  );
	container.appendChild( renderer.domElement );

    //VR CODE: Enable XR rendering
    renderer.xr.enabled = true;
    //VR CODE: Add VR Button
    document.body.appendChild( VRButton.createButton( renderer ) );
    VRButton.className = "vr-button";
    
    
	// ---------------------------------------------------------------------
	// Mouse Controls
	// ---------------------------------------------------------------------
	
	controls = new TrackballControls( camera, container );
    controls.autoRotate = true;
	controls.enableDamping = true; 
	controls.dampingFactor = 0.0001;
	controls.screenSpacePanning = false;
	controls.minDistance = 0;
	controls.maxDistance = scaleMax*10;
    controls.rotateSpeed = 5;
	controls.maxPolarAngle = Math.PI /2;

	// ---------------------------------------------------------------------
	// mouse select
	// ---------------------------------------------------------------------

	pointer = new THREE.Vector2();
	raycaster = new THREE.Raycaster();
    document.addEventListener( 'pointermove', onPointerMove );
	document.addEventListener('dblclick', ondblclick, false);
	
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
	dirLight.position.set(radius*100,radius*100,radius*100);
	camera.add( dirLight );
	
	
	// ---------------------------------------------------------------------
	// Group to be exported
	// ---------------------------------------------------------------------
	
	group = new THREE.Group();
	scene.add( group );

    gridGroup = new THREE.Group();
    group.add(gridGroup);

    joinsGroup = new THREE.Group();
    group.add(joinsGroup);
    
    markerGroup = new THREE.Group();
    group.add(markerGroup);
    
    labelGroup = new THREE.Group();
    group.add(labelGroup);

	// ---------------------------------------------------------------------
    // Material for selections
	// ---------------------------------------------------------------------
    selectionMaterial = new THREE.LineBasicMaterial( { opacity:0.5,transparent:true} );
    const selectedColor = document.getElementById('selectedColor').value;
    selectionMaterial.color.set( selectedColor );
    
	// ---------------------------------------------------------------------
	// Create Globe
	// ---------------------------------------------------------------------



    //DrawGrid();
    DrawEarth();
    
	// ---------------------------------------------------------------------
	// Animation
	// ---------------------------------------------------------------------    
    updateAnimation();
    
    window.addEventListener( 'resize', onWindowResize() );

}
function midPoint (latitude1, longitude1, latitude2, longitude2) {
  var DEG_TO_RAD = Math.PI / 180;     // To convert degrees to radians.

  // Convert latitude and longitudes to radians:
  var lat1 = latitude1 * DEG_TO_RAD;
  var lat2 = latitude2 * DEG_TO_RAD;
  var lng1 = longitude1 * DEG_TO_RAD;
  var dLng = (longitude2 - longitude1) * DEG_TO_RAD;  // Diff in longtitude.

  // Calculate mid-point:
  var bx = Math.cos(lat2) * Math.cos(dLng);
  var by = Math.cos(lat2) * Math.sin(dLng);
  var lat = Math.atan2(
      Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by));
  var lng = lng1 + Math.atan2(by, Math.cos(lat1) + bx);

  return [lat / DEG_TO_RAD, lng / DEG_TO_RAD];
};

function joinSelectedMarkers() {

    const markerheight = document.getElementById('markerheight').value;
    
    const selectedColor = document.getElementById('selectedColor').value;

    const joinType = document.getElementById('joinType').value;
    const arrowType = document.getElementById('arrowType').value;
    
    let lat = [];
    let lng = [];
    let alt = [];
    
    markerGroup.traverse(function(obj){
        
        if(obj.name == 'Wireframe' ){  

            lat.push( Number( obj.parent.userData.lat ) );
            lng.push( Number( obj.parent.userData.lng ) );
            if ( joinType == 0 ) { 
                alt.push( Number( obj.parent.userData.ValueNormalized * markerheight  ) );
            } else {
                alt.push( 0 );
            }
        }
    }); 
    
    const distanceKm = latlongDistance( lat[0], lng[0], lat[1], lng[1] );
    const altFactor = distanceKm * radius / 20000; //Earthy Circomreference is 40000 km

    const startLat = lat[0] + THREE.MathUtils.randInt(-50,50)/10;
    const startLng = lng[0] + THREE.MathUtils.randInt(-50,50)/10;
    const stopLat = lat[1] + THREE.MathUtils.randInt(-50,50)/10;
    const stopLng = lng[1] + THREE.MathUtils.randInt(-50,50)/10;

 
 
    const arrowGeometry = new THREE.CylinderBufferGeometry( 0, radius, radius*2, 10, 12 );
    const arrowWireframe = new THREE.LineSegments( arrowGeometry, selectionMaterial );
    
    arrowWireframe.position.set( latLongToVector3(lat[0],lng[0],radius,alt[0]) );
    arrowWireframe.name='Arrow';
    joinsGroup.add( arrowWireframe );                 
                    
                    
                       
    const mid_temp = midPoint ( startLat, startLng, stopLat, stopLng );
    
    
    const mid_1 = midPoint ( lat[0],lng[0], mid_temp[0], mid_temp[1]  );
    const mid_2 = midPoint ( mid_temp[0],mid_temp[1], lat[1], lng[1]  );
    
    lat.splice(1, 0, mid_2[0]);
    lng.splice(1, 0, mid_2[1]);
    alt.splice(1, 0, Math.max( altFactor,alt[1] ) );

    lat.splice(1, 0, mid_1[0]);
    lng.splice(1, 0, mid_1[1]);
    alt.splice(1, 0, Math.max( altFactor,alt[0] ) );
    
    const curve = new THREE.CubicBezierCurve3 (
        latLongToVector3(lat[0],lng[0],radius,alt[0]),
        latLongToVector3(lat[1],lng[1],radius,alt[1]),
        latLongToVector3(lat[2],lng[2],radius,alt[2]),
        latLongToVector3(lat[3],lng[3],radius,alt[3]),
        );
    
    const curveSegments = curve.getPoints( 30 );
    const geometry = new THREE.BufferGeometry().setFromPoints( curveSegments );
    
    const material = new THREE.LineBasicMaterial();

    const curveObject = new THREE.Line( geometry, material );
 
    curveObject.material.color.set( selectedColor );
    curveObject.name = 'join'
    joinsGroup.add(curveObject); 
    
 
    //unselectAllMarkers();
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function latlongDistance( latitudeA, longitudeA, latitudeB, longitudeB ){

	var 
	earthRadiusKMeters = 6371,
	
	φ1 = latitudeA * Math.PI / 180,
	φ2 = latitudeB * Math.PI / 180,
	Δφ = ( latitudeB  - latitudeA  ) * Math.PI / 180,
	Δλ = ( longitudeB - longitudeA ) * Math.PI / 180,

	a = Math.sin( Δφ / 2 ) * Math.sin( Δφ / 2 ) +
		Math.cos( φ1 ) * Math.cos( φ2 ) *
		Math.sin( Δλ / 2 ) * Math.sin( Δλ / 2 ),
	c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a )),

	distancKMeters = earthRadiusKMeters * c

	return distancKMeters
}

function removeAllJoins() {
    joinsGroup.remove(...joinsGroup.children);    
}

function unselectAllMarkers() {

    markerGroup.traverse(function(obj){
        if(obj.name == 'Wireframe' ){  
            obj.parent.remove(obj);
        }
    });
    
    DisplaySelecctionInfo();
}
function hideSelectedMarkers() {

    markerGroup.traverse(function(obj){

        if(obj.name == 'marker' ) {
            if ( obj.children.length > 0 ){  
                obj.visible=false;
                obj.userData.visible = false;
            }
        }
        
    });
    unselectAllMarkers();
    DrawLabelObjects(transformedData);
}
function hideExcludedMarkers() {

    markerGroup.traverse(function(obj){
        if(obj.name == 'marker' ) {
            if ( obj.children.length == 0 ){  
                obj.visible=false;
                obj.userData.visible = false;
            }
        }
    });
    
    unselectAllMarkers();
    DrawLabelObjects(transformedData);
}

function unHideAll() {

    markerGroup.traverse(function(obj){
        
        if(obj.name == 'marker' ) {
           
            obj.visible=true;
            obj.userData.visible = true;

        }
        
    });
    DrawLabelObjects(transformedData);
    
}

function CreateSelection(obj) {
    const geo = new THREE.EdgesGeometry( obj.geometry );
    const wireframe = new THREE.LineSegments( geo, selectionMaterial );
    wireframe.scale.setScalar(1.15);
    wireframe.name='Wireframe';
    obj.add( wireframe );    
}

function ondblclick(event)
{
    if ( intersects.length > 0 )
    {
        const obj = intersects[ 0 ].object;
        
        if (obj.children.length == 0) {
            
            CreateSelection(obj);
    		
        } else {
            
            obj.remove(...obj.children);
            
        }
        DisplaySelecctionInfo();
    }
}

function gifStartStop () {
    if ( ! recordingGIF ) {
        StartRecording();
    } else {
        StopRecordning();
    }
}


function StartRecording () {
    capturer = new CCapture( { 
        format: 'gif', 
        workersPath: 'js/',
        //display: true,
        framerate: 10,
        //timeLimit: 15,
        name: 'xrstory'
        } );
    
    updateAnimation();
    timerCapturer = new THREE.Clock();
    timerCapturer.start();

    capturer.start();
    
    recordingGIF = true;
    document.getElementById('recordingStatus').style.display = "block";
    document.getElementById('recordingStatus').innerHTML='Recording in progress...';
    document.getElementById('gifStartStop').innerHTML='GIF Stop Recording';    
}

function StopRecordning () {
    capturer.stop();
    capturer.save();

    capturer = null;
    timerCapturer.stop ();
    timerCapturer = null;
    recordingGIF = false
    document.getElementById('recordingStatus').style.display = "none";
    document.getElementById('recordingStatus').innerHTML='';
    document.getElementById('gifStartStop').innerHTML='GIF Start Recording';    
}

function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onWindowResize() {

	camera.aspect = (window.innerWidth / window.innerHeight);
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

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

function updateAnimation () {
    // ---------------------------------------------------------------------
	// Animation (Rotation)
	// ---------------------------------------------------------------------
	
    const rotX = (document.getElementById( 'option_animationX' ).checked) ? 1 : 0;
    const rotY = (document.getElementById( 'option_animationY' ).checked) ? 1 : 0;
    const rotZ = (document.getElementById( 'option_animationZ' ).checked) ? 1 : 0;
    const animDuration = document.getElementById( 'animDuration' ).value;
    const direction = (document.getElementById( 'option_animation_dir' ).checked) ? -1 : 1;
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
function resetView() {
    
	camera.position.set( scaleMax*3,scaleMax*3, scaleMax*3 );
	camera.lookAt(new THREE.Vector3(0,0,0));  
	updateAnimation();
	controls.reset();
}

function IntersectionControl() {
    
    raycaster.setFromCamera( pointer, camera );

	intersects = raycaster.intersectObjects( markerGroup.children, false );

	if ( intersects.length > 0 ) {

		if ( intersected != intersects[ 0 ].object ) {

			intersected = intersects[ 0 ].object;
			DisplayHooverInfo(intersects[ 0 ].object.userData);
		}

	} else {

		intersected = null;
		document.getElementById("hoover").innerHTML='';
		document.getElementById("hoover").style.display = "none";

	}    
}

function animate() {
    
   const delta = clock.getDelta();
   
    if ( mixer ) {
        
        mixer.update( delta );
    }

    controls.update();
    
    IntersectionControl();
    
    onWindowResize();
    
    renderer.render( scene, camera );
    
    if( capturer ) {
        document.getElementById('recordingStatus').innerHTML = "<p><b>Recording in progress.</b></p><p>Current duration (exported file): " + Math.round(timerCapturer.getElapsedTime ()).toString() + " seconds</p>";
        
        capturer.capture( renderer.domElement );

        
    }
    
	renderer.setAnimationLoop( animate );
	
}
function DisplaySelecctionInfo() {
    
    document.getElementById('selected').innerHTML='';

    var selectedObjects = [];
    let htmltext = '';
    
    markerGroup.traverse(function(obj){
        if (obj.name =='Wireframe') {  selectedObjects.push(obj.parent.userData); }
    });
    
    document.getElementById('unselectAll').disabled = true;
    document.getElementById('hideSelected').disabled = true;
    document.getElementById('hideExcluded').disabled = true;
    document.getElementById('joinSelected').disabled = true;
    document.getElementById('joinType').disabled = true;
    document.getElementById('arrowType').disabled = true;

    
    if ( selectedObjects.length == 0 ) {
        htmltext += '<p>No objects selected.</p><p>You select objects by double clicking on them.</p><p>Deselect by double clicking on a selected object.</p>';

    } else {

        document.getElementById('unselectAll').disabled = false;
        document.getElementById('hideSelected').disabled = false;
        document.getElementById('hideExcluded').disabled = false;
        

        if ( selectedObjects.length == 2 ) {
            document.getElementById('joinSelected').disabled = false;
            document.getElementById('joinType').disabled = false;
            document.getElementById('arrowType').disabled = false;
    
        } else {
            document.getElementById('joinSelected').disabled = true;
            document.getElementById('joinType').disabled = true;
            document.getElementById('arrowType').disabled = true;
        }   
        htmltext += '<p>Number of selected objects: ' + selectedObjects.length + '</p>';
        htmltext += '<table>';
        htmltext += '<tr><th>id</th><th>Latitude</th><th>Longitude</th><th>Height</th><th>Color</th><th>Shape</th></tr>';


        for(var i = 0; i < selectedObjects.length; i++) {
            
            let userData = selectedObjects[i];
            htmltext += '<tr><td>'+userData['id']+'</td><td>'+userData['lat']+'</th><td>'+userData['lng']+'</td><td>'+userData['value']+'<td bgcolor="'+userData['color']+'">'+userData['color']+'</td><td>'+userData['shape']+'</td></tr>';

        }
       
        htmltext += '</table>';
    }

    document.getElementById('selected').innerHTML = htmltext;

    document.getElementById("selections").style.display = "block";
    
}

function DisplayHooverInfo(userData) {
    
    let htmltext ='';
    htmltext += '<h3>Looking at</h3>';
    htmltext += '<table>';
    htmltext += '<tr><th>id</th><th>Latitude</th><th>Longitude</th><th>Height</th><th>Color</th><th>Shape</th></tr>';
    htmltext += '<tr><td>'+userData['id']+'</td><td>'+userData['lat']+'</th><td>'+userData['lng']+'</td><td>'+userData['value']+'<td bgcolor="'+userData['color']+'">'+userData['color']+'</td><td>'+userData['shape']+'</td></tr>';
    htmltext += '</table>';
    
    document.getElementById('hoover').innerHTML = htmltext;
    document.getElementById("hoover").style.display = "block";
}

function latLongToVector3(lat, lon, radius, heigth) {
    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;

    var x = -(radius+heigth) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+heigth) * Math.sin(phi);
    var z = (radius+heigth) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
}			




function RemoveGridObjects() {
    gridGroup.remove(...gridGroup.children);
} 

function RemoveEarthObject() {
    if (scene.getObjectByName('earth')) {
        const objectToRemove=scene.getObjectByName('earth');
        group.remove(objectToRemove);
    }    
}

function DrawGrid() {
   

    RemoveGridObjects();
    
    const markerheight = document.getElementById('markerheight').value;
    const grids = document.getElementById( 'noOfGrids' ).value;
    const steps = (grids > 1 ? radius*markerheight/(grids-1) : 0);
    
    if (grids>0 && document.getElementById('showGrid').checked) {
        
        for (var i = 0; i < grids; i++) {
     
            const sphereGridHelper = new THREE.SphereBufferGeometry( 1+radius+steps*i, longSegments, latSegments);
            const gridHelperMaterial = new THREE.LineBasicMaterial({
                opacity: 0.15,
                transparent: true
            });
            
            gridHelperMaterial.color.setHSL(1 - (i/grids),0.5,0.5);
    		
    		const edgesGeometry = new THREE.EdgesGeometry( sphereGridHelper );
    		
    		const wireframe = new THREE.LineSegments( edgesGeometry, gridHelperMaterial ); 
    		wireframe.rotation.y = i*360/grids;
    		wireframe.name = 'grid';
    		gridGroup.add( wireframe );
        }
    }    
}

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
    
    const earthGeometry = new THREE.SphereBufferGeometry(radius, longSegments*10, latSegments*10);
    const earthMaterial = new THREE.MeshStandardMaterial({ });
    

    
    if ( globetexture != "notexture" ) {
        earthMaterial.map = new THREE.TextureLoader().load('./img/'+globetexture);
        earthMaterial.color.set('#FFFFFF');
    }  
    
    if ( UseSphereColor ) {   
        earthMaterial.color.set(SphereColor);
    }    
    
    if ( bump ) {
        earthMaterial.displacementMap=new THREE.TextureLoader().load('./img/displacement_map.jpg');
        earthMaterial.displacementScale=4;
        earthMaterial.displacementBias=0;
    }
    
    if ( reflSea ) {
        
        earthMaterial.roughness=1;
        earthMaterial.roughnessMap=new THREE.TextureLoader().load('./img/water_4k_green.png');

    }
    if ( reflLand ) {
        
        earthMaterial.roughness=1;
        earthMaterial.roughnessMap=new THREE.TextureLoader().load('./img/water_4k_green_inv.png');

    }


    if ( transEarth ) {
        earthMaterial.transparent=true;
        earthMaterial.opacity=0.8;
    } else {
        earthMaterial.transparent=false;
        earthMaterial.opacity=1;        
    }
    
    if ( materialSide==2 ) {
        earthMaterial.side = THREE.DoubleSide;
    } else if (materialSide==1) {
        earthMaterial.side = THREE.FrontSide;
    } else {
        earthMaterial.side = THREE.BackSide;
    }
    
    const earth = new THREE.Mesh( earthGeometry, earthMaterial );  
    earth.name='earth';
    group.add( earth );               

}

function PlotText(text,x,y,z,rx,ry,rz,target,color,size,offsetText){
    const loader = new THREE.FontLoader();
    loader.load( './fonts/helvetiker_regular.typeface.json', function ( font ) {
        const geometry = new THREE.TextBufferGeometry( text+'', {
            font: font,
            size: size,
            height: 0,
            curveSegments: 1
        } );
        
        geometry.computeBoundingBox();
        const textLength = geometry.boundingBox.max.x;
        
        if ( ! offsetText ) { 
            geometry.center();
        } else {
            geometry.translate(size/2,-size,0);
        }
        

        const material = new THREE.MeshStandardMaterial(
            { color: color, side: THREE.DoubleSide}
        );
        
        const mesh = new THREE.Mesh( geometry, material );

        mesh.up = new THREE.Vector3(0,0,1); 
        mesh.lookAt(target);
        mesh.name = 'label';
        
        
        mesh.position.set(x,y,z);
        mesh.geometry.rotateY( -Math.PI / 2*ry );
        mesh.geometry.rotateZ( -Math.PI / 2*rz );
        mesh.geometry.rotateX( -Math.PI / 2*rx );
       // mesh.translateOnAxis( new THREE.Vector3( 0,1,0 ),textLength+size/2 );
  



        
        
        labelGroup.add( mesh );	

    } );
}



function processData(csv){
    const readData = csvToArray(csv);
    
    //for (var i = 0; i < readData.length; i++) {
    //if (readData[i].id == "")
    //    readData.splice(i--, 1);
    //} 

	document.getElementById("filedataQty").innerHTML = "<li>Number of rows:" + readData.length + "</li>"; 
	
	verifyData(readData);
}

function loadHandler(event) {
	var csv = event.target.result;
	processData(csv);   
	document.getElementById("fileStatus1").innerHTML = "<li>File was sucessfully read!</li>"; 
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
        document.getElementById("fileStatus1").innerHTML = "<li>Error. File was not sucessfully read!</li>"; 
	}
}



function csvToArray(str, delimiter = ";") {
    const headers = str.slice(0, str.indexOf("\r\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\r\n");
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
            }, {});
        return el;
    });
    return arr;
}

function DefineDefaults (data) {
    
    const shapeColor = document.getElementById('markerColor').value;
    
    for (var i = 0; i < data.length; i++) {
        
        data[i].OriginalRowNo = i+1;
        data[i].visible = true;
        data[i].manualColor = false;
        
        if ( data[i].shape == undefined || data[i].shape == '') { data[i].shape = 0 };
        if ( data[i].value == undefined || data[i].value == '') { data[i].value = 1 };
        if ( data[i].color == undefined || data[i].color == '') { 
            data[i].color = shapeColor; 
            data[i].manualColor = true;
        } else if ( data[i].color.charAt(0) != '#' ) { data[i].color = '#' + data[i].color; }

    }
}

function TransformData(data) {
    
    DefineDefaults(data);
    
    let maxValue = Math.max.apply(null, data.map(function(item) {return item.value;}));
    let minValue = Math.min.apply(null, data.map(function(item) {return item.value;}));
    
    if (document.getElementById('normalize').checked) {
        if (minValue!=maxValue) {
            data.forEach(p => p.ValueNormalized = scaleMin + (((p.value-scaleMin)*(scaleMax-scaleMin))/(maxValue-minValue)));
        } else {
           data.forEach(p => p.ValueNormalized = radius/10);
        }
       
    } else {
       data.forEach(p => p.ValueNormalized = p.value);
    }
}


function DrawMarkerObjects(data) {
    RemoveMarkerObjects();
    
    let color;
    const markertype = document.getElementById('markertype').value;
    const markersize = document.getElementById('markersize').value;
    const markerheight = document.getElementById('markerheight').value;
    
    if (markertype!=5) {
        
        
        for(let i = 0; i < Math.min(data.length,maxDataLength); i++){
    
    		if (
    			   data[i]['lat'] !== undefined 
    			&& data[i]['lng'] !== undefined
    			&& data[i]['value'] !== undefined) {
    			    
    			    
    			
    			const ValueNormalized = Number(data[i]['ValueNormalized'])*markerheight; 
    
                const lat = Number(data[i]['lat']);
                const lng = Number(data[i]['lng']);
    
                const V31 = latLongToVector3(lat,lng,radius,0);
                const V32 = latLongToVector3(lat,lng,radius,ValueNormalized);
                const V33 = latLongToVector3(lat,lng,radius,ValueNormalized/2);
                const LookAtTarget = latLongToVector3(lat,lng,radius*10,0);
                if (data[i]['manualColor'] ) {
                    color = (document.getElementById('markerColor').value=="") ? "#000000" : document.getElementById('markerColor').value;
                } else {
                    color=data[i]['color'];
                }
                
                if (markertype==0 || markertype==5) {
                    const points = [];
                    points.push( V31 );
                    points.push( V32 );
                    const lineGeo = new THREE.BufferGeometry().setFromPoints( points );
                    const lineMaterial = new THREE.LineBasicMaterial();
                    lineMaterial.color.set(color);
                    if (document.getElementById('transMarkers').checked) {
                        lineMaterial.transparent=true;
                        lineMaterial.opacity=0.8;
                    } else {
                        lineMaterial.transparent=false;
                        lineMaterial.opacity=1;
                    }   
                    const line = new THREE.Line( lineGeo, lineMaterial );
                    line.name = "marker";
                    line.userData=data[i];
                    line.userData.shape='Line';
                    line.userData.color=color;
                    line.visible = data[i].visible;
                    
                    markerGroup.add( line );
                    
                }
                
                if (markertype==4) {
                    const boxgeometry = new THREE.BoxGeometry( markersize*radius/100, ValueNormalized, markersize*radius/100  );
                    const boxmaterial = new THREE.MeshStandardMaterial( {
                        roughness: 0,
                        metalness: 0
                    });
                    if (document.getElementById('transMarkers').checked) {
                        boxmaterial.transparent= true;
                        boxmaterial.opacity= 0.8;
                    } else {
                        boxmaterial.transparent=false;
                        boxmaterial.opacity=1;
                    }                                   
                        
                    boxmaterial.color.set(color);
                    const box = new THREE.Mesh( boxgeometry, boxmaterial );
                    box.position.x = V33.x;
                    box.position.y = V33.y;
                    box.position.z = V33.z;                            
                    box.geometry.rotateX( Math.PI / 2 );
                    box.up = new THREE.Vector3(0, 0, 1); //Z axis up
                    box.lookAt(LookAtTarget);
                    box.name="marker";
                    box.userData=data[i];
                    box.userData.shape='Box';
                    box.userData.color=color;
                    box.visible = data[i].visible;
                    markerGroup.add( box );
                }
                
                if (markertype>0 && markertype<4) {
                    let cylindergeometry = new THREE.CylinderBufferGeometry( markersize*radius/100, markersize*radius/100,ValueNormalized,20, 32 );
                    
                    if (markertype == 2) { 
                         cylindergeometry = new THREE.CylinderBufferGeometry( 0, markersize*radius/100,ValueNormalized,20, 32 );
                    } else if (markertype == 3) {
                         cylindergeometry = new THREE.CylinderBufferGeometry( markersize*radius/100, 0,ValueNormalized,20, 32 );
                    }
                    
                    const cylindermaterial = new THREE.MeshStandardMaterial( {
                        roughness: 0,
                        metalness: 0
                    });
                    if (document.getElementById('transMarkers').checked) {
                        cylindermaterial.transparent= true;
                        cylindermaterial.opacity= 0.8;
                    } else {
                        cylindermaterial.transparent=false;
                        cylindermaterial.opacity=1;
                    }                                   
                        
                    cylindermaterial.color.set(color);
                    const cylinder = new THREE.Mesh( cylindergeometry, cylindermaterial );
                    cylinder.position.x = V33.x;
                    cylinder.position.y = V33.y;
                    cylinder.position.z = V33.z;                            
                    cylinder.geometry.rotateX( Math.PI / 2 );
                    cylinder.up = new THREE.Vector3(0, 0, 1); //Z axis up
                    cylinder.lookAt(LookAtTarget);
                    cylinder.name="marker";
                    cylinder.userData=data[i];
                    if (markertype == 1) { cylinder.userData.shape='Cylinder'; } else if (markertype == 2) { cylinder.userData.shape='Cone Up'; } else { cylinder.userData.shape='Cone Down'; };
                    cylinder.userData.color=color;
                    cylinder.visible = data[i].visible;
                    markerGroup.add( cylinder );
                }
    		}
        }
    }
    
    showHideMarkerObjects();
}

function DrawLabelObjects(data) {
    RemoveLabelObjects();

    var labelTop1 = document.getElementById('labelTop1').checked;
    var labelTop2 = document.getElementById('labelTop2').checked;
    var labelTop3 = document.getElementById('labelTop3').checked;
    var labelTop4 = document.getElementById('labelTop4').checked;
    
    var labelSurface1 = document.getElementById('labelSurface1').checked;
    var labelSurface2 = document.getElementById('labelSurface2').checked;
    var labelSurface3 = document.getElementById('labelSurface3').checked;
    var labelSurface4 = document.getElementById('labelSurface4').checked;
    
    var labelVertical1 = document.getElementById('labelVertical1').checked;
    var labelVertical2 = document.getElementById('labelVertical2').checked;
    var labelVertical3 = document.getElementById('labelVertical3').checked;
    var labelVertical4 = document.getElementById('labelVertical4').checked;
    
    var labelVerticalTop1 = document.getElementById('labelVerticalTop1').checked;
    var labelVerticalTop2 = document.getElementById('labelVerticalTop2').checked;
    var labelVerticalTop3 = document.getElementById('labelVerticalTop3').checked;
    var labelVerticalTop4 = document.getElementById('labelVerticalTop4').checked;
    var labelVerticalTop5 = document.getElementById('labelVerticalTop5').checked;
    var labelVerticalTop6 = document.getElementById('labelVerticalTop6').checked;
    var labelVerticalTop7 = document.getElementById('labelVerticalTop7').checked;
    var labelVerticalTop8 = document.getElementById('labelVerticalTop8').checked;
    
    var labelFlag1 = document.getElementById('labelFlag1').checked;
    var labelFlag2 = document.getElementById('labelFlag2').checked;
    var labelFlag3 = document.getElementById('labelFlag3').checked;
    var labelFlag4 = document.getElementById('labelFlag4').checked;
    
    var labelSign1 = document.getElementById('labelSign1').checked;
    var labelSign2 = document.getElementById('labelSign2').checked;
    var labelSign3 = document.getElementById('labelSign3').checked;
    var labelSign4 = document.getElementById('labelSign4').checked;
    
    
    
    var labelRotation1 = Number( document.getElementById('labelRotation').value ) ;
    var labelRotation2 = labelRotation1 + 0.5 ;
    var labelRotation3 = labelRotation2 + 0.5 ;
    var labelRotation4 = labelRotation3 + 0.5 ;
    
    const markersize = document.getElementById('markersize').value;
    const markerheight = document.getElementById('markerheight').value;

    const labelFontSize1 = document.getElementById('labelFontSize1').value;
    const labelFontSize2 = document.getElementById('labelFontSize2').value;
    const labelFontSize3 = document.getElementById('labelFontSize3').value;
    const labelFontSize4 = document.getElementById('labelFontSize4').value;
    
    var fontSize1,fontSize2,fontSize3,fontSize4;
    
    switch ( labelFontSize1 ) {
        case "1": fontSize1=FontSizeSmall; break;
        case "2": fontSize1=FontSizeMedium; break;
        case "3": fontSize1=FontSizeLarge; break;
    }

    switch ( labelFontSize2 ) {
        case "1": fontSize2=FontSizeSmall; break;
        case "2": fontSize2=FontSizeMedium; break;
        case "3": fontSize2=FontSizeLarge; break;
    }

    switch ( labelFontSize3 ) {
        case "1": fontSize3=FontSizeSmall; break;
        case "2": fontSize3=FontSizeMedium; break;
        case "3": fontSize3=FontSizeLarge; break;
    }
    
    switch ( labelFontSize4 ) {
        case "1": fontSize4=FontSizeSmall; break;
        case "2": fontSize4=FontSizeMedium; break;
        case "3": fontSize4=FontSizeLarge; break;
    }
    
     
    let color1 = (document.getElementById('labelColor1').value=="") ? "FFFFFF" : document.getElementById('labelColor1').value;
    let color2 = (document.getElementById('labelColor2').value=="") ? "FFFFFF" : document.getElementById('labelColor2').value;
    let color3 = (document.getElementById('labelColor3').value=="") ? "FFFFFF" : document.getElementById('labelColor3').value;
    let color4 = (document.getElementById('labelColor4').value=="") ? "FFFFFF" : document.getElementById('labelColor4').value;
    
    markerGroup.traverseVisible(function(obj){
        
        const ValueNormalized = obj.userData.ValueNormalized * markerheight; 
        const lat = obj.userData.lat;
        const lng = obj.userData.lng;

        const V31 = latLongToVector3(lat,lng,radius,0);
        const V32 = latLongToVector3(lat,lng,radius,0.01+ValueNormalized);
        const V321 = latLongToVector3(lat,lng,radius,0.01+ValueNormalized-fontSize2);
        const V322 = latLongToVector3(lat,lng,radius,0.01+ValueNormalized-fontSize3*2);
        const V323 = latLongToVector3(lat,lng,radius,0.01+ValueNormalized-fontSize4*3);
        const V33 = latLongToVector3(lat,lng,radius,0.01+ValueNormalized/2);
        const LookAtTarget = latLongToVector3(lat,lng,radius*10,0);
        
        const id = obj.userData.id;
        const label1 = ( obj.userData.label1 != undefined ) ? obj.userData.label1 : '';
        const label2 = ( obj.userData.label2 != undefined ) ? obj.userData.label2 : '';
        const label3 = ( obj.userData.label3 != undefined ) ? obj.userData.label3 : '';
        
        if ( labelSurface1 && id != '' && id != undefined )  PlotText(id,V31.x,V31.y,V31.z,0,0,labelRotation1,LookAtTarget,color1,fontSize1,false);
        if ( labelSurface2 && label1 != '' && label1 != undefined )  PlotText(label1,V31.x,V31.y,V31.z,0,0,labelRotation2,LookAtTarget,color2,fontSize2,false);
        if ( labelSurface3 && label2 != '' && label2 != undefined )  PlotText(label2,V31.x,V31.y,V31.z,0,0,labelRotation3,LookAtTarget,color3,fontSize3,false);
        if ( labelSurface4 && label3 != '' && label3 != undefined )  PlotText(label3,V31.x,V31.y,V31.z,0,0,labelRotation4,LookAtTarget,color4,fontSize4,false);
        
        if ( labelTop1 && id != '' && id != undefined ) PlotText(id,V32.x,V32.y,V32.z,0,0,labelRotation1,LookAtTarget,color1,fontSize1,false);
        if ( labelTop2 && label1 != '' && label1 != undefined ) PlotText(label1,V32.x,V32.y,V32.z,0,0,labelRotation2,LookAtTarget,color2,fontSize2,false);
        if ( labelTop3 && label2 != '' && label2 != undefined ) PlotText(label2,V32.x,V32.y,V32.z,0,0,labelRotation3,LookAtTarget,color3,fontSize3,false);
        if ( labelTop4 && label3 != '' && label3 != undefined ) PlotText(label3,V32.x,V32.y,V32.z,0,0,labelRotation4,LookAtTarget,color4,fontSize4,false);
        
        if ( labelVertical1 && id != '' && id != undefined ) PlotText(id,V33.x,V33.y,V33.z,0,1,labelRotation1,LookAtTarget,color1,fontSize1,false);
        if ( labelVertical1 && label1 != '' && label1 != undefined ) PlotText(label1,V33.x,V33.y,V33.z,0,1,labelRotation2,LookAtTarget,color2,fontSize2,false);
        if ( labelVertical3 && label2 != '' && label2 != undefined ) PlotText(label2,V33.x,V33.y,V33.z,0,1,labelRotation3,LookAtTarget,color3,fontSize3,false);
        if ( labelVertical4 && label3 != '' && label3 != undefined ) PlotText(label3,V33.x,V33.y,V33.z,0,1,labelRotation4,LookAtTarget,color4,fontSize4,false);
    
	    if ( labelVerticalTop1 && id != '' && id != undefined ) PlotText(id,V32.x,V32.y,V32.z,0,1,labelRotation1,LookAtTarget,color1,fontSize1,false);
        if ( labelVerticalTop2 && label1 != '' && label1 != undefined ) PlotText(label1,V32.x,V32.y,V32.z,0,1,labelRotation2,LookAtTarget,color2,fontSize2,false);
        if ( labelVerticalTop3 && label2 != '' && label2 != undefined ) PlotText(label2,V32.x,V32.y,V32.z,0,1,labelRotation3,LookAtTarget,color3,fontSize3,false);
        if ( labelVerticalTop4 && label3 != '' && label3 != undefined ) PlotText(label3,V32.x,V32.y,V32.z,0,1,labelRotation4,LookAtTarget,color4,fontSize4,false);
        
	    if ( labelVerticalTop5 && id != '' && id != undefined ) PlotText(id,V32.x,V32.y,V32.z,0,-1,labelRotation1,LookAtTarget,color1,fontSize1,false);
	    if ( labelVerticalTop6 && label1 != '' && label1 != undefined ) PlotText(label1,V32.x,V32.y,V32.z,0,-1,labelRotation2,LookAtTarget,color2,fontSize2,false);
	    if ( labelVerticalTop7 && label2 != '' && label2 != undefined ) PlotText(label2,V32.x,V32.y,V32.z,0,-1,labelRotation3,LookAtTarget,color3,fontSize3,false);
	    if ( labelVerticalTop8 && label3 != '' && label3 != undefined ) PlotText(label3,V32.x,V32.y,V32.z,0,-1,labelRotation4,LookAtTarget,color4,fontSize4,false);
                    
        if ( labelSign1 && id != '' && id != undefined ) PlotText(id,V32.x,V32.y,V32.z,-1,labelRotation1,0,LookAtTarget,color1,fontSize1,false);
        if ( labelSign2 && label1 != '' && label1 != undefined ) PlotText(label1,V321.x,V321.y,V321.z,-1,labelRotation2,0,LookAtTarget,color2,fontSize2,false);
        if ( labelSign3 && label2 != '' && label2 != undefined ) PlotText(label2,V322.x,V322.y,V322.z,-1,labelRotation3,0,LookAtTarget,color3,fontSize3,false);
        if ( labelSign4 && label3 != '' && label3 != undefined ) PlotText(label3,V323.x,V323.y,V323.z,-1,labelRotation4,0,LookAtTarget,color4,fontSize4,false);
    
        if ( labelFlag1 && id != '' && id != undefined ) PlotText(id,V32.x,V32.y,V32.z,-1,labelRotation1,0,LookAtTarget,color1,fontSize1,true);
        if ( labelFlag2 && label1 != '' && label1 != undefined ) PlotText(label1,V321.x,V321.y,V321.z,-1,labelRotation2,0,LookAtTarget,color2,fontSize2,true);
        if ( labelFlag3 && label2 != '' && label2 != undefined ) PlotText(label2,V322.x,V322.y,V322.z,-1,labelRotation3,0,LookAtTarget,color3,fontSize3,true);
        if ( labelFlag4 && label3 != '' && label3 != undefined ) PlotText(label3,V323.x,V323.y,V323.z,-1,labelRotation4,0,LookAtTarget,color4,fontSize4,true);
      
  
    });
}


function exportGLTF( input ) {
    
    updateAnimation();
	
	
	const gltfExporter = new GLTFExporter();
	const options = {
		trs: true, //document.getElementById( 'option_trs' ).checked,
		onlyVisible: true, //document.getElementById( 'option_visible' ).checked,
		truncateDrawRange: true, //document.getElementById( 'option_drawrange' ).checked,
		binary: (document.getElementById( 'exportFormat' ).value==1) ? (true) : false,
		animations: ((document.getElementById( 'option_animationX' ).checked || document.getElementById( 'option_animationY' ).checked || document.getElementById( 'option_animationZ' ).checked) ? ([clip]) : ''),
		forceIndices:true
		//maxTextureSize: Number( document.getElementById( 'option_maxsize' ).value ) || Infinity // To prevent NaN value
	};
	

	gltfExporter.parse( input, function ( result ) {
	    let gltfFileName = (document.getElementById('gltfFileName').value=="") ? "globe" : document.getElementById('gltfFileName').value;
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


function verifyData(data) {

    let hasError = false;
    
    if (data.length>maxDataLength) {
    	document.getElementById("fileStatus2").innerHTML = "<li>Number of rows is larger than "+maxDataLength+", only the first "+maxDataLength+" rows based on values will be processd.</li>"; 
    	
    	data.splice(maxDataLength, data.length - maxDataLength);
 
    }
    
    if(data[0].id == undefined) {
    	document.getElementById("fileStatus3").innerHTML = "<li>File process error: There is no id column present.</li>"; 
    	hasError=true;
    }
    if(data[0].lat == undefined || data[0].lng == undefined) {
    	document.getElementById("fileStatus4").innerHTML = "<li>Geo coordinate error! Columns lat and/or lng are missing.</li>"; 
    	hasError=true;
    }
    
    if(!hasError) {
        
        TransformData(data);
        
        DrawMarkerObjects(data);
        DrawLabelObjects(data);   
        removeAllJoins();
        transformedData = data;
        

    }
}


function RemoveMarkerObjects() {
    markerGroup.remove(...markerGroup.children);
} 

function RemoveLabelObjects() {
    labelGroup.remove(...labelGroup.children);
}  

function loadSettings(event) {
	var settingsfile = event.target.result.split(String.fromCharCode(10));
	
    const noOfSetttings=settingsfile.length-1;
    document.getElementById("loadSettingsStatus1").innerHTML = "<li>Settings file imported.</li>"; 
	document.getElementById("loadSettingsStatus2").innerHTML = "<li>Number of settings loaded:" + noOfSetttings + "</li>"; 
	
	settingsLoader=true;
	var counter=0
	for(var i = 0; i < settingsfile.length; i++) {
	    const setting = settingsfile[i].split(String.fromCharCode(9));
	    if ( setting[0] != '' && setting[0] != undefined ) {
	        
	        if (document.getElementById(setting[1])) {
                if( setting[0] == 'text' ) {
                    document.getElementById(setting[1]).value = setting[2];
                } else if( setting[0] == 'checkbox' ) {
                    document.getElementById(setting[1]).checked = ( setting[2] == 'true' ) ? true : false;
                } else if( setting[0] == 'select-one' ) {
                    document.getElementById(setting[1]).value = setting[2];
                }
                counter++;
	        } else {
	            console.log("Settings Loader: Missing setting: " + setting[1]);
	        }
	    }
	   
	}   
	document.getElementById("loadSettingsStatus3").innerHTML = "<li>Number of settings set:" + counter + "</li>"; 
	
    updateAnimation();
    DrawGrid();
    DrawEarth();
    
    if( transformedData != undefined && transformedData.length > 0 ) { 
        
        DrawMarkerObjects(transformedData);
        DrawLabelObjects(transformedData);   
        
    };
    
    showHideMarkerObjects();
    renderer.setClearColor(screenColor.value, 1 );
    
    settingsLoader=false;
}

function showHideMarkerObjects() {
    
    const markertype = document.getElementById('markertype').value;
    
    if ( markertype != 5 ) {
        
        markerGroup.visible = true;
        
    } else {
        markerGroup.visible = false;
    }
    
     
                
}
function saveSettings() {
    var ids = document.querySelectorAll('[id]');

    var SettingsData='';
    
    for(var i = 0; i < ids.length; i++) {

        if( ids[i].id != undefined && ids[i].id != '' && ids[i].type != "submit" && ids[i].type != "file"  && ids[i].type != "button"  && ids[i].nodeName != "DIV") {
            
            if(ids[i].type == 'checkbox' ) {
                SettingsData = SettingsData.concat(ids[i].type + String.fromCharCode(9) + ids[i].id + String.fromCharCode(9) + ids[i].checked + String.fromCharCode(10));
            } else {
                SettingsData = SettingsData.concat(ids[i].type + String.fromCharCode(9) + ids[i].id + String.fromCharCode(9) + ids[i].value + String.fromCharCode(10));
            }
        }
    }
   
    const saveSettingsFileName = (document.getElementById('saveSettingsFileName').value=="") ? "settings" : document.getElementById('saveSettingsFileName').value;    
    var blob = new Blob([SettingsData],
                    { type: "text/plain;charset=utf-8" });

    saveAs(blob, saveSettingsFileName+'.settings');
    
}