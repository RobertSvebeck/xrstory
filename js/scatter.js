import * as THREE                   from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { TrackballControls }        from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/TrackballControls.js';
import { GLTFExporter }             from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/exporters/GLTFExporter.js';

//VR CODE: Add VR Button and XR controllers
import { VRButton }                 from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/webxr/XRControllerModelFactory.js';

let container, camera, controls, scene, renderer;
let group, gridGroup, labelGroup, scatterGroup, scatterLabelGroup, joinsGroup,HeaderFooterGroup;
let importFileName,settingsLoader=false;

let uniqueShapes,uniqueColors,uniqueSets;
let transformedData;

let selectionMaterial;
let materialCol = [];
let joinedData = [];

let pointer,raycaster,intersected,intersects;

//animation
let clip,clipAction,mixer,clock;

let capturer, recordingGIF = false, timerCapturer;

const radius = 100;
const latSegments = 18; 
const longSegments = 36;

var scaleMin = -10;
var scaleMax = 10;
var noOfGrids   = 10;

var scaleSizeMin = 0.1;
var scaleSizeMax = 1;  

var maxX = scaleMax;
var minX = scaleMin;
var maxY = scaleMax;
var minY = scaleMin;
var maxZ = scaleMax;
var minZ = scaleMin;
var maxSize = scaleSizeMax;
var minSize = scaleSizeMin;    

var FontSizeLarge = scaleMax*0.1;
var FontSizeMedium = scaleMax*0.04;
var FontSizeSmall = scaleMax*0.02;

const maxDataLength = 20000;

document.getElementById("gridx1").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); } } );
document.getElementById("gridx2").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); } } );
document.getElementById("colorGridx").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); DrawLabelObjects(); } } );

document.getElementById("gridy1").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); } });
document.getElementById("gridy2").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); } });
document.getElementById("colorGridy").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); DrawLabelObjects(); } } );

document.getElementById("gridz1").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid() }; } );
document.getElementById("gridz2").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid() }; } );
document.getElementById("colorGridz").addEventListener('change', (event) => { if(!settingsLoader) { DrawGrid(); DrawLabelObjects(); } } );

document.getElementById('xaxis').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('yaxis').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('zaxis').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );

document.getElementById('yeslabelsx1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('yeslabelsx2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('yeslabelsy1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('yeslabelsy2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('yeslabelsz1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('yeslabelsz2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('labelsFontSize').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );

document.getElementById('valuesx1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('valuesx2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('valuesy1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('valuesy2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('valuesz1').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('valuesz2').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('axisXdecimals').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('axisYdecimals').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('axisZdecimals').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );
document.getElementById('axisValuesFontSize').addEventListener('change', (event) => { if(!settingsLoader) { DrawLabelObjects(); } } );

document.getElementById('ShowHeaderText').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );
document.getElementById('headerText').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );
document.getElementById('headerTextFontSize').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );
document.getElementById('ShowFooterText').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );
document.getElementById('footerText').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );
document.getElementById('footerTextFontSize').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );
document.getElementById('headerColor').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );
document.getElementById('footerColor').addEventListener('change', (event) => { if(!settingsLoader) { DrawHeaderFooterText(); } } );




document.getElementById('colorId').addEventListener('change', (event) => { if(!settingsLoader) { DrawValues(); } } );
document.getElementById('idvalue').addEventListener('change', (event) => { if(!settingsLoader) { DrawValues(); } } );

document.getElementById('plotShape').addEventListener('change', (event) => { if(!settingsLoader) { showHideScatterObjects(); } } );
document.getElementById('tranShape').addEventListener('change', (event) => { if(!settingsLoader) { ChangeScatterMaterial(); } } );
document.getElementById('shapeColor').addEventListener('change', (event) => { if(!settingsLoader) { 
                                                                            CreateScatterObjects(transformedData);
                                                                            PlotScatterObjects(transformedData);
                                                                            } } );

document.getElementById('screenColor').addEventListener('change', (event) => { if(!settingsLoader) { renderer.setClearColor(screenColor.value, 1 ); } } );
document.getElementById('selectedColor').addEventListener('change', (event) => { if(!settingsLoader) { selectionMaterial.color.set( selectedColor.value ); } } );

document.getElementById('labelFontSize').addEventListener('change', (event) => { if(!settingsLoader) { DrawValues(); } } );
document.getElementById('labelRotation').addEventListener('change', (event) => { if(!settingsLoader) { DrawValues(); } } );
document.getElementById('labelPosition').addEventListener('change', (event) => { if(!settingsLoader) { DrawValues(); } } );
document.getElementById('labelContent').addEventListener('change', (event) => { if(!settingsLoader) { DrawValues(); } } );

document.getElementById('option_animationX').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('option_animationY').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('option_animationZ').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('animDuration').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );
document.getElementById('option_animation_dir').addEventListener('change', (event) => { if(!settingsLoader) { updateAnimation(); } } );

