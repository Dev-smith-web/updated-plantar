import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function PlantViewer3D({ plant, onPartClick, resetTrigger }) {
  const containerRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const plantGroupRef = useRef();
  const clockRef = useRef(new THREE.Clock());

  const animParts = useRef({ leaves: [], petals: [], stem: null });
  const [interaction, setInteraction] = useState({
    isRotating: false,
    isPanning: false,
    last: { x: 0, y: 0 },
    touchDist: 0
  });

  // ---------- MAIN SETUP ----------
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8f4f8);
    scene.fog = new THREE.Fog(0xe8f4f8, 10, 30);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      200
    );
    camera.position.set(6, 4, 6);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dir = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dir.position.set(8, 12, 6);
    dir.castShadow = true;
    scene.add(dir);

    const fill = new THREE.DirectionalLight(0x88ccff, 0.4);
    fill.position.set(-6, 3, -4);
    scene.add(fill);

    // Plant Group
    const plantGroup = new THREE.Group();
    plantGroupRef.current = plantGroup;
    scene.add(plantGroup);

    // COLOR MAP
    const colors = {
      Roots: 0x654321,
      Stem: 0x2d5016,
      Leaves: 0x3a7d44,
      Flowers: 0xf06292,
      Seeds: 0xffc107
    };

    // ------------------------
    // CREATE PLANT GEOMETRY
    // ------------------------
    const anim = { leaves: [], petals: [], stem: null };

    // ROOTS
    const roots = new THREE.Group();
    roots.userData.partName = "Roots";

    const rootMat = new THREE.MeshStandardMaterial({
      color: colors.Roots,
      roughness: 0.8
    });

    const rootMain = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 1.8, 8),
      rootMat
    );
    rootMain.position.y = -2.2;
    rootMain.castShadow = true;
    roots.add(rootMain);

    for (let i = 0; i < 5; i++) {
      const t = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.1, 1.2, 6),
        rootMat
      );
      const angle = (i / 5) * Math.PI * 2;
      t.position.set(Math.cos(angle) * 0.5, -2.7, Math.sin(angle) * 0.5);
      roots.add(t);
    }
    plantGroup.add(roots);

    // STEM
    const stem = new THREE.Group();
    stem.userData.partName = "Stem";

    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.28, 1, 16),
        new THREE.MeshStandardMaterial({
          color: colors.Stem,
          roughness: 0.6
        })
      );
      seg.position.y = -1.5 + i * 0.9;
      seg.castShadow = true;
      stem.add(seg);
    }

    anim.stem = stem;
    plantGroup.add(stem);

    // LEAVES
    const leafGroup = new THREE.Group();
    leafGroup.userData.partName = "Leaves";

    const makeLeaf = (offset = 0) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(0.3, 0.1, 0.5, 0.3, 0.6, 0.5);
      shape.bezierCurveTo(0.5, 0.7, 0.3, 0.9, 0, 1);
      shape.bezierCurveTo(-0.3, 0.9, -0.5, 0.7, -0.6, 0.5);
      shape.bezierCurveTo(-0.5, 0.3, -0.3, 0.1, 0, 0);

      return new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false }),
        new THREE.MeshStandardMaterial({
          color: colors.Leaves,
          roughness: 0.5,
          side: THREE.DoubleSide
        })
      );
    };

    for (let i = 0; i < 4; i++) {
      const leaf = makeLeaf();
      leaf.position.set(i % 2 ? 1.2 : -1.2, 0.5 + i, (i % 2) * 0.4);
      leaf.rotation.z = i % 2 ? -0.8 : 0.8;
      leaf.rotation.x = 0.5;
      leaf.castShadow = true;

      leaf.userData.rot0 = leaf.rotation.clone();
      leaf.userData.offset = i;
      anim.leaves.push(leaf);

      leafGroup.add(leaf);
    }
    plantGroup.add(leafGroup);

    // FLOWER
    const flower = new THREE.Group();
    flower.position.y = 3.8;
    flower.userData.partName = "Flowers";

    const center = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xffd54f,
        roughness: 0.4,
        emissive: 0xffd54f,
        emissiveIntensity: 0.2
      })
    );
    flower.add(center);

    for (let i = 0; i < 8; i++) {
      const petal = makeLeaf();
      petal.material.color.setHex(colors.Flowers);

      const ang = (i / 8) * Math.PI * 2;
      petal.position.set(Math.cos(ang) * 0.4, 0, Math.sin(ang) * 0.4);
      petal.rotation.y = ang;
      petal.rotation.x = 0.4;

      petal.userData.rot0 = petal.rotation.clone();
      petal.userData.offset = i * 0.4;

      anim.petals.push(petal);
      flower.add(petal);
    }
    plantGroup.add(flower);

    // Save parts
    animParts.current = anim;

    // RAYCASTER
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function getClickTarget(e) {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(x, y);

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(plantGroup.children, true);

      if (!hits.length) return null;

      let current = hits[0].object;
      while (current && !current.userData.partName) {
        current = current.parent;
      }
      return current?.userData.partName;
    }

    // MOUSE EVENTS
    const startDrag = (e) => {
      setInteraction((p) => ({
        ...p,
        isRotating: e.button === 0,
        isPanning: e.button === 1 || e.shiftKey,
        last: { x: e.clientX, y: e.clientY }
      }));
    };

    const moveDrag = (e) => {
      if (interaction.isRotating) {
        const dx = e.clientX - interaction.last.x;
        const dy = e.clientY - interaction.last.y;

        plantGroup.rotation.y += dx * 0.008;
        plantGroup.rotation.x += dy * 0.008;

        setInteraction((p) => ({ ...p, last: { x: e.clientX, y: e.clientY } }));
      }
    };

    const endDrag = (e) => {
      if (!interaction.isRotating && !interaction.isPanning) {
        const part = getClickTarget(e);
        if (part) onPartClick(part);
      }

      setInteraction({
        isRotating: false,
        isPanning: false,
        last: { x: 0, y: 0 },
        touchDist: 0
      });
    };

    // ZOOM
    const wheel = (e) => {
      camera.position.z += e.deltaY * 0.01;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, 3, 12);
    };

    renderer.domElement.addEventListener("mousedown", startDrag);
    renderer.domElement.addEventListener("mousemove", moveDrag);
    renderer.domElement.addEventListener("mouseup", endDrag);
    renderer.domElement.addEventListener("wheel", wheel);

    // RESIZE
    const resize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", resize);

    // ----------- ANIMATION LOOP -----------
    let id;
    const animate = () => {
      id = requestAnimationFrame(animate);
      const t = clockRef.current.getElapsedTime();

      anim.leaves.forEach((leaf, i) => {
        leaf.rotation.z =
          leaf.userData.rot0.z + Math.sin(t * 2 + leaf.userData.offset) * 0.15;
      });

      anim.petals.forEach((petal) => {
        petal.rotation.x =
          petal.userData.rot0.x + Math.sin(t * 2 + petal.userData.offset) * 0.08;
      });

      renderer.render(scene, camera);
    };
    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);

      renderer.domElement.removeEventListener("mousedown", startDrag);
      renderer.domElement.removeEventListener("mousemove", moveDrag);
      renderer.domElement.removeEventListener("mouseup", endDrag);
      renderer.domElement.removeEventListener("wheel", wheel);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else obj.material.dispose();
        }
      });

      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onPartClick]);

  // RESET CAMERA / ROTATION
  useEffect(() => {
    if (!plantGroupRef.current || !cameraRef.current) return;
    plantGroupRef.current.rotation.set(0, 0, 0);
    cameraRef.current.position.set(6, 4, 6);
    cameraRef.current.lookAt(0, 1, 0);
  }, [resetTrigger]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full h-[500px] bg-gradient-to-b from-sky-100 to-green-50 rounded-xl shadow-inner select-none"
        style={{ touchAction: "none" }}
      />
      <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-2 text-xs text-white rounded">
        <p>🖱 Drag = Rotate</p>
        <p>⚙ Shift + Drag = Pan</p>
        <p>🔍 Scroll = Zoom</p>
      </div>
    </div>
  );
}
