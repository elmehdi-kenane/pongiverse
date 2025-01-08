import * as THREE from 'three';
import { useState } from 'react';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Flow } from 'three/addons/modifiers/CurveModifier.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import { useEffect, useRef } from "react";

function MyThree() {
    const refContainer = useRef(null);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth > 1024 ? 500 : 250,
        height: window.innerWidth > 1024 ? 500 : 250
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth > 1024 ? 500 : 250,
                height: window.innerWidth > 1024 ? 500 : 250
            });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // SCENE
        var scene = new THREE.Scene();
        const width = dimensions.width;
        const height = dimensions.height;
        const fov = 75;
        const aspect = width / height;
        const near = 0.1;
        const far = 1000;
        var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.x = 0;
        camera.position.y = 10;
        camera.position.z = 20;
        var renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.setClearColor(0x000000, 0);
        refContainer.current && refContainer.current.appendChild(renderer.domElement);
        
        // PLAN
        const planWidthHeight = 18.5;
        const planeGeometry = new THREE.PlaneGeometry(planWidthHeight, planWidthHeight);
        const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x913dce, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2; // Rotate to lie flat on the ground
        plane.receiveShadow = true;
        scene.add(plane);
        
        const planeBoxGeometry = new THREE.BoxGeometry(planWidthHeight, 0.8, planWidthHeight);
        const planeBoxMaterial = new THREE.MeshPhongMaterial({ color: 0x913dce, side: THREE.DoubleSide});
        const planeBox = new THREE.Mesh(planeBoxGeometry, planeBoxMaterial);
        planeBox.position.y = -(0.8 / 2) - 0.01;
        planeBox.castShadow = false;
        planeBox.receiveShadow = false;
        scene.add(planeBox);

        // MOUSE-CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.update();
        
        // SPHERE
        const sphereRadius = 13.5;
        const sphereWidthHeightSegments = 20;
        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereWidthHeightSegments, sphereWidthHeightSegments);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        const sphereWireframe = new THREE.WireframeGeometry(sphereGeometry);
        const sphereWireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
        const sphereWireframeMesh = new THREE.LineSegments(sphereWireframe, sphereWireframeMaterial);
        scene.add(sphereWireframeMesh);

        // TABLE
        const tableWidth = 10;
        const tableHeight = 0.5;
        const tableDepth = 5;
        const tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth);
        const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x253122 });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = ((tableHeight / 2) + 0.001) + 2;
        table.castShadow = true;
        scene.add(table);

        // TABLE FACE
        const tableFaceHeight = 0.01;
        const tableFaceGeometry = new THREE.BoxGeometry(tableWidth, tableFaceHeight, tableDepth);
        const tableFaceMaterial = new THREE.MeshPhongMaterial({ color: 0x913dce });
        const tableFace = new THREE.Mesh(tableFaceGeometry, tableFaceMaterial);
        tableFace.receiveShadow = true;
        tableFace.position.y = ((tableFaceHeight / 2) + tableHeight + 0.001) + 2;
        scene.add(tableFace);

        // LIGHT
        const color = 0xffffff;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(10, 7, 5);
        light.castShadow = true;
        light.shadow.camera.left = -10;
        light.shadow.camera.right = 10;
        light.shadow.camera.top = 10;
        light.shadow.camera.bottom = -10;
        scene.add(light);

        // TABLE LEGS
        const legWidth = 0.25;
        const legHeight = table.position.y;
        const legDepth = 0.25;
        const legGeometry = new THREE.BoxGeometry(legWidth, legHeight, legDepth);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x253122 });
        const keepLegInside = 0.25;

        // FIRST LEG
        const firstLeg = new THREE.Mesh(legGeometry, legMaterial);
        firstLeg.position.set((tableWidth / 2) - keepLegInside, (legHeight / 2) + 0.001, (tableDepth / 2) - keepLegInside);
        firstLeg.castShadow = true;
        scene.add(firstLeg);
        // SECOND LEG
        const secondLeg = new THREE.Mesh(legGeometry, legMaterial);
        secondLeg.position.set(-((tableWidth / 2) - keepLegInside), (legHeight / 2) + 0.001, (tableDepth / 2) - keepLegInside);
        secondLeg.castShadow = true;
        scene.add(secondLeg);
        // THIRD LEG
        const thirdLeg = new THREE.Mesh(legGeometry, legMaterial);
        thirdLeg.position.set(((tableWidth / 2) - keepLegInside), (legHeight / 2) + 0.001, -((tableDepth / 2) - keepLegInside));
        thirdLeg.castShadow = true;
        scene.add(thirdLeg);
        // FOURTH LEG
        const fourthLeg = new THREE.Mesh(legGeometry, legMaterial);
        fourthLeg.position.set(-((tableWidth / 2) - keepLegInside), (legHeight / 2) + 0.001, -((tableDepth / 2) - keepLegInside));
        fourthLeg.castShadow = true;
        scene.add(fourthLeg);

        // NET POST
        const netPostWidth = 0.05;
        const netPostHeight = 0.5 + 0.25;
        const netPostDepth = 0.05;
        const netPostGeometry = new THREE.BoxGeometry(netPostWidth, netPostHeight, netPostDepth);
        const netPostMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const keepPostInside = 0.05;
        
        // FIRST NET POST
        const firstNetPost = new THREE.Mesh(netPostGeometry, netPostMaterial);
        firstNetPost.position.set(0, (netPostHeight / 2) + table.position.y, (tableDepth / 2) - keepPostInside);
        firstNetPost.castShadow = true;
        scene.add(firstNetPost);
        // SECOND NET POST
        const secondNetPost = new THREE.Mesh(netPostGeometry, netPostMaterial);
        secondNetPost.position.set(0, (netPostHeight / 2) + table.position.y, -(tableDepth / 2) + keepPostInside);
        secondNetPost.castShadow = true;
        scene.add(secondNetPost);
        
        // NET
        const netOffset = 0.1;
        const netWidth = tableDepth - netPostDepth - netOffset;
        const netDepth = 0.001;
        const netHeight = netPostHeight - netOffset - 0.2;
        const netGeometry = new THREE.BoxGeometry(netWidth, netHeight, netDepth);
        const netMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide});
        
        const net = new THREE.Mesh(netGeometry, netMaterial);
        net.position.y = (netHeight / 2) + table.position.y + netOffset + 0.2;
        net.rotation.y = Math.PI / 2;
        net.castShadow = true;
        scene.add(net);
        
        // LINES
        const rectangleWidth = 0.2;
        const rectangleHeight = 0.001;
        const shortRectangleGeometry = new THREE.BoxGeometry(rectangleWidth, rectangleHeight, tableDepth);
        const longRectangleGeometry = new THREE.BoxGeometry(rectangleWidth, rectangleHeight, tableWidth);
        const rectangleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

        const centerShortRectangle = new THREE.Mesh(shortRectangleGeometry, rectangleMaterial);
        centerShortRectangle.receiveShadow = true;
        centerShortRectangle.position.y = tableFace.position.y + 0.005;
        scene.add(centerShortRectangle);

        const firstBorderShortRectangle = new THREE.Mesh(shortRectangleGeometry, rectangleMaterial);
        firstBorderShortRectangle.receiveShadow = true;
        firstBorderShortRectangle.position.y = tableFace.position.y + 0.005;
        firstBorderShortRectangle.position.x = (tableWidth / 2) - (rectangleWidth / 2) ;
        scene.add(firstBorderShortRectangle);

        const secondBorderShortRectangle = new THREE.Mesh(shortRectangleGeometry, rectangleMaterial);
        secondBorderShortRectangle.receiveShadow = true;
        secondBorderShortRectangle.position.y = tableFace.position.y + 0.005;
        secondBorderShortRectangle.position.x = -((tableWidth / 2) - (rectangleWidth / 2));
        scene.add(secondBorderShortRectangle);
        
        const centerLongRectangle = new THREE.Mesh(longRectangleGeometry, rectangleMaterial);
        centerLongRectangle.receiveShadow = true;
        centerLongRectangle.position.y = tableFace.position.y + 0.005;
        centerLongRectangle.rotation.y = (Math.PI / 2);
        scene.add(centerLongRectangle);
        
        const firstBorderLongRectangle = new THREE.Mesh(longRectangleGeometry, rectangleMaterial);
        firstBorderLongRectangle.receiveShadow = true;
        firstBorderLongRectangle.position.y = tableFace.position.y + 0.005;
        firstBorderLongRectangle.rotation.y = (Math.PI / 2);
        firstBorderLongRectangle.position.z = (tableDepth / 2) - 0.1;
        scene.add(firstBorderLongRectangle);

        const secondBorderLongRectangle = new THREE.Mesh(longRectangleGeometry, rectangleMaterial);
        secondBorderLongRectangle.receiveShadow = true;
        secondBorderLongRectangle.position.y = tableFace.position.y + 0.005;
        secondBorderLongRectangle.rotation.y = (Math.PI / 2);
        secondBorderLongRectangle.position.z = -(tableDepth / 2) + 0.1;
        scene.add(secondBorderLongRectangle);

        // PADDLE
        const paddleTableSpacing = 2;

        // GEOMETRY MATERIAL USED
        // PADDLE-RECTANGLE
        const paddleRecWidth = 0.3;
        const paddleRecHeight = 1.5;
        const paddleRecDepth = 0.7;
        const paddleRecGeometry = new THREE.BoxGeometry(paddleRecWidth, paddleRecHeight, paddleRecDepth);
        const paddleRecMaterial = new THREE.MeshPhongMaterial({ color: 0xA76624 });

        // PADDLE-CIRCLE
        const paddleCircleRadius = 1.3;
        const paddleCircleHeight = 0.25;
        const paddleCircleRadialSegments = 40;
        const paddleCircleFromPlane = paddleRecHeight - 0.5;
        const paddleCircleGeometry = new THREE.CylinderGeometry(paddleCircleRadius, paddleCircleRadius, paddleCircleHeight, paddleCircleRadialSegments);
        const paddleCircleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });        
        
        // PADDLE-RECTANGLE-HELPER
        const paddleRecHelperWidth = paddleCircleHeight - 0.05;
        const paddleRecHelperHeight = 1.5;
        const paddleRecHelperDepth = 0.5;
        const paddleRecHelperGeometry = new THREE.BoxGeometry(paddleRecHelperWidth, paddleRecHelperHeight, paddleRecHelperDepth);
        const paddleRecHelperMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

        // FIRST-PADDLE
        const firstPaddle = new THREE.Group();

        const firstPaddleRec = new THREE.Mesh(paddleRecGeometry, paddleRecMaterial);
        firstPaddleRec.castShadow = true;
        firstPaddleRec.position.x = (paddleRecWidth / 2);
        firstPaddleRec.position.y = (paddleRecHeight / 2);
        firstPaddle.add(firstPaddleRec);

        const firstPaddleCircle = new THREE.Mesh(paddleCircleGeometry, paddleCircleMaterial);
        firstPaddleCircle.castShadow = true;
        firstPaddleCircle.position.x = (paddleCircleHeight / 2);
        firstPaddleCircle.rotation.x = Math.PI / 2;
        firstPaddleCircle.rotation.z = Math.PI / 2;
        firstPaddleCircle.position.y = paddleCircleRadius + paddleCircleFromPlane;
        firstPaddle.add(firstPaddleCircle);

        const firstPaddleFirstRecHelper = new THREE.Mesh(paddleRecHelperGeometry, paddleRecHelperMaterial);
        firstPaddleFirstRecHelper.castShadow = true;
        firstPaddleFirstRecHelper.position.x = (paddleRecWidth / 2);
        firstPaddleFirstRecHelper.position.y = (paddleRecHeight / 2) + 0.5;
        firstPaddleFirstRecHelper.position.z = 0.4;
        firstPaddleFirstRecHelper.rotation.x = Math.PI / 4;
        firstPaddle.add(firstPaddleFirstRecHelper);

        const firstPaddleSecondRecHelper = new THREE.Mesh(paddleRecHelperGeometry, paddleRecHelperMaterial);
        firstPaddleSecondRecHelper.castShadow = true;
        firstPaddleSecondRecHelper.position.x = (paddleRecWidth / 2);
        firstPaddleSecondRecHelper.position.y = (paddleRecHeight / 2) + 0.5;
        firstPaddleSecondRecHelper.position.z = -0.4;
        firstPaddleSecondRecHelper.rotation.x = -(Math.PI / 4);
        firstPaddle.add(firstPaddleSecondRecHelper);

        firstPaddle.position.x = paddleTableSpacing + (tableWidth / 2);
        firstPaddle.position.z = 1.5;

        scene.add(firstPaddle)

        // SECOND-PADDLE
        const secondPaddle = new THREE.Group();

        const secondPaddleRec = new THREE.Mesh(paddleRecGeometry, paddleRecMaterial);
        secondPaddleRec.castShadow = true;
        secondPaddleRec.position.x = (paddleRecWidth / 2);
        secondPaddleRec.position.y = (paddleRecHeight / 2);
        secondPaddle.add(secondPaddleRec);

        const secondPaddleCircle = new THREE.Mesh(paddleCircleGeometry, paddleCircleMaterial);
        secondPaddleCircle.castShadow = true;
        secondPaddleCircle.position.x = (paddleCircleHeight / 2);
        secondPaddleCircle.rotation.x = Math.PI / 2;
        secondPaddleCircle.rotation.z = Math.PI / 2;
        secondPaddleCircle.position.y = paddleCircleRadius + paddleCircleFromPlane;
        secondPaddle.add(secondPaddleCircle);

        const secondPaddleFirstRecHelper = new THREE.Mesh(paddleRecHelperGeometry, paddleRecHelperMaterial);
        secondPaddleFirstRecHelper.castShadow = true;
        secondPaddleFirstRecHelper.position.x = (paddleRecWidth / 2);
        secondPaddleFirstRecHelper.position.y = (paddleRecHeight / 2) + 0.5;
        secondPaddleFirstRecHelper.position.z = 0.4;
        secondPaddleFirstRecHelper.rotation.x = Math.PI / 4;
        secondPaddle.add(secondPaddleFirstRecHelper);

        const secondPaddleSecondRecHelper = new THREE.Mesh(paddleRecHelperGeometry, paddleRecHelperMaterial);
        secondPaddleSecondRecHelper.castShadow = true;
        secondPaddleSecondRecHelper.position.x = (paddleRecWidth / 2);
        secondPaddleSecondRecHelper.position.y = (paddleRecHeight / 2) + 0.5;
        secondPaddleSecondRecHelper.position.z = -0.4;
        secondPaddleSecondRecHelper.rotation.x = -(Math.PI / 4);
        secondPaddle.add(secondPaddleSecondRecHelper);

        secondPaddle.position.x = -(paddleTableSpacing + (tableWidth / 2));
        secondPaddle.position.z = -1.5;

        scene.add(secondPaddle)

        // BALL
        const ballRadius = 0.1;
        const ballWidthHeightSegments = 64;
        const ballGeometry = new THREE.SphereGeometry(ballRadius, ballWidthHeightSegments, ballWidthHeightSegments);
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        ball.castShadow = true;
        
        // CURVE-FLOW
        const ballStartX = 6;
        const ballStartZ = 1;
        const ballStartY = 0.5 + tableFace.position.y;
        const ballTopHeight = ballStartY + 0.4;
        const ballAtTable = ballRadius + tableFace.position.y;

        const curveHandles = [];
        const initialPoints = [
            { x: ballStartX + 0.4, y: ballStartY, z: ballStartZ },
            { x: ballStartX - 4, y: ballTopHeight, z: 0.5 },
            { x: -1, y: ballAtTable + 0.3, z: 0 },
            { x: -2.5, y: ballAtTable - 0.05, z: 0 },

            { x: -ballStartX, y: ballStartY, z: -ballStartZ },
            { x: -ballStartX + 4, y: ballTopHeight, z: -0.5 },
            { x: 1, y: ballAtTable + 0.3, z: 0 },
            { x: 2.5, y: ballAtTable - 0.05, z: 0 },
        ];

        const boxGeometry = new THREE.BoxGeometry((0.001), (0.001), (0.001));
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        for (const handlePos of initialPoints) {
            const handle = new THREE.Mesh(boxGeometry, boxMaterial);
            handle.position.copy(handlePos);
            curveHandles.push(handle);
            scene.add(handle);
        }

        const curve = new THREE.CatmullRomCurve3(
            curveHandles.map((handle) => handle.position)
        );
        curve.curveType = 'catmullrom';
        curve.tension = 0.5;
        curve.closed = true;

        let flow;
        flow = new Flow(ball);
        flow.object3D.castShadow = true;
        flow.updateCurve(0, curve);
        scene.add(flow.object3D);

        // HELPERS

        // CURVE-LINES
        // const lineDivisions = 50;
        // const points = curve.getPoints(lineDivisions);
        // const line = new THREE.LineLoop(
        //     new THREE.BufferGeometry().setFromPoints(points),
        //     new THREE.LineBasicMaterial({ color: 0x00ff00 })
        // );
        // scene.add(line);

        // SCENE-GRID
        // const gridHelper = new THREE.GridHelper(20);
        // scene.add(gridHelper);

        // CAMERA
        // scene.add(new THREE.CameraHelper(camera))
        
        // LIGHT
        // const lightHelper = new THREE.DirectionalLightHelper(light, 5);
        // scene.add(lightHelper);
        
        // SHADOW
        // const lightShadowCameraHelper = new THREE.CameraHelper(light.shadow.camera);
        // scene.add(lightShadowCameraHelper);

        // SCENE-AXES
        // const axesHelper = new THREE.AxesHelper(20);
        // axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff);
        // scene.add(axesHelper);

        var secondPaddleRotationEnd = false;
        var firstPaddleRotationEnd = false;
        const ballSpeed = 0.005;
        const paddleRotationSpeed = 0.01;
        const rotationAngle = (Math.PI / 8);
        function animate() {

            // sphere.rotation.y += 0.1;

            // FIRST-PADDLE-ANIMATION
            if (flow.uniforms.pathOffset.value >= 0.54 && flow.uniforms.pathOffset.value <= 0.74 && !firstPaddleRotationEnd && firstPaddle.rotation.z < rotationAngle) {
                firstPaddle.rotation.z += paddleRotationSpeed;
                firstPaddle.rotation.y -= paddleRotationSpeed;
                if (firstPaddle.rotation.z >= rotationAngle)
                    firstPaddleRotationEnd = true;
            }
            if (firstPaddleRotationEnd && firstPaddle.rotation.z > 0) {
                firstPaddle.rotation.z -= paddleRotationSpeed;
                firstPaddle.rotation.y += paddleRotationSpeed;
                if (firstPaddle.rotation.z <= 0)
                    firstPaddleRotationEnd = false;
            }
            
            // SECOND-PADDLE-ANIMATION
            if (!secondPaddleRotationEnd && secondPaddle.rotation.z > -rotationAngle) {
                secondPaddle.rotation.z -= paddleRotationSpeed;
                secondPaddle.rotation.y -= paddleRotationSpeed;
                if (secondPaddle.rotation.z <= -rotationAngle)
                    secondPaddleRotationEnd = true;
            }
            if (secondPaddleRotationEnd && secondPaddle.rotation.z < 0) {
                secondPaddle.rotation.z += paddleRotationSpeed;
                secondPaddle.rotation.y += paddleRotationSpeed;
            }

            flow.moveAlongCurve(ballSpeed);

            if (flow.uniforms.pathOffset.value >= 1) {
                secondPaddleRotationEnd = false;
                flow.uniforms.pathOffset.value = 0;
            }

            renderer.render(scene, camera);
            controls.update();
        }
        renderer.setAnimationLoop(animate);
        return () => {
            if (refContainer.current) {
                refContainer.current.removeChild(renderer.domElement);
            }
        };
    }, [dimensions]);
    return (
        <div ref={refContainer}></div>
    );
}

export default MyThree