document.getElementById( 'export_objects' ).addEventListener( 'click', function () { exportGLTF( group ); } );
document.getElementById("shot").addEventListener('click', takeScreenshot);
document.getElementById("saveSettingsFile").addEventListener('click', saveSettings);
document.getElementById("removeJoins").addEventListener('click', removeAllJoins );
document.getElementById('unselectAll').addEventListener('click', unselectAllScatters );
document.getElementById('hideSelected').addEventListener('click', hideSelectedScatters );
document.getElementById('hideExcluded').addEventListener('click', hideExcludedScatters );
document.getElementById('joinSelected').addEventListener('click', joinSelectedScatters );
document.getElementById('resetView').addEventListener('click', resetView );
document.getElementById('unHideAll').addEventListener('click', unHideAll );
document.getElementById('gifStartStop').addEventListener('click', gifStartStop );
document.getElementById('selectShape').addEventListener('click', selectAllWithSameShape );
document.getElementById('selectColor').addEventListener('click', selectAllWithSameColor );
document.getElementById('selectSize').addEventListener('click', selectAllWithSameSize );
document.getElementById('rescaleGrids').addEventListener('click', rescaleGrids ); //autoRescaling
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

    const userFile = csvFile.files[0];   
    const userFileURL = URL.createObjectURL( userFile );
    importFileName=userFile.name.replace('.csv','');
    
    document.getElementById("filename").innerHTML = "<li>Reading filename: " + userFile.name + " FileSize: " + userFile.size + "</li>"; 
	document.getElementById("filedataQty").innerHTML = "";
	document.getElementById("fileStatus1").innerHTML = "";
	document.getElementById("fileStatus2").innerHTML = "";
	document.getElementById("fileStatus3").innerHTML = "";
	document.getElementById("fileStatus4").innerHTML = "";
	document.getElementById("fileStatus5").innerHTML = ""; 
    document.getElementById("fileStatus6").innerHTML = ""; 
    document.getElementById("fileStatus7").innerHTML = ""; 
    document.getElementById("fileStatus8").innerHTML = ""; 
    document.getElementById("fileStatus9").innerHTML = ""; 
    document.getElementById("fileStatus10").innerHTML = ""; 
    document.getElementById("fileStatus11").innerHTML = ""; 
    document.getElementById("fileStatus12").innerHTML = ""; 
    let reader = new FileReader();
    reader.readAsText(userFile);
    reader.onload = loadHandler;
    reader.onerror = errorHandler;
    
});

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
	camera = new THREE.PerspectiveCamera( 45, 2, 1, scaleMax*100);
	camera.position.set( scaleMax*3,scaleMax*3, scaleMax*3 );
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
	dirLight.position.set(scaleMax*100,scaleMax*100,scaleMax*100);
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
    
    labelGroup = new THREE.Group();
    group.add(labelGroup);

    scatterLabelGroup = new THREE.Group();
    group.add(scatterLabelGroup);
    
    HeaderFooterGroup = new THREE.Group();
    group.add(HeaderFooterGroup);
    
    scatterGroup = new THREE.Group();
    scatterGroup.name='scatterGroup';
    group.add(scatterGroup);

	// ---------------------------------------------------------------------
    // Material for selections
	// ---------------------------------------------------------------------
    selectionMaterial = new THREE.LineBasicMaterial( { opacity:0.5,transparent:true} );
    const selectedColor = document.getElementById('selectedColor').value;
    selectionMaterial.color.set( selectedColor );

	// ---------------------------------------------------------------------
	// Create Scatter
	// ---------------------------------------------------------------------
    DrawGrid();
    DrawLabelObjects();
    onWindowResize();
    
	// ---------------------------------------------------------------------
	// Animation
	// ---------------------------------------------------------------------    
    updateAnimation();

    window.addEventListener( 'resize', onWindowResize() );
    
}

