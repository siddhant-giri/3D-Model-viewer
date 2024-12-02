import React, { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment, Center } from '@react-three/drei';
import { Group, PointLight, Mesh, MeshStandardMaterial, Color, Vector3, Quaternion, Clock, Box3 } from 'three';
import * as THREE from 'three';

interface ModelProps {
  color: string;
  modelPath: string;
}

const Model: React.FC<ModelProps> = ({ color, modelPath }) => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(modelPath);
  const [isDragging, setIsDragging] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationSpeed = useRef({ x: 0, y: 0, z: 0 });
  const clock = new Clock();

  const { camera } = useThree();

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh && child.material instanceof MeshStandardMaterial) {
        child.material.color = new Color(color);
        child.material.needsUpdate = true;
      }
    });
  }, [scene, color]);

  useEffect(() => {
    // Center and scale the model only when the model changes
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov / 2)) * 2.5;
      camera.position.z = cameraZ;
    } else {
      camera.position.z = maxDim * 2.5;
    }
    camera.updateProjectionMatrix();

    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;

    if (group.current) {
      group.current.rotation.set(0, 0, 0);
    }
  }, [scene, camera, modelPath]);

  useFrame((state, delta) => {
    if (group.current) {
      if (!isDragging) {
        group.current.rotation.x += rotationSpeed.current.x * delta;
        group.current.rotation.y += rotationSpeed.current.y * delta;
        group.current.rotation.z += rotationSpeed.current.z * delta;
      }
      // Gradually decrease rotation speed
      rotationSpeed.current.x *= 0.95;
      rotationSpeed.current.y *= 0.95;
      rotationSpeed.current.z *= 0.95;
    }
  });

  const handlePointerDown = (event: React.PointerEvent) => {
    setIsDragging(true);
    previousMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (isDragging && group.current) {
      const deltaMove = {
        x: event.clientX - previousMousePosition.current.x,
        y: event.clientY - previousMousePosition.current.y
      };

      const rotationQuaternion = new Quaternion()
        .setFromEuler(camera.rotation)
        .invert();

      const deltaRotation = new Vector3(
        deltaMove.y * 0.01,
        deltaMove.x * 0.01,
        0
      ).applyQuaternion(rotationQuaternion);

      group.current.rotation.x += deltaRotation.x;
      group.current.rotation.y += deltaRotation.y;
      group.current.rotation.z += deltaRotation.z;

      const delta = clock.getDelta();
      rotationSpeed.current = {
        x: deltaRotation.x / delta,
        y: deltaRotation.y / delta,
        z: deltaRotation.z / delta
      };

      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    }
  };

  return (
    <Center>
      <primitive
        ref={group}
        object={scene}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
    </Center>
  );
};

const StudioLight = () => {
  const light = useRef<PointLight>(null);

  useFrame(() => {
    if (light.current) {
      light.current.position.set(5, 5, 5);
    }
  });

  return <pointLight ref={light} intensity={2} decay={2} distance={100} />;
};

interface ModelViewerProps {
  color: string;
  modelPath: string;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ color, modelPath }) => {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <Suspense fallback={null}>
          <Model color={color} modelPath={modelPath} />
          <Environment preset="studio" />
        </Suspense>
        <StudioLight />
        <OrbitControls enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
};

export default ModelViewer;