
import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

import { DragControls} from 'three/addons/controls/DragControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

let wireframe, renderer, scene, camera, camera2, controls;
let wireframe1;
let matLine, matLineBasic, matLineDashed;
let stats;
let gui;
let pts;
// viewport
let insetWidth;
let insetHeight;
let wave;
let points;
let Lx=10;
let A=0.5;
let wl=1.7;
let phase=Math.PI/4;
let line,segment,sgeo;
let dotGeometry, dotMaterial,dot1,dot2;
let objects=[],p1p2=[];

init();
animate();

function grapdat(A,wl,Lx,phase){
  //console.log(A,wl,phase);

  //line.geometry.attributes.position.array=points;

  let DX=2*Lx/200,kn=2*Math.PI/wl;
  let x,y,z,index;
  x = -Lx, y = z = index = 0;

  for ( let i = 0, l = 200; i < l; i ++ ) {

    points[ index ++ ] = x;
    points[ index ++ ] = y;
    points[ index ++ ] = 0.0;

    x += DX;
    y = A*Math.cos(kn*x+phase);//( Math.random() - 0.5 ) * 30;
    //z = 0.0;

}

}

function init() {

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor( 0x000000, 0.0 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 0, 10 );

    camera2 = new THREE.PerspectiveCamera( 40, 1, 1, 1000 );
    camera2.position.copy( camera.position );



    //controls = new OrbitControls( camera, renderer.domElement );
    //controls.minDistance = 10;
    //controls.maxDistance = 500;

    dotGeometry = new THREE.BufferGeometry();
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
    dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: 0xff0000 });
    dot1 = new THREE.Points(dotGeometry, dotMaterial);
    dot2 = new THREE.Points(dotGeometry, dotMaterial);
    dot1.position.x=-1.0; dot1.position.y=A+1; dot1.position.z=0.0;
    dot2.position.x=1.0; dot2.position.y=A+1; dot2.position.z=0.0;
    scene.add(dot1);
    scene.add(dot2);
    objects.push(dot1);objects.push(dot2);



    matLine = new LineMaterial( {

      color: 0x4080ff,
      linewidth: 5, // in pixels
      //resolution:  // to be set by renderer, eventually
      dashed: false

    } );

    matLineBasic = new THREE.LineBasicMaterial( { color: 0x4080ff } );
    matLineDashed = new THREE.LineDashedMaterial( { scale: 2, dashSize: 1, gapSize: 1 } );

    scene.add( new THREE.AxesHelper( 20 ) );

    //console.log(scene);
    //grapdat(A,wl,Lx,phase);
    const material = new THREE.LineBasicMaterial( { color: 0x4080ff, linewidth:3 } );
    //wave = new THREE.BufferGeometry().setFromPoints( points );
    points = new Float32Array( 200 * 3 );
    grapdat(A,wl,Lx,phase);

    wave = new THREE.BufferGeometry();//.setFromPoints( points );
    wave.setAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );
    line = new THREE.Line( wave, material);
    line.geometry.attributes.position.needsUpdate = true;
    points = line.geometry.attributes.position.array;
    grapdat(A,wl,Lx,phase);
    scene.add( line );


    p1p2=new Float32Array(2*3);
    p1p2[0]=dot1.position.x;p1p2[1]=dot1.position.y;p1p2[2]=dot1.position.z;
    p1p2[3]=dot2.position.x;p1p2[4]=dot2.position.y;p1p2[5]=dot2.position.z;


    sgeo= new THREE.BufferGeometry();//.setFromPoints(p1p2);
    sgeo.setAttribute('position',  new THREE.BufferAttribute( p1p2, 3 )  );
    segment=new THREE.Line(sgeo,material);
    segment.geometry.attributes.position.needsUpdate = true;
    //p1p2=segment.geometry.attributes.position.array;
    scene.add(segment);

    controls = new DragControls( [ ... objects ], camera, renderer.domElement );
		controls.addEventListener( 'dragend', cucu );
    controls.addEventListener( 'dragstart', coco );

    window.addEventListener( 'resize', onWindowResize );
    onWindowResize();

    stats = new Stats();
    document.body.appendChild( stats.dom );

    initGui();

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    insetWidth = window.innerHeight / 4; // square
    insetHeight = window.innerHeight / 4;

    camera2.aspect = insetWidth / insetHeight;
    camera2.updateProjectionMatrix();

  }

  function animate() {

    requestAnimationFrame( animate );

    stats.update();

    // main scene

    renderer.setClearColor( 0x000000, 0 );

    renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );

    // renderer will set this eventually
    matLine.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport

    renderer.render( scene, camera );

    // inset scene

    renderer.setClearColor( 0x222222, 1 );

    renderer.clearDepth(); // important!

    renderer.setScissorTest( true );

    renderer.setScissor( 20, 20, insetWidth, insetHeight );

    renderer.setViewport( 20, 20, insetWidth, insetHeight );

    camera2.position.copy( camera.position );
    camera2.quaternion.copy( camera.quaternion );

    // renderer will set this eventually
    matLine.resolution.set( insetWidth, insetHeight ); // resolution of the inset viewport

    renderer.render( scene, camera2 );

    renderer.setScissorTest( false );

  }