function rescaleGrids () {
    
    var reScaledData = transformedData.filter(function(value){
      return value.visible == true;
    });
    
    DefineMinMax(reScaledData);
    Normalize(transformedData);

    FindUniqueCombinations(transformedData);
    DrawLabelObjects(transformedData);   
    CreateScatterObjects(transformedData);
    PlotScatterObjects(transformedData);
    
    
    DrawValues();
    redrawJoins();
    
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
    console.log(timerCapturer);
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

function selectAllWithSameColor () {

    let selectedColors = [];
    
    scatterGroup.traverseVisible(function(obj){

        if(obj.name == 'data' ) {
            
            if ( obj.children.length > 0 ){  
                
                selectedColors.push( obj.userData.color );
                
            }
        }
        
    });   
    
    if ( selectedColors.length > 0 ) {
    
        scatterGroup.traverseVisible(function(obj){

            if(obj.name == 'data' ) {
                
                if ( obj.children.length == 0 ){  
                
                    if ( selectedColors.indexOf( obj.userData.color ) > -1 ) {
                        
                        CreateSelection(obj);   
                        
                    }
    
                }
            }
        
        });   
        
    }
    DisplaySelecctionInfo();
    
}

function selectAllWithSameSize () {
    let selectedSizes = [];
    const normalize = document.getElementById('normalize').checked;
    const sizeTolerance = document.getElementById('sizeTolerance').value;
    let sizeToleranceRelative;
    
    if ( normalize ) {
        sizeToleranceRelative = (scaleSizeMax-scaleSizeMin) * Number( sizeTolerance ) / 100;
    } else {
        sizeToleranceRelative = (maxSize-minSize) * Number( sizeTolerance ) / 100;
    }
    
    scatterGroup.traverseVisible(function(obj){

        if(obj.name == 'data' ) {
            
            if ( obj.children.length > 0 ){  
                
                selectedSizes.push( Number ( obj.userData.sizePlot ) );
                
            }
        }
        
    });   
    
    const maxRangeSize = Math.max(...selectedSizes);
    const minRangeSize = Math.min(...selectedSizes);
    
    
    const maxSizeToll = maxRangeSize + sizeToleranceRelative;
    const minSizeToll = minRangeSize - sizeToleranceRelative;
    
    if ( selectedSizes.length > 0 ) {
    
        scatterGroup.traverseVisible(function(obj){

            if(obj.name == 'data' ) {

                if ( obj.children.length == 0 ){  
                
                    if (  obj.userData.sizePlot >= minSizeToll  && obj.userData.sizePlot <= maxSizeToll) {
                        
                        CreateSelection(obj);   
                    }
    
                }
            }
        
        });   
        
    }
    
    DisplaySelecctionInfo();
}

function selectAllWithSameShape () {

    let selectedShapes = [];
    
    scatterGroup.traverseVisible(function(obj){

        if(obj.name == 'data'  && obj.visible ) {
            
            
            if ( obj.children.length > 0 ){  
                
                selectedShapes.push( obj.userData.shape );
                
            }
        }
        
    });   
    
    if ( selectedShapes.length > 0 ) {
    
        scatterGroup.traverseVisible(function(obj){

            if(obj.name == 'data' && obj.visible ) {
                
                if ( obj.children.length == 0 ){  
                
                    if ( selectedShapes.indexOf( obj.userData.shape ) > -1 ) {
                        
                        CreateSelection(obj);   
                    }
    
                }
            }
            
        });   
        
    }
    DisplaySelecctionInfo();
}

function unselectAllScatters() {

    scatterGroup.traverse(function(obj){
        if(obj.name == 'Wireframe' ){  
            obj.parent.remove(obj);
        }
    });
    
    DisplaySelecctionInfo();
}
function hideSelectedScatters() {

    scatterGroup.traverseVisible(function(obj){

        if(obj.name == 'data' ) {
            if ( obj.children.length > 0 ){  
                obj.visible=false;
                obj.userData.visible = false;
            }
        }
        
    });
    
    if(document.getElementById("autoRescaling").checked ) { rescaleGrids() };  
    
    unselectAllScatters();
    DrawValues();
}
function hideExcludedScatters() {

    scatterGroup.traverseVisible(function(obj){
        if(obj.name == 'data' ) {
            if ( obj.children.length == 0 ){  
                obj.visible=false;
                obj.userData.visible = false;
            }
        }
    });
    
    if(document.getElementById("autoRescaling").checked ) { rescaleGrids() };  
    
    unselectAllScatters();
    DrawValues();
}

function unHideAll() {

    scatterGroup.traverse(function(obj){
        
        if(obj.name == 'data' ) {
           
            obj.visible=true;
            obj.userData.visible = true;

        }
        
    });
    
    if(document.getElementById("autoRescaling").checked ) { rescaleGrids() };    
    
    DrawValues();
    
}
function IntersectionControl() {
    
    raycaster.setFromCamera( pointer, camera );

	intersects = raycaster.intersectObjects( scatterGroup.children, false );

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

function resetView() {
    
	camera.position.set( scaleMax*3,scaleMax*3, scaleMax*3 );
	camera.lookAt(new THREE.Vector3(0,0,0));  
	updateAnimation();
	controls.reset();
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

function DisplayHooverInfo(userData) {
    
    const label_xaxis = ( document.getElementById('xaxis').value=='' ) ? 'x' : document.getElementById('xaxis').value; 
    const label_yaxis = ( document.getElementById('yaxis').value=='' ) ? 'y' : document.getElementById('yaxis').value; 
    const label_zaxis = ( document.getElementById('zaxis').value=='' ) ? 'z' : document.getElementById('zaxis').value;  
    
    var shape;
    
    switch ( Number( userData['shape'] ) ) {
        case 0:
            shape='Box';
            break;
        case 1:
            shape='Cone';
            break;
        case 2:
            shape='Cylinder';
            break;
        case 3:
            shape='Sphere';
            break;
        case 4:
            shape='Torus';
            break;
    }
    
    let RoundedX    = Math.round  ( 100 * userData['x'] ) / 100; 
    let RoundedY    = Math.round  ( 100 * userData['y'] ) / 100; 
    let RoundedZ    = Math.round  ( 100 * userData['z'] ) / 100; 
    let RoundedSize = Math.round  ( 100 * userData['size'] ) / 100; 
    
    let htmltext ='';
    htmltext += '<h3>Looking at</h3>';
    htmltext += '<table>';
    htmltext += '<tr><th>id</th><th>size</th><th>color</th><th>shape</th><th>'+label_xaxis+'</th><th>'+label_yaxis+'</th><th>'+label_zaxis+'</th></tr>';
    htmltext += '<tr><td>'+userData['id']+'</td><td>'+RoundedSize+'</th><td bgcolor="'+userData['color']+'">'+userData['color']+'</td><td>'+shape+'</td><td>'+RoundedX+'</td><td>'+RoundedY+'</td><td>'+RoundedZ+'</td></tr>';
    htmltext += '</table>';
    
    document.getElementById('hoover').innerHTML = htmltext;
    document.getElementById("hoover").style.display = "block";
}

function DisplaySelecctionInfo() {
    
    document.getElementById('selected').innerHTML='';
    const label_xaxis = ( document.getElementById('xaxis').value=='' ) ? 'x' : document.getElementById('xaxis').value; 
    const label_yaxis = ( document.getElementById('yaxis').value=='' ) ? 'y' : document.getElementById('yaxis').value; 
    const label_zaxis = ( document.getElementById('zaxis').value=='' ) ? 'z' : document.getElementById('zaxis').value;    

    var selectedObjects = [];
    let htmltext = '';
    
    scatterGroup.traverse(function(obj){
        if (obj.name =='Wireframe') {  selectedObjects.push(obj.parent.userData); }
    });
    
    document.getElementById('unselectAll').disabled = true;
    document.getElementById('hideSelected').disabled = true;
    document.getElementById('hideExcluded').disabled = true;
    document.getElementById('joinSelected').disabled = true;
    document.getElementById('selectColor').disabled = true;
    document.getElementById('selectSize').disabled = true;
    document.getElementById('selectShape').disabled = true;    
    document.getElementById('joinType').disabled = true;
    document.getElementById('joinArrow').disabled = true;
    
    if ( selectedObjects.length == 0 ) {
        htmltext += '<p>No objects selected.</p><p>You select objects by double clicking on them.</p><p>Deselect by double clicking on a selected object.</p>';

    } else {

        document.getElementById('unselectAll').disabled = false;
        document.getElementById('hideSelected').disabled = false;
        document.getElementById('hideExcluded').disabled = false;
        
        document.getElementById('selectColor').disabled = false;
        document.getElementById('selectSize').disabled = false;
        document.getElementById('selectShape').disabled = false;

        if ( selectedObjects.length == 2 ) {
            
            document.getElementById('joinSelected').disabled = false;
            document.getElementById('joinType').disabled = false;
            document.getElementById('joinArrow').disabled = false;
            
        } else {
            
            document.getElementById('joinSelected').disabled = true;
            document.getElementById('joinType').disabled = true;
            document.getElementById('joinArrow').disabled = true;
            
        }  
        
        htmltext += '<p>Number of selected objects: ' + selectedObjects.length + '</p>';
        htmltext += '<table>';
        htmltext += '<tr><th>Id</th><th>Size</th><th>Color</th><th>Shape</th><th>'+label_xaxis+'</th><th>'+label_yaxis+'</th><th>'+label_zaxis+'</th><th>csv-row</th></tr>';
        
        var shape;
        
        for(var i = 0; i < selectedObjects.length; i++) {
         
            let userData = selectedObjects[i];
                
            switch ( Number( userData['shape'] ) ) {
                
                case 0:
                    shape='Box';
                    break;
                case 1:
                    shape='Cone';
                    break;
                case 2:
                    shape='Cylinder';
                    break;
                case 3:
                    shape='Sphere';
                    break;
                case 4:
                    shape='Torus';
                    break;
                default:
                    shape='Sphere';
                
            } 
            
            let RoundedX    = Math.round  ( 100 * userData['x'] ) / 100; 
            let RoundedY    = Math.round  ( 100 * userData['y'] ) / 100; 
            let RoundedZ    = Math.round  ( 100 * userData['z'] ) / 100; 
            let RoundedSize = Math.round  ( 100 * userData['size'] ) / 100; 
            
            htmltext += '<tr><td>'+userData['id']+'</td><td>'+RoundedSize+'</th><td bgcolor="'+userData['color']+'">'+userData['color']+'</td><td>'+shape+'</td><td>'+RoundedX+'</td><td>'+RoundedY+'</td><td>'+RoundedZ+'</td><td>'+userData['OriginalRowNo']+'</td></tr>';
        }
       
        htmltext += '</table>';
    }
    

    
    document.getElementById('selected').innerHTML = htmltext;


    document.getElementById("selections").style.display = "block";
    
}

function redrawJoins() {

    removeAllJoins();
    console.log(joinedData);
    const line = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial()
    );   
    
    const selectedColor = document.getElementById('selectedColor').value;
    line.material.color.set( selectedColor );    
    
    for(var i = 0; i < joinedData.length; i++) {
 
        let joinObjId1 = joinedData[i][1];
        let joinObjId2 = joinedData[i][2];
        let joinType = joinedData[i][3];
        let joinArrow = joinedData[i][4];
        let points = [];
        
        scatterGroup.traverseVisible(function(obj){
            
            if ( obj.name == 'data' ) { 
                const rowNo = obj.userData.OriginalRowNo;
                if ( rowNo == joinObjId1 || rowNo == joinObjId2 ) {  
    
                    const point = new THREE.Vector3();
                    points.push( obj.parent.getWorldPosition( point ) );
                }
            }
        });        
        
        
        if ( joinType == 0 ) {    
            line.geometry.setFromPoints(points);

        } else if ( joinType == 1 ) {
            let point = new THREE.Vector3();
    
            
            let vector_temp = point.lerpVectors( points[0], points[1], 0.5 );
            const randX = vector_temp.x + ( Math.random() * 2 ) - 1;
            const randY = vector_temp.y + ( Math.random() * 2 ) - 1;
            const randZ = vector_temp.z + ( Math.random() * 2 ) - 1;
            vector_temp.set(randX,randY,randZ);
            
            points.splice(1, 0, vector_temp );

            line.geometry.setFromPoints( new THREE.CatmullRomCurve3 ( points ).getPoints( 20 ) ); 

        }
        
        
        line.name = 'join'
        joinsGroup.add(line); 
    }

}


function removeAllJoins() {
    joinsGroup.remove(...joinsGroup.children);    
}

function joinSelectedScatters() {

    const joinType = document.getElementById('joinType').value;
    const joinArrow = document.getElementById('joinArrow').value;

    let points = [];
    let userDataTemp = [];
    
    scatterGroup.traverseVisible(function(obj){
        if(obj.name == 'Wireframe' ){  

            const point = new THREE.Vector3();
            points.push(obj.parent.getWorldPosition(point));
            userDataTemp.push(obj.parent.userData.OriginalRowNo)
        }
    }); 

    joinedData.push(userDataTemp[0], userDataTemp[1], joinType, joinArrow);

    const line = new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial()
    );
    
    const selectedColor = document.getElementById('selectedColor').value;
    line.material.color.set( selectedColor );
    
    if ( joinType == 0 ) {    
        
        line.geometry.setFromPoints(points);
        unselectAllScatters();
        
    } else if ( joinType == 1 ) {
        
        let point = new THREE.Vector3();

        
        let vector_temp = point.lerpVectors( points[0], points[1], 0.5 );
        const randX = vector_temp.x + ( Math.random() * 2 ) - 1;
        const randY = vector_temp.y + ( Math.random() * 2 ) - 1;
        const randZ = vector_temp.z + ( Math.random() * 2 ) - 1;
        vector_temp.set(randX,randY,randZ);
        
        points.splice(1, 0, vector_temp );
        line.geometry.setFromPoints( new THREE.CatmullRomCurve3 ( points ).getPoints( 20 ) ); 
    }
    
    
    line.name = 'join'
    joinsGroup.add(line); 
    
}

function onWindowResize() {

	camera.aspect = ( window.innerWidth / window.innerHeight );
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
    DrawLabelObjects();
    DrawValues();
    
    if( transformedData != undefined && transformedData.length > 0 ) { 
        
        CreateScatterObjects(transformedData);
        PlotScatterObjects(transformedData);
        
    };
    
    showHideScatterObjects();
    renderer.setClearColor(screenColor.value, 1 );
    
    settingsLoader=false;
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

function RemoveValues() {
    scatterLabelGroup.remove(...scatterLabelGroup.children);
}


function DrawValues() {
   RemoveValues(); 
   
   if ( document.getElementById('idvalue').checked ) {
       
        const colorId = document.getElementById('colorId').value;
        
        const labelFontSize = document.getElementById('labelFontSize').value;
        var fontSize;
        if (labelFontSize==1) {
            fontSize=FontSizeSmall;
        }
        if (labelFontSize==2) {
            fontSize=FontSizeMedium;
        }
        if (labelFontSize==3) {
            fontSize=FontSizeLarge;
        }
        const labelRotation = document.getElementById('labelRotation').value;
        var xr=0, yr=0,zr=0;
        if (labelRotation=='y') {
            zr=1;
        }
        if (labelRotation=='z') {
            yr=-1;
        }
        
        
        const labelPosition = document.getElementById('labelPosition').value;
        var OffsetX=0,OffsetY=0,OffsetZ=0,offsetDistance=0;
        
        const labelContent = document.getElementById('labelContent').value;
        var plotValue;  
        
        scatterGroup.traverse( function(child) {
    
            if (child instanceof THREE.Mesh && child.visible==true && child.name == 'data') {
                
                offsetDistance=child.scale.x*1+fontSize/2;
                
                if (labelPosition==2) {
                    OffsetY=offsetDistance;
                }    
                if (labelPosition==3) {
                    OffsetY=-offsetDistance;
                }    
                if (labelPosition==4) {
                    OffsetX=offsetDistance;
                    OffsetY=offsetDistance;
                    OffsetZ=offsetDistance;
                }  
                
                
                if (labelContent==1) {
                    plotValue=child.userData['id'];
                }
                if (labelContent==2) {
                    plotValue=child.userData['x'];
                }
                if (labelContent==3) {
                    plotValue=child.userData['y'];
                }
                if (labelContent==4) {
                    plotValue=child.userData['z'];
                }
                if (labelContent==5) {
                    plotValue=child.userData['size'];
                }
                
                PlotText(plotValue,child.position.x+OffsetX,child.position.y+OffsetY,child.position.z+OffsetZ,xr,yr,zr,colorId,fontSize,scatterLabelGroup);
                
            }
        });
   }
   
}

function DrawHeaderFooterText() {
    
    HeaderFooterGroup.remove(...HeaderFooterGroup.children);
    
    
    const ShowHeaderText = document.getElementById('ShowHeaderText').checked;
    const headerText = document.getElementById('headerText').value;
    const headerTextFontSize = document.getElementById('headerTextFontSize').value;
    const headerColor = document.getElementById('headerColor').value;
    
    const ShowFooterText = document.getElementById('ShowFooterText').checked;
    const footerText = document.getElementById('footerText').value;
    const footerTextFontSize = document.getElementById('footerTextFontSize').value;
    const footerColor = document.getElementById('footerColor').value;
    
    
    var fontSizeHeader;
    if (headerTextFontSize==1) {
        fontSizeHeader=FontSizeSmall*5;
    }
    if (headerTextFontSize==2) {
        fontSizeHeader=FontSizeMedium*5;
    }
    if (headerTextFontSize==3) {
        fontSizeHeader=FontSizeLarge*5;
    }

    var fontSizeFooter;
    if (footerTextFontSize==1) {
        fontSizeFooter=FontSizeSmall*5;
    }
    if (footerTextFontSize==2) {
        fontSizeFooter=FontSizeMedium*5;
    }
    if (footerTextFontSize==3) {
        fontSizeFooter=FontSizeLarge*5;
    }
    
    if ( ShowHeaderText ) {
       PlotText(headerText,0,scaleMax+fontSizeHeader,0,0,0,0,headerColor,fontSizeHeader,HeaderFooterGroup);
    }
    
    if ( ShowFooterText ) {
       PlotText(footerText,0,scaleMin-fontSizeFooter,0,0,0,0,footerColor,fontSizeFooter,HeaderFooterGroup);
    }                
                
                 
}


function RemoveGridObjects() {
    gridGroup.remove(...gridGroup.children);
} 


function DrawGrid() {
   

    RemoveGridObjects();
    
    const gridx1 = document.getElementById("gridx1").checked;
    const gridx2 = document.getElementById("gridx2").checked;
    
    const gridy1 = document.getElementById("gridy1").checked;
    const gridy2 = document.getElementById("gridy2").checked;
    
    const gridz1 = document.getElementById("gridz1").checked;
    const gridz2 = document.getElementById("gridz2").checked;
    
    const colorGridx = document.getElementById("colorGridx").value;
    const colorGridy = document.getElementById("colorGridy").value;
    const colorGridz = document.getElementById("colorGridz").value;
    
    
    if (gridx1) {
		PlotGrid('Red (X1)'  ,(scaleMin+scaleMax)/2,scaleMin,(scaleMin+scaleMax)/2,0,0,0,colorGridx,scaleMax-scaleMin,noOfGrids);
    }

    if (gridx2) {
		PlotGrid('Red (X2)'  ,(scaleMin+scaleMax)/2,scaleMax,(scaleMin+scaleMax)/2,0,0,0,colorGridx,scaleMax-scaleMin,noOfGrids);
    }
    
    if (gridy1) {
		PlotGrid('Green (Y1)',(scaleMin+scaleMax)/2,(scaleMin+scaleMax)/2,scaleMin,1,0,0,colorGridy,scaleMax-scaleMin,noOfGrids);
    }

    if (gridy2) {
		PlotGrid('Green (Y2)',(scaleMin+scaleMax)/2,(scaleMin+scaleMax)/2,scaleMax,1,0,0,colorGridy,scaleMax-scaleMin,noOfGrids);
    }
    
    if (gridz1) {
		PlotGrid('Blue (Z1)' ,scaleMin,(scaleMin+scaleMax)/2,(scaleMin+scaleMax)/2,1,0,1,colorGridz,scaleMax-scaleMin,noOfGrids);
    }
    if (gridz2) {
		PlotGrid('Blue (Z2)' ,scaleMax,(scaleMin+scaleMax)/2,(scaleMin+scaleMax)/2,1,0,1,colorGridz,scaleMax-scaleMin,noOfGrids);
    }   
}

function RemoveScatterObjects() {
    scatterGroup.remove(...scatterGroup.children);
}

function ChangeScatterMaterial() {
    const tranShape = document.getElementById('tranShape').checked;
    
    for(let i = 0; i < materialCol.length; i++){
        if ( tranShape ) {
            materialCol[i].opacity = 0.5;
            materialCol[i].transparent = true;
        } else {
            materialCol[i].opacity = 1;
            materialCol[i].transparent = false;       
        }
    }
}

function PlotScatterObjects(data) {


    scatterGroup.traverse(function(obj){

        if( obj.name == 'data' ) {
            
            obj.visible = obj.userData.visible;
    		obj.position.x = obj.userData.xPlot;
    		obj.position.y = obj.userData.yPlot;
    		obj.position.z = obj.userData.zPlot;            
            obj.scale.setScalar ( Number( obj.userData.sizePlot ) );
     
        }
        
    });
}




function CreateScatterObjects(data) {
    
    RemoveScatterObjects();
    
    const shapeColor = document.getElementById('shapeColor').value;
    const tranShape = document.getElementById('tranShape').checked;
    

    const geometry = [
    	new THREE.BoxBufferGeometry( 1, 1, 1 ),
    	new THREE.ConeBufferGeometry( 1, 1, 16 ),
    	new THREE.CylinderBufferGeometry( 1, 1, 1, 16 ),
    	new THREE.IcosahedronBufferGeometry( 1, 2 ),
    	new THREE.TorusBufferGeometry( 0.8, 0.2, 16, 8 )
    ];
    
	const material = new THREE.MeshLambertMaterial( {
    } ); 

    if ( tranShape ) {
        
        material.opacity = 0.5;
        material.transparent = true;
        
    }    

    if(uniqueColors != undefined) {
 
        for(let i = 0; i < uniqueColors.length; i++){
            
            materialCol[i] = material.clone();
            
            if(uniqueColors[i]  != undefined) {
                
                materialCol[i].color.set(uniqueColors[i]);
                
            } else {
                
                materialCol[i].color.set(shapeColor); 
                
            }
        }   
        
    } else {

        materialCol[0] = material.clone();
        materialCol[0].color.set(shapeColor); 
        
    }

    let colorId ;
    const maxloop=Math.min(data.length,100000);
    let shape, color,scale;
    
    for(let i = 0; i < maxloop; i++){
        
    	if ( data[i]['id'] != "" ) {
    
            shape = 3;
            colorId = 0;
            scale  = 1;
            
            if( data[i]['shape'] != undefined && data[i]['shape'] != '' ) {
                
              shape = Number( data[i]['shape'] );  
              
            }
            
            if(data[i]['colorId'] != undefined && data[i]['colorId'] != '' && !isNaN ( data[i]['colorId'] ) ) {
                colorId=data[i]['colorId'];
            }

    		const object = new THREE.Mesh( geometry [shape], materialCol [colorId] );
    		
            object.name = 'data';
            object.userData = data[i];
            

            

    		scatterGroup.add( object );
    		
        }
    }
    
}

function showHideScatterObjects() {
    
    const plotShape = document.getElementById('plotShape').checked;
    
    if ( plotShape ) {
        
        scatterGroup.visible = true;
        
    } else {
        scatterGroup.visible = false;
    }
    
    
                
}

function PlotGrid(name,x,y,z,rx,ry,rz,color,size,segments) {
    
	const gridHelper = new THREE.GridHelper( size, segments,new THREE.Color( color ),new THREE.Color( color ));
	gridHelper.material.opacity = 0.45;
    gridHelper.material.transparent = true;
	gridHelper.position.set (x,y,z);
	gridHelper.rotation.x = - Math.PI / 2*rx;
	gridHelper.rotation.y = - Math.PI / 2*ry;
	gridHelper.rotation.z = - Math.PI / 2*rz;
	gridHelper.name = name;
	gridGroup.add( gridHelper );
	
}

function PlotText(text,x,y,z,rx,ry,rz,color,size,group){
    var loader = new THREE.FontLoader();
    loader.load( './fonts/helvetiker_regular.typeface.json', function ( font ) {
        var geometry = new THREE.TextBufferGeometry( text+'', {
            font: font,
            size: size,
            height: 0,
            curveSegments: 2
        } );
        geometry.center();

        var material = new THREE.MeshStandardMaterial(
            { color: color}
        );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.set(x,y,z);
        //mesh.lookAt(0,0,0);
        mesh.rotation.x = - Math.PI / 2*rx;
        mesh.rotation.y = - Math.PI / 2*ry;
        mesh.rotation.z = - Math.PI / 2*rz;
        
        group.add( mesh );	
    } );
}



function processData(csv){
    const readData = csvToArray(csv);
    for (var i = 0; i < readData.length; i++) {
    if (readData[i].id == "")
        readData.splice(i--, 1);
    } 

	document.getElementById("filedataQty").innerHTML = "<li>Number of rows:" + readData.length + "</li>"; 
	
	verifyData(readData);
}

function loadHandler(event) {
	var csv = event.target.result;
	processData(csv);   
	document.getElementById("fileStatus1").innerHTML = "<li>File was sucessfully opened</li>"; 
}

function errorHandler(evt) {
	if(evt.target.error.name == "NotReadableError") {
        document.getElementById("fileStatus1").innerHTML = "<li>Error. File was not sucessfully opened!</li>"; 
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



function RemoveLabelObjects() {
    labelGroup.remove(...labelGroup.children);
}  

function DrawLabelObjects(data) {
    RemoveLabelObjects();
    const yeslabelsx1 = document.getElementById('yeslabelsx1').checked;
    const yeslabelsx2 = document.getElementById('yeslabelsx2').checked;
    const yeslabelsy1 = document.getElementById('yeslabelsy1').checked;
    const yeslabelsy2 = document.getElementById('yeslabelsy2').checked;
    const yeslabelsz1 = document.getElementById('yeslabelsz1').checked;
    const yeslabelsz2 = document.getElementById('yeslabelsz2').checked;

    const xaxisLabel = (document.getElementById('xaxis').value=="") ? "X-axis" : document.getElementById('xaxis').value;
    const yaxisLabel = (document.getElementById('yaxis').value=="") ? "Y-axis" : document.getElementById('yaxis').value;
    const zaxisLabel = (document.getElementById('zaxis').value=="") ? "Z-axis" : document.getElementById('zaxis').value;
    const labelsFontSize = document.getElementById("labelsFontSize").value;
    
    const colorGridx = document.getElementById("colorGridx").value;
    const colorGridy = document.getElementById("colorGridy").value;
    const colorGridz = document.getElementById("colorGridz").value;

    const valuesx1 = document.getElementById('valuesx1').checked;
    const valuesx2 = document.getElementById('valuesx2').checked;
    const valuesy1 = document.getElementById('valuesy1').checked;
    const valuesy2 = document.getElementById('valuesy2').checked;
    const valuesz1 = document.getElementById('valuesz1').checked;
    const valuesz2 = document.getElementById('valuesz2').checked;
    const axisValuesFontSize = document.getElementById('axisValuesFontSize').value;
    
    const axisXdecimals = document.getElementById("axisXdecimals").value;
    const axisYdecimals = document.getElementById("axisYdecimals").value;
    const axisZdecimals = document.getElementById("axisZdecimals").value;
    
    var fontSizeLabels;
    if (labelsFontSize==1) {
        fontSizeLabels=FontSizeSmall;
    }
    if (labelsFontSize==2) {
        fontSizeLabels=FontSizeMedium;
    }
    if (labelsFontSize==3) {
        fontSizeLabels=FontSizeLarge;
    }    

    var fontSizeAxisValues;
    if (axisValuesFontSize==1) {
        fontSizeAxisValues=FontSizeSmall;
    }
    if (axisValuesFontSize==2) {
        fontSizeAxisValues=FontSizeMedium;
    }
    if (axisValuesFontSize==3) {
        fontSizeAxisValues=FontSizeLarge;
    }      
    
    
	if (yeslabelsx1) {
		PlotText(xaxisLabel,(scaleMin+scaleMax)/2,scaleMin-2,scaleMax,0,0,0,colorGridx,fontSizeLabels,labelGroup);// x1
	}
	
	if (yeslabelsx2) {
		PlotText(xaxisLabel,(scaleMin+scaleMax)/2,scaleMax+1,scaleMin-2,1,0,2,colorGridx,fontSizeLabels,labelGroup);// x2
	}
	
	if (yeslabelsy1) {
		PlotText(yaxisLabel,scaleMin-2,(scaleMin+scaleMax)/2,scaleMax,0,0,1,colorGridy,fontSizeLabels,labelGroup);// y1
	}
	
	if (yeslabelsy2) {
		PlotText(yaxisLabel,scaleMax,(scaleMin+scaleMax)/2,scaleMin-2,-1,-1,0,colorGridy,fontSizeLabels,labelGroup);// y2
	}
	
	if (yeslabelsz1) {
	    PlotText(zaxisLabel,scaleMax,scaleMin-2,(scaleMin+scaleMax)/2,0,-1,0,colorGridz,fontSizeLabels,labelGroup);// z1
	}
	
	if (yeslabelsz2) {
		PlotText(zaxisLabel,scaleMin-2,scaleMax,(scaleMin+scaleMax)/2,1,0,1,colorGridz,fontSizeLabels,labelGroup);// z2
	}

    if (valuesx1) {
        
		for (var i = 0; i < 11; i++) { 
		    
		   let PlotValue = Math.round(axisXdecimals * ( Number.EPSILON + minX +  (i * ( maxX - minX ) / 10 ) ) )  / axisXdecimals;
		   let PlotPosition = Math.round(axisXdecimals * ( Number.EPSILON + scaleMin +  (i * ( scaleMax - scaleMin ) / 10 ) ) )  / axisXdecimals;
		   
		   PlotText( PlotValue,PlotPosition,scaleMin-1,scaleMax,0,0,0,colorGridx,fontSizeAxisValues,labelGroup);
		   
		}
		    
		    
    }
    
    if (valuesx2) {

		for (var i = 0; i < 11; i++) {
		    
		   let PlotValue = Math.round(axisXdecimals * ( Number.EPSILON + minX +  (i * ( maxX - minX ) / 10 ) ) )  / axisXdecimals;
		   let PlotPosition = Math.round(axisXdecimals * ( Number.EPSILON + scaleMin +  (i * ( scaleMax - scaleMin ) / 10 ) ) )  / axisXdecimals;
		   
		   PlotText( PlotValue,PlotPosition,scaleMax,scaleMin-1,0,0,2,colorGridx,fontSizeAxisValues,labelGroup);
		   
		}
    }
    
    if (valuesy1) {

		for (var i = 0; i < 11; i++) {
		    
		   let PlotValue = Math.round(axisYdecimals * ( Number.EPSILON + minY +  (i * ( maxY - minY ) / 10 ) ) )  / axisYdecimals;
		   let PlotPosition = Math.round(axisYdecimals * ( Number.EPSILON + scaleMin +  (i * ( scaleMax - scaleMin ) / 10 ) ) )  / axisYdecimals;
		   
		   PlotText( PlotValue,scaleMin-1, PlotPosition,scaleMax,0,0,1,colorGridy,fontSizeAxisValues,labelGroup);
		   
		}


    }
    
    if (valuesy2) {

		for (var i = 0; i < 11; i++) {
		    
		   let PlotValue = Math.round(axisYdecimals * ( Number.EPSILON + minY +  (i * ( maxY - minY ) / 10 ) ) )  / axisYdecimals;
		   let PlotPosition = Math.round(axisYdecimals * ( Number.EPSILON + scaleMin +  (i * ( scaleMax - scaleMin ) / 10 ) ) )  / axisYdecimals;
		   
		   PlotText( PlotValue,scaleMax, PlotPosition,scaleMin-1,-1,-1,0,colorGridy,fontSizeAxisValues,labelGroup);
		   
		}


    }

    if (valuesz1) {    
        
		for (var i = 0; i < 11; i++) {
		    
		   let PlotValue = Math.round(axisZdecimals * ( Number.EPSILON + minZ +  (i * ( maxZ - minZ ) / 10 ) ) )  / axisZdecimals;
		   let PlotPosition = Math.round(axisZdecimals * ( Number.EPSILON + scaleMin +  (i * ( scaleMax - scaleMin ) / 10 ) ) )  / axisZdecimals;
		   
		   PlotText( PlotValue,scaleMax,scaleMin-1, PlotPosition,0,-1,0,colorGridz,fontSizeAxisValues,labelGroup);
		   
		}


	}
	
    if (valuesz2) {

		for (var i = 0; i < 11; i++) {
		    
		   let PlotValue = Math.round(axisZdecimals * ( Number.EPSILON + minZ +  (i * ( maxZ - minZ ) / 10 ) ) )  / axisZdecimals;
		   let PlotPosition = Math.round(axisZdecimals * ( Number.EPSILON + scaleMin +  (i * ( scaleMax - scaleMin ) / 10 ) ) )  / axisZdecimals;
		   
		   PlotText( PlotValue,scaleMin-1,scaleMax, PlotPosition,1,0,1,colorGridz,fontSizeAxisValues,labelGroup);
		   
		}

    }
    
 
 
    

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
    
    for (var i = 0; i < data.length; i++) {
        if(data[i].id == undefined) { 
            document.getElementById("fileStatus3").innerHTML = "<li>File process error: Id column missing values.</li>"; 
            hasError=true; 
            break; 
        };
    }

    for (var i = 0; i < data.length; i++) {
        if(data[i].x == undefined || data[i].y == undefined || data[i].z == undefined) { 
            document.getElementById("fileStatus4").innerHTML = "<li>Data error! Columns x,y and/or z is missing values.</li>"; 
            hasError=true; 
            break; 
        };
    }

    if( !hasError ) {
        
        for (var i = 0; i < data.length; i++) {
            if(data[i].shape == undefined ) {
        	    document.getElementById("fileStatus5").innerHTML = "<li>Shapes are missing: Default shape (sphere) is used.</li>"; 
        	    break; 
            }
        }
        
        for (var i = 0; i < data.length; i++) {
            if( data[i].size == undefined ) {
        	    document.getElementById("fileStatus6").innerHTML = "<li>Size are missing: Default size is used.</li>"; 
        	    break; 
            }
        }
        
        for (var i = 0; i < data.length; i++) {
            if( data[i].color == undefined ) {
        	    document.getElementById("fileStatus7").innerHTML = "<li>Colors are missing: Default color is used.</li>"; 
        	    break; 
            }
        }
        
        TransformData(data);
        
        
        FindUniqueCombinations(data);
        DrawLabelObjects(data);   
        CreateScatterObjects(data);
        PlotScatterObjects(data);
        
        if ( data.length > 3000  && document.getElementById('idvalue').checked ) {
            document.getElementById("fileStatus7").innerHTML = "<li>This data has many data points -> plot data values at your own risk!</li>"; 
            document.getElementById('idvalue').checked = false;
        }
        DrawValues();
        transformedData = data;
        
        if( document.getElementById( 'gltfFileName' ).value == '' ) {
            
            document.getElementById( 'gltfFileName' ).value = importFileName;
        }


        if( document.getElementById( 'saveSettingsFileName' ).value == '' ) {
            
            document.getElementById( 'saveSettingsFileName' ).value = importFileName + '.settings';
        }
        
        document.getElementById("importData").style.display = "none";
        
    } else {
        
        document.getElementById("fileStatus5").innerHTML = "<li>File could not be read.</li>"; 

    }
}
function DefineMinMax (data) {

    maxX = Math.ceil  ( 100 * ( Number.EPSILON + Math.max.apply( null, data.map( function( item ) { return item.x; } ) ) ) ) / 100;
    minX = Math.floor  ( 100 * ( Number.EPSILON + Math.min.apply( null, data.map( function( item ) { return item.x; } ) ) ) ) / 100;
    maxY = Math.ceil  ( 100 * ( Number.EPSILON + Math.max.apply( null, data.map( function( item ) { return item.y; } ) ) ) ) / 100;
    minY = Math.floor  ( 100 * ( Number.EPSILON + Math.min.apply( null, data.map( function( item ) { return item.y; } ) ) ) ) / 100;
    maxZ = Math.ceil  ( 100 * ( Number.EPSILON + Math.max.apply( null, data.map( function( item ) { return item.z; } ) ) ) ) / 100;
    minZ = Math.floor  ( 100 * ( Number.EPSILON + Math.min.apply( null, data.map( function( item ) { return item.z; } ) ) ) ) / 100;
    maxSize = Math.ceil  ( 100 * ( Number.EPSILON + Math.max.apply( null, data.map( function( item ) { return item.sizeTemp; } ) ) ) ) / 100;
    minSize = Math.floor  ( 100 * ( Number.EPSILON + Math.min.apply( null, data.map( function( item ) { return item.sizeTemp; } ) ) ) ) / 100;    
}

function DefineDefaults (data) {
    
    const shapeColor = document.getElementById('shapeColor').value;
    
    for (var i = 0; i < data.length; i++) {
        
        data[i].OriginalRowNo = i+1;
        data[i].visible = true;
        if ( data[i].shape == undefined || data[i].shape == '') { data[i].shape = 3 };
        if ( data[i].size == undefined || data[i].size == '') { data[i].size = 1 };
        if ( data[i].color == undefined || data[i].color == '') { data[i].color = shapeColor; } else if ( data[i].color.charAt(0) != '#' ) { data[i].color = '#' + data[i].color; }

    }
}

function DefineSizeCalculation(data) {
    
    const sizeCalculation = document.getElementById('sizeCalculation').value;
    
    if ( sizeCalculation == 3 ) {
        data.forEach(p => p.sizeTemp = Math.pow(p.size,3) );
    } else if ( sizeCalculation == 2 ) {
        data.forEach(p => p.sizeTemp = Math.pow(p.size,2) );
    } else {
        data.forEach(p => p.sizeTemp = Math.pow(p.size,1) );
    }    
}

function Normalize (data) {
    
    const normalize = document.getElementById('normalize').checked;
    
    if ( normalize ) {
        if (minX!=maxX) {
            data.forEach(p => p.xPlot    = scaleMin  + (((p.x-minX)*(scaleMax-scaleMin))/(maxX-minX)));
        } else {
            data.forEach(p => p.xPlot    = 0);
        }
        
        if (minY!=maxY) {
            data.forEach(p => p.yPlot    = scaleMin  + (((p.y-minY)*(scaleMax-scaleMin))/(maxY-minY)));
        } else {
            data.forEach(p => p.yPlot    = 0);
        }
        
        if (minZ!=maxZ) {
            data.forEach(p => p.zPlot    = scaleMin  + (((p.z-minZ)*(scaleMax-scaleMin))/(maxZ-minZ)));
        } else {
            data.forEach(p => p.zPlot    = 0);
        }   
        if (minSize!=maxSize) {
            data.forEach(p => p.sizePlot = scaleSizeMin + (((p.sizeTemp-minSize)*(scaleSizeMax-scaleSizeMin))/(maxSize-minSize)));
        } else {
            data.forEach(p => p.sizePlot    = 1);
        } 
       
    } else {
        data.forEach(p => p.xPlot    = p.x);
        data.forEach(p => p.yPlot    = p.y);
        data.forEach(p => p.zPlot    = p.z);
        data.forEach(p => p.sizePlot = p.size);
    }
}

function TransformData(data) {

    DefineDefaults(data);
    DefineSizeCalculation(data);
    DefineMinMax(data);
    Normalize(data);
    
}

function FindUniqueCombinations(data) {
    uniqueShapes = [ ... new Set(data.map((o) => o.shape))];
    uniqueColors = [ ... new Set(data.map((o) => o.color))];
    uniqueSets = data
        .map(f => `${f.shape} ${f.color}`)
        .filter((f, i, a) => a.indexOf(f) === i); 

    document.getElementById("fileStatus8").innerHTML = "<li>Number of shapes: " + uniqueShapes.length + "</li>"; 
    document.getElementById("fileStatus8").innerHTML = "<li>Number of colors: " + uniqueColors.length + "</li>"; 
    
    data.forEach(p => p.colorId =  uniqueColors.indexOf( p.color )); 

}
