import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RotateCcw, Sun, Moon, Eye, EyeOff } from "lucide-react";

export default function DigitalTwin3D({
  bhk = 2,
  areaSqft = 1000,
  propertyType = "Apartment",
}) {
  const mountRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [showRoof, setShowRoof] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const width = mount.clientWidth;
    const height = 500;

    // --------------------------------
    // SCENE
    // --------------------------------

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xbfd8ef);

    // --------------------------------
    // CAMERA
    // --------------------------------

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );

    camera.position.set(12, 9, 12);

    // --------------------------------
    // RENDERER
    // --------------------------------

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setSize(width, height);

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    // --------------------------------
    // CONTROLS
    // --------------------------------

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;

    controls.minDistance = 5;
    controls.maxDistance = 30;

    controls.maxPolarAngle = Math.PI / 2.05;

    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;

    // --------------------------------
    // LIGHTING
    // --------------------------------

    const ambientLight = new THREE.HemisphereLight(
      0xffffff,
      0x667788,
      1.2
    );

    scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(
      0xffffff,
      3
    );

    sun.position.set(10, 15, 10);

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;

    scene.add(sun);

    // --------------------------------
    // GROUND
    // --------------------------------

    const groundMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x8fa58f,
        roughness: 0.9,
      });

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);

    // --------------------------------
    // BUILDING
    // --------------------------------

    const building = new THREE.Group();

    const roomsPerSide = Math.max(
      1,
      Math.ceil(Math.sqrt(bhk))
    );

    const roomSize = 2.8;

    const floorHeight = 2.8;

    const numFloors =
      propertyType === "Villa"
        ? Math.max(2, Math.ceil(areaSqft / 1000))
        : Math.min(
            4,
            Math.max(
              1,
              Math.round(areaSqft / 1200)
            )
          );

    const buildingWidth =
      roomsPerSide * roomSize;

    const buildingDepth =
      roomsPerSide * roomSize;

    // --------------------------------
    // MATERIALS
    // --------------------------------

    const wallMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xe8d7c3,
        roughness: 0.75,
        metalness: 0.05,
      });

    const floorMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.5,
      });

    const roofMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x4b2e2e,
        roughness: 0.65,
      });

    const glassMaterial =
      new THREE.MeshPhysicalMaterial({
        color: 0x7ec8e3,
        transparent: true,
        opacity: 0.55,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.2,
      });

    const doorMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x3a2115,
        roughness: 0.6,
      });

    const frameMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.7,
        roughness: 0.25,
      });

    // --------------------------------
    // BUILD FLOORS
    // --------------------------------

    for (let f = 0; f < numFloors; f++) {

      const floorGroup = new THREE.Group();

      // -----------------------------
      // Main building
      // -----------------------------

      const buildingMesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          buildingWidth,
          floorHeight,
          buildingDepth
        ),
        wallMaterial
      );

      buildingMesh.position.y =
        f * floorHeight +
        floorHeight / 2;

      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;

      floorGroup.add(buildingMesh);

      // -----------------------------
      // Floor slab
      // -----------------------------

      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(
          buildingWidth + 0.25,
          0.15,
          buildingDepth + 0.25
        ),
        floorMaterial
      );

      slab.position.y =
        f * floorHeight;

      slab.castShadow = true;

      floorGroup.add(slab);

      // -----------------------------
      // FRONT WINDOWS
      // -----------------------------

      for (let i = 0; i < roomsPerSide; i++) {

        const x =
          -buildingWidth / 2 +
          roomSize * i +
          roomSize / 2;

        const y =
          f * floorHeight +
          floorHeight / 2;

        createWindow(
          floorGroup,
          x,
          y,
          buildingDepth / 2 + 0.05,
          false
        );

        createWindow(
          floorGroup,
          x,
          y,
          -buildingDepth / 2 - 0.05,
          false
        );
      }

      // -----------------------------
      // SIDE WINDOWS
      // -----------------------------

      for (let i = 0; i < roomsPerSide; i++) {

        const z =
          -buildingDepth / 2 +
          roomSize * i +
          roomSize / 2;

        const y =
          f * floorHeight +
          floorHeight / 2;

        createWindow(
          floorGroup,
          -buildingWidth / 2 - 0.05,
          y,
          z,
          true
        );

        createWindow(
          floorGroup,
          buildingWidth / 2 + 0.05,
          y,
          z,
          true
        );
      }

      building.add(floorGroup);
    }

    // --------------------------------
    // FUNCTION: WINDOW
    // --------------------------------

    function createWindow(
      parent,
      x,
      y,
      z,
      side
    ) {

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(
          side ? 0.05 : 0.08,
          0.9,
          1.1
        ),
        glassMaterial
      );

      if (side) {
        glass.rotation.y = Math.PI / 2;
      }

      glass.position.set(x, y, z);

      glass.castShadow = true;

      parent.add(glass);

      // Window frame

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(
          side ? 0.08 : 0.1,
          1.05,
          1.25
        ),
        frameMaterial
      );

      if (side) {
        frame.rotation.y = Math.PI / 2;
      }

      frame.position.set(
        x,
        y,
        z
      );

      parent.add(frame);
    }

    // --------------------------------
    // MAIN DOOR
    // --------------------------------

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(
        1,
        2,
        0.12
      ),
      doorMaterial
    );

    door.position.set(
      0,
      1,
      buildingDepth / 2 + 0.08
    );

    door.castShadow = true;

    building.add(door);

    // Door handle

    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.07,
        16,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.2,
      })
    );

    handle.position.set(
      0.3,
      1,
      buildingDepth / 2 + 0.15
    );

    building.add(handle);

    // --------------------------------
    // BALCONY
    // --------------------------------

    if (bhk >= 2) {

      const balcony = new THREE.Mesh(
        new THREE.BoxGeometry(
          buildingWidth * 0.6,
          0.15,
          1.3
        ),
        floorMaterial
      );

      balcony.position.set(
        0,
        floorHeight + 0.1,
        buildingDepth / 2 + 0.65
      );

      balcony.castShadow = true;

      building.add(balcony);

      // railing

      for (let i = -2; i <= 2; i++) {

        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.025,
            0.025,
            1
          ),
          frameMaterial
        );

        pole.position.set(
          i * 0.55,
          floorHeight + 0.6,
          buildingDepth / 2 + 1.15
        );

        building.add(pole);
      }
    }

    // --------------------------------
    // ROOF
    // --------------------------------

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(
        Math.max(
          buildingWidth,
          buildingDepth
        ) * 0.8,
        1.4,
        4
      ),
      roofMaterial
    );

    roof.rotation.y = Math.PI / 4;

    roof.position.y =
      numFloors * floorHeight +
      0.7;

    roof.castShadow = true;

    building.add(roof);

    // --------------------------------
    // CHIMNEY
    // --------------------------------

    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.4,
        1,
        0.4
      ),
      wallMaterial
    );

    chimney.position.set(
      buildingWidth * 0.25,
      numFloors * floorHeight + 1.6,
      0
    );

    chimney.castShadow = true;

    building.add(chimney);

    // --------------------------------
    // TREES
    // --------------------------------

    function createTree(x, z) {

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.12,
          0.16,
          1
        ),
        new THREE.MeshStandardMaterial({
          color: 0x6b4226,
        })
      );

      trunk.position.set(
        x,
        0.5,
        z
      );

      trunk.castShadow = true;

      scene.add(trunk);

      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.7,
          16,
          16
        ),
        new THREE.MeshStandardMaterial({
          color: 0x2f7d32,
          roughness: 0.9,
        })
      );

      leaves.position.set(
        x,
        1.3,
        z
      );

      leaves.castShadow = true;

      scene.add(leaves);
    }

    const treeDistance =
      Math.max(
        buildingWidth,
        buildingDepth
      ) * 1.5;

    createTree(
      treeDistance,
      treeDistance
    );

    createTree(
      -treeDistance,
      treeDistance
    );

    createTree(
      treeDistance,
      -treeDistance
    );

    createTree(
      -treeDistance,
      -treeDistance
    );

    // --------------------------------
    // PATH
    // --------------------------------

    const path = new THREE.Mesh(
      new THREE.BoxGeometry(
        1.5,
        0.05,
        7
      ),
      new THREE.MeshStandardMaterial({
        color: 0x777777,
        roughness: 1,
      })
    );

    path.position.set(
      0,
      0.03,
      buildingDepth / 2 + 3
    );

    scene.add(path);

    // --------------------------------
    // BUILDING
    // --------------------------------

    scene.add(building);

    // --------------------------------
    // RESET CAMERA
    // --------------------------------

    controls.target.set(
      0,
      numFloors * floorHeight / 2,
      0
    );

    controls.update();

    // --------------------------------
    // ANIMATION
    // --------------------------------

    let frameId;

    const animate = () => {

      frameId =
        requestAnimationFrame(animate);

      controls.autoRotate =
        autoRotate;

      controls.update();

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    // --------------------------------
    // RESIZE
    // --------------------------------

    const handleResize = () => {

      const w =
        mount.clientWidth;

      camera.aspect =
        w / height;

      camera.updateProjectionMatrix();

      renderer.setSize(
        w,
        height
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    // --------------------------------
    // CLEANUP
    // --------------------------------

    return () => {

      cancelAnimationFrame(
        frameId
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      controls.dispose();

      renderer.dispose();

      mount.innerHTML = "";
    };

  }, [
    bhk,
    areaSqft,
    propertyType,
    autoRotate,
  ]);

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="card p-4">

      <div className="flex items-center justify-between mb-3">

        <div>

          <h3 className="font-semibold text-ink">
            Advanced 3D Digital Twin
          </h3>

          <p className="text-xs text-gray-500">
            {bhk} BHK • {areaSqft} sqft •{" "}
            {propertyType}
          </p>

        </div>

        <div className="flex gap-2">

          <button
            onClick={() =>
              setAutoRotate(
                (value) => !value
              )
            }
            className="text-xs px-2 py-1 rounded border"
          >
            {autoRotate
              ? "Stop Rotation"
              : "Auto Rotate"}
          </button>

          <button
            onClick={() =>
              setNightMode(
                (value) => !value
              )
            }
            className="text-xs px-2 py-1 rounded border"
          >
            {nightMode ? (
              <Sun size={14} />
            ) : (
              <Moon size={14} />
            )}
          </button>

          <button
            onClick={() =>
              setShowRoof(
                (value) => !value
              )
            }
            className="text-xs px-2 py-1 rounded border"
          >
            {showRoof ? (
              <Eye size={14} />
            ) : (
              <EyeOff size={14} />
            )}
          </button>

        </div>

      </div>

      <div
        ref={mountRef}
        className="w-full rounded-lg overflow-hidden cursor-grab"
      />

    </div>
  );
}
