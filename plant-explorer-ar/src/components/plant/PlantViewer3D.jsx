import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

export default function PlantViewer3D({ plant, onPartClick, resetTrigger }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const plantGroupRef = useRef(null);
  const animatablePartsRef = useRef({ leaves: [], petals: [], stem: null });
  const clockRef = useRef(new THREE.Clock());
  
  const [interactionState, setInteractionState] = useState({
    isRotating: false,
    isPanning: false,
    lastPosition: { x: 0, y: 0 },
    lastTouchDistance: 0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with fog for depth perception
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f4f8);
    scene.fog = new THREE.Fog(0xe8f4f8, 10, 30);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(6, 4, 6);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer setup with optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    directionalLight.position.set(8, 10, 6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.4);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffffff, 0.6);
    rimLight.position.set(0, 8, -8);
    scene.add(rimLight);

    // Create plant group
    const plantGroup = new THREE.Group();
    plantGroupRef.current = plantGroup;
    scene.add(plantGroup);

    // Store animatable parts
    const animatableParts = { leaves: [], petals: [], stem: null };

    // Enhanced color palette
    const partColors = {
      'Roots': 0x654321,
      'Stem': 0x2d5016,
      'Leaves': 0x3a7d44,
      'Flowers': 0xf06292,
      'Seeds': 0xffc107,
      'Fruits': 0xe53935
    };

    // ROOTS - More detailed with multiple tendrils
    const rootsGroup = new THREE.Group();
    rootsGroup.userData = { partName: 'Roots' };
    
    const mainRootGeometry = new THREE.ConeGeometry(0.6, 1.8, 8);
    const rootMaterial = new THREE.MeshStandardMaterial({ 
      color: partColors['Roots'],
      roughness: 0.9,
      metalness: 0.1
    });
    const mainRoot = new THREE.Mesh(mainRootGeometry, rootMaterial);
    mainRoot.position.y = -2.2;
    mainRoot.castShadow = true;
    mainRoot.receiveShadow = true;
    rootsGroup.add(mainRoot);

    // Add root tendrils
    for (let i = 0; i < 5; i++) {
      const tendrilGeometry = new THREE.CylinderGeometry(0.05, 0.1, 1.2, 6);
      const tendril = new THREE.Mesh(tendrilGeometry, rootMaterial.clone());
      const angle = (i / 5) * Math.PI * 2;
      tendril.position.set(
        Math.cos(angle) * 0.4,
        -2.5,
        Math.sin(angle) * 0.4
      );
      tendril.rotation.z = Math.cos(angle) * 0.5;
      tendril.rotation.x = Math.sin(angle) * 0.5;
      tendril.castShadow = true;
      rootsGroup.add(tendril);
    }
    
    plantGroup.add(rootsGroup);

    // STEM - Segmented with realistic texture
    const stemSegments = 5;
    const stemGroup = new THREE.Group();
    stemGroup.userData = { partName: 'Stem' };
    
    for (let i = 0; i < stemSegments; i++) {
      const segmentGeometry = new THREE.CylinderGeometry(
        0.25 - i * 0.02, 
        0.28 - i * 0.02, 
        1, 
        16
      );
      const stemMaterial = new THREE.MeshStandardMaterial({ 
        color: partColors['Stem'],
        roughness: 0.7,
        metalness: 0.1
      });
      const segment = new THREE.Mesh(segmentGeometry, stemMaterial);
      segment.position.y = -1.5 + i * 0.9;
      segment.castShadow = true;
      segment.receiveShadow = true;
      stemGroup.add(segment);
    }
    
    animatableParts.stem = stemGroup;
    plantGroup.add(stemGroup);

    // LEAVES - More detailed and organic
    const leafGroup = new THREE.Group();
    leafGroup.userData = { partName: 'Leaves' };
    
    const leafPositions = [
      { pos: [-1.2, 0.3, 0], rot: [0, 0, Math.PI / 4], scale: 1.2 },
      { pos: [1.2, 0.8, 0], rot: [0, 0, -Math.PI / 4], scale: 1.1 },
      { pos: [0, 1.3, -1], rot: [Math.PI / 4, 0, 0], scale: 1.0 },
      { pos: [-0.8, 1.8, 0.5], rot: [0, Math.PI / 6, Math.PI / 5], scale: 0.9 },
      { pos: [0.9, 2.2, -0.3], rot: [0, -Math.PI / 6, -Math.PI / 5], scale: 0.85 }
    ];

    leafPositions.forEach((config, i) => {
      // Create leaf shape with curve
      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(0.3, 0.1, 0.5, 0.3, 0.6, 0.5);
      leafShape.bezierCurveTo(0.5, 0.7, 0.3, 0.9, 0, 1);
      leafShape.bezierCurveTo(-0.3, 0.9, -0.5, 0.7, -0.6, 0.5);
      leafShape.bezierCurveTo(-0.5, 0.3, -0.3, 0.1, 0, 0);

      const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
        depth: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.01,
        bevelSegments: 2
      });

      const leafMaterial = new THREE.MeshStandardMaterial({ 
        color: partColors['Leaves'],
        roughness: 0.5,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
      
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(...config.pos);
      leaf.rotation.set(...config.rot);
      leaf.scale.set(config.scale, config.scale, config.scale);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      leaf.userData.originalRotation = { ...leaf.rotation };
      leaf.userData.swayOffset = i * 0.7;
      
      animatableParts.leaves.push(leaf);
      leafGroup.add(leaf);
    });
    
    plantGroup.add(leafGroup);

    // FLOWER - Detailed with animated petals
    const flowerGroup = new THREE.Group();
    flowerGroup.userData = { partName: 'Flowers' };
    flowerGroup.position.y = 3.2;

    // Flower center with texture
    const centerGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const centerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffd54f,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0xffd54f,
      emissiveIntensity: 0.2
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.castShadow = true;
    flowerGroup.add(center);

    // Detailed petals
    const petalCount = 8;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      
      // Create petal shape
      const petalShape = new THREE.Shape();
      petalShape.moveTo(0, 0);
      petalShape.bezierCurveTo(0.2, 0.1, 0.35, 0.3, 0.4, 0.5);
      petalShape.bezierCurveTo(0.35, 0.7, 0.2, 0.85, 0, 0.9);
      petalShape.bezierCurveTo(-0.2, 0.85, -0.35, 0.7, -0.4, 0.5);
      petalShape.bezierCurveTo(-0.35, 0.3, -0.2, 0.1, 0, 0);

      const petalGeometry = new THREE.ExtrudeGeometry(petalShape, {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 3
      });

      const petalMaterial = new THREE.MeshStandardMaterial({ 
        color: partColors['Flowers'],
        roughness: 0.3,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
      
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      petal.position.set(
        Math.cos(angle) * 0.3,
        0,
        Math.sin(angle) * 0.3
      );
      petal.rotation.y = angle + Math.PI / 2;
      petal.rotation.x = Math.PI / 6;
      petal.castShadow = true;
      petal.userData.originalRotation = { ...petal.rotation };
      petal.userData.bloomOffset = i * 0.4;
      
      animatableParts.petals.push(petal);
      flowerGroup.add(petal);
    }
    
    plantGroup.add(flowerGroup);

    // Enhanced ground with gradient
    const groundGeometry = new THREE.CircleGeometry(5, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7cb342,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add small grass blades for detail
    for (let i = 0; i < 30; i++) {
      const bladeGeometry = new THREE.ConeGeometry(0.02, 0.3, 3);
      const bladeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x558b2f,
        roughness: 0.8
      });
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 3 + 1;
      blade.position.set(
        Math.cos(angle) * distance,
        -3,
        Math.sin(angle) * distance
      );
      blade.rotation.z = (Math.random() - 0.5) * 0.3;
      scene.add(blade);
    }

    animatablePartsRef.current = animatableParts;

    // Raycaster for click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Touch handling for mobile
    const getTouchDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Click/Touch handler
    const handlePointerDown = (event) => {
      event.preventDefault();
      
      const touch = event.touches ? event.touches[0] : event;
      const x = touch.clientX;
      const y = touch.clientY;

      if (event.touches && event.touches.length === 2) {
        // Pinch zoom on mobile
        setInteractionState(prev => ({
          ...prev,
          isPanning: false,
          isRotating: false,
          lastTouchDistance: getTouchDistance(event.touches)
        }));
      } else if (event.shiftKey || event.button === 1) {
        // Pan mode
        setInteractionState(prev => ({
          ...prev,
          isPanning: true,
          isRotating: false,
          lastPosition: { x, y }
        }));
      } else {
        // Rotation mode
        setInteractionState(prev => ({
          ...prev,
          isRotating: true,
          isPanning: false,
          lastPosition: { x, y }
        }));
      }
    };

    const handlePointerMove = (event) => {
      event.preventDefault();
      
      if (event.touches && event.touches.length === 2) {
        // Pinch zoom
        const currentDistance = getTouchDistance(event.touches);
        const delta = currentDistance - interactionState.lastTouchDistance;
        
        camera.position.z -= delta * 0.01;
        camera.position.z = Math.max(3, Math.min(12, camera.position.z));
        
        setInteractionState(prev => ({
          ...prev,
          lastTouchDistance: currentDistance
        }));
        return;
      }

      const touch = event.touches ? event.touches[0] : event;
      const x = touch.clientX;
      const y = touch.clientY;

      if (interactionState.isRotating) {
        const deltaX = x - interactionState.lastPosition.x;
        const deltaY = y - interactionState.lastPosition.y;

        plantGroup.rotation.y += deltaX * 0.008;
        plantGroup.rotation.x += deltaY * 0.008;
        plantGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, plantGroup.rotation.x));

        setInteractionState(prev => ({
          ...prev,
          lastPosition: { x, y }
        }));
      } else if (interactionState.isPanning) {
        const deltaX = x - interactionState.lastPosition.x;
        const deltaY = y - interactionState.lastPosition.y;

        camera.position.x -= deltaX * 0.01;
        camera.position.y += deltaY * 0.01;

        setInteractionState(prev => ({
          ...prev,
          lastPosition: { x, y }
        }));
      }
    };

    const handlePointerUp = (event) => {
      event.preventDefault();
      
      // Check for click (not drag)
      const touch = event.changedTouches ? event.changedTouches[0] : event;
      const wasDragging = interactionState.isRotating || interactionState.isPanning;
      
      if (!wasDragging) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(plantGroup.children, true);

        if (intersects.length > 0) {
          let current = intersects[0].object;
          while (current && !current.userData.partName) {
            current = current.parent;
          }
          if (current && current.userData.partName) {
            onPartClick(current.userData.partName);
          }
        }
      }
      
      setInteractionState({
        isRotating: false,
        isPanning: false,
        lastPosition: { x: 0, y: 0 },
        lastTouchDistance: 0
      });
    };

    // Wheel zoom
    const handleWheel = (event) => {
      event.preventDefault();
      camera.position.z += event.deltaY * 0.01;
      camera.position.z = Math.max(3, Math.min(12, camera.position.z));
    };

    // Event listeners
    renderer.domElement.addEventListener('mousedown', handlePointerDown);
    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('mouseup', handlePointerUp);
    renderer.domElement.addEventListener('touchstart', handlePointerDown, { passive: false });
    renderer.domElement.addEventListener('touchmove', handlePointerMove, { passive: false });
    renderer.domElement.addEventListener('touchend', handlePointerUp, { passive: false });
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Animation loop with organic movements
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clockRef.current.getElapsedTime();
      
      // Animate leaves - gentle swaying
      animatableParts.leaves.forEach((leaf, i) => {
        const swaySpeed = 1.5;
        const swayAmount = 0.15;
        leaf.rotation.z = leaf.userData.originalRotation.z + 
          Math.sin(elapsedTime * swaySpeed + leaf.userData.swayOffset) * swayAmount;
        leaf.rotation.x = leaf.userData.originalRotation.x + 
          Math.cos(elapsedTime * swaySpeed * 0.7 + leaf.userData.swayOffset) * swayAmount * 0.5;
      });

      // Animate petals - subtle breathing/opening
      animatableParts.petals.forEach((petal, i) => {
        const breatheSpeed = 2;
        const breatheAmount = 0.08;
        petal.rotation.x = petal.userData.originalRotation.x + 
          Math.sin(elapsedTime * breatheSpeed + petal.userData.bloomOffset) * breatheAmount;
      });

      // Animate stem - very subtle sway
      if (animatableParts.stem) {
        const stemSwayAmount = 0.03;
        animatableParts.stem.rotation.z = Math.sin(elapsedTime * 1.2) * stemSwayAmount;
      }

      // Auto-rotate when not interacting
      if (!interactionState.isRotating && !interactionState.isPanning) {
        plantGroup.rotation.y += 0.001;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handlePointerDown);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('mouseup', handlePointerUp);
      renderer.domElement.removeEventListener('touchstart', handlePointerDown);
      renderer.domElement.removeEventListener('touchmove', handlePointerMove);
      renderer.domElement.removeEventListener('touchend', handlePointerUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationId);
      
      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onPartClick]);

  // Handle reset
  useEffect(() => {
    if (plantGroupRef.current && cameraRef.current) {
      plantGroupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(6, 4, 6);
      cameraRef.current.lookAt(0, 1, 0);
    }
  }, [resetTrigger]);

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        className="w-full h-[500px] bg-gradient-to-b from-sky-100 to-green-50 rounded-xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg backdrop-blur">
        <p className="mb-1">🖱️ <strong>Drag</strong> to rotate</p>
        <p className="mb-1">⚙️ <strong>Shift + Drag</strong> to pan</p>
        <p>🔍 <strong>Scroll</strong> to zoom</p>
      </div>
    </div>
  );
}