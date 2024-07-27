import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ThreeJSComponent = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        let renderer, scene, camera;
        let spotLight;

        const init = () => {
            renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setAnimationLoop(animate);

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1;

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x191919);

            camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(7, 4, 1);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 2;
            controls.maxDistance = 7;
            controls.enablePan = false;
            controls.maxPolarAngle = Math.PI / 2;
            controls.target.set(0, 1, 0);
            controls.update();

            const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.15);
            scene.add(ambient);

            const loader = new THREE.TextureLoader().setPath('/textures/');
            const filenames = ['disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg'];
            const textures = { none: null };

            for (let i = 0; i < filenames.length; i++) {
                const filename = filenames[i];
                const texture = loader.load(filename);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.colorSpace = THREE.SRGBColorSpace;
                textures[filename] = texture;
            }

            spotLight = new THREE.SpotLight(0xff0000, 250);
            spotLight.position.set(2.5, 5, 2.5);
            spotLight.angle = Math.PI / 6;
            spotLight.penumbra = 1;
            spotLight.decay = 2;
            spotLight.distance = 20;
            spotLight.map = textures['disturb.jpg'];
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            spotLight.shadow.camera.near = 1;
            spotLight.shadow.camera.far = 10;
            spotLight.shadow.focus = 1;
            scene.add(spotLight);

            const geometry = new THREE.PlaneGeometry(200, 200);
            const material = new THREE.MeshLambertMaterial({ color: 0xbcbcbc });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, -1, 0);
            mesh.rotation.x = -Math.PI / 2;
            mesh.receiveShadow = true;
            scene.add(mesh);

            new PLYLoader().load('/models/Lucy100k.ply', (geometry) => {
                geometry.scale(0.0024, 0.0024, 0.0024);
                geometry.computeVertexNormals();

                const material = new THREE.MeshLambertMaterial();
                const mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.y = -Math.PI / 2;
                mesh.position.y = 0.8;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                scene.add(mesh);
            });

            window.addEventListener('resize', onWindowResize);
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const animate = () => {
            const time = performance.now() / 3000;
            spotLight.position.x = Math.cos(time) * 2.5;
            spotLight.position.z = Math.sin(time) * 2.5;
            renderer.render(scene, camera);
        };

        init();

        return () => {
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="webgl" />;
};

export default ThreeJSComponent;