////////////
function cucu( event ){
  //console.log(dot1.position);

  p1p2[0]=dot1.position.x;p1p2[1]=dot1.position.y;p1p2[2]=dot1.position.z;
  p1p2[3]=dot2.position.x;p1p2[4]=dot2.position.y;p1p2[5]=dot2.position.z;
  segment.geometry.attributes.position.array=p1p2; 
  segment.geometry.attributes.position.needsUpdate = true;
  segment.visible=true;
}
//////////////////
function coco(event){
  segment.visible=false;
}
///////////
function initGui() {

  gui = new GUI();

  const param = {
      'line type': 0,
      'width (px)': 5,
      'dashed': false,
      'dash scale': 1,
      'dash / gap': 1,
      'Amplitude':0.5,
      'Wavelength':1.7,
      'Phase':Math.PI/4

  };


    gui.add( param, 'line type', { 'LineGeometry': 0, 'gl.LINE': 1 } ).onChange( function ( val ) {

      switch ( val ) {

        case 0:
          wireframe.visible = true;

          wireframe1.visible = false;

          break;

        case 1:
          wireframe.visible = false;

          wireframe1.visible = true;

          break;

      }

    } );

    gui.add( param, 'width (px)', 1, 10 ).onChange( function ( val ) {

      matLine.linewidth = val;

    } );

    gui.add( param, 'dashed' ).onChange( function ( val ) {

      matLine.dashed = val;

      // dashed is implemented as a defines -- not as a uniform. this could be changed.
      // ... or THREE.LineDashedMaterial could be implemented as a separate material
      // temporary hack - renderer should do this eventually
      if ( val ) matLine.defines.USE_DASH = ""; else delete matLine.defines.USE_DASH;
      matLine.needsUpdate = true;

      wireframe1.material = val ? matLineDashed : matLineBasic;

    } );

    gui.add( param, 'dash scale', 0.5, 1, 0.1 ).onChange( function ( val ) {

      matLine.dashScale = val;
      matLineDashed.scale = val;

    } );

    gui.add( param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 } ).onChange( function ( val ) {

      switch ( val ) {

        case 0:
          matLine.dashSize = 2;
          matLine.gapSize = 1;

          matLineDashed.dashSize = 2;
          matLineDashed.gapSize = 1;

          break;

        case 1:
          matLine.dashSize = 1;
          matLine.gapSize = 1;

          matLineDashed.dashSize = 1;
          matLineDashed.gapSize = 1;

          break;

        case 2:
          matLine.dashSize = 1;
          matLine.gapSize = 2;

          matLineDashed.dashSize = 1;
          matLineDashed.gapSize = 2;

          break;

      }

    } );

    gui.add( param, 'Amplitude', 0.0, 1, 0.01 ).onChange( function ( val ) {

      A = val;
      grapdat(A,wl,Lx,phase);
      //console.log(scene);
      line.geometry.attributes.position.array=points;
      line.geometry.attributes.position.needsUpdate = true;
      //line.visible=false;
      //line.visible=true;

      //line.geometry.attributes.position.array=points;
      //animate();

      //wave.setPositions(points);

    } );
    gui.add( param, 'Wavelength', 0.1, 5, 0.1 ).onChange( function ( val ) {

      wl = val;
      grapdat(A,wl,Lx,phase);
      grapdat(A,wl,Lx,phase);
      //console.log(scene);
      line.geometry.attributes.position.array=points;
      line.geometry.attributes.position.needsUpdate = true;


    } );
    gui.add( param, 'Phase', 0.0, 2*Math.PI, 0.01 ).onChange( function ( val ) {
      phase = val;
      grapdat(A,wl,Lx,phase);
      grapdat(A,wl,Lx,phase);
      //console.log(scene);
      line.geometry.attributes.position.array=points;
      line.geometry.attributes.position.needsUpdate = true;

    } );

  }
