import React from 'react';
import * as THREE from 'three';


interface ParticleRingProps {

  isRunning: boolean;

  progress: number;

  intensity?: number;

  particleCount?: number;
}

export function ParticleRing({
  isRunning,
  progress,
  intensity = 0.5,
  particleCount = 200,
}: ParticleRingProps) {
  const mountRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.InstancedMesh;
    animationId: number | null;
  } | null>(null);


  React.useEffect(() => {
    if (!mountRef.current) return;


    const mountElement = mountRef.current;


    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    const size = Math.min(680, Math.max(400, window.innerWidth * 0.84));
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountElement.appendChild(renderer.domElement);


    const geometry = new THREE.SphereGeometry(0.015, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00e5ff),
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.InstancedMesh(geometry, material, particleCount);


    const dummy = new THREE.Object3D();
    const radius = 2.2;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 0.3;

      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      particles.setMatrixAt(i, dummy.matrix);
    }

    particles.instanceMatrix.needsUpdate = true;
    scene.add(particles);


    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      animationId: null,
    };


    return () => {
      if (sceneRef.current) {
        if (sceneRef.current.animationId !== null) {
          cancelAnimationFrame(sceneRef.current.animationId);
        }
        sceneRef.current.renderer.dispose();
        sceneRef.current = null;
      }

      if (mountElement) {
        mountElement.innerHTML = '';
      }
    };
  }, [particleCount]);


  React.useEffect(() => {
    if (!sceneRef.current) return;

    const { scene, camera, renderer, particles } = sceneRef.current;
    const dummy = new THREE.Object3D();
    const radius = 2.2;
    let frame = 0;

    const animate = () => {
      frame += 0.01;


      for (let i = 0; i < particleCount; i++) {
        const baseAngle = (i / particleCount) * Math.PI * 2;


        const flowOffset = isRunning ? frame * 0.5 : 0;
        const angle = baseAngle + flowOffset + progress * Math.PI * 2;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = Math.sin(angle * 3 + frame) * 0.2;


        const distanceFromProgress = Math.abs(((baseAngle + flowOffset) % (Math.PI * 2)) - (progress * Math.PI * 2));
        const proximityScale = 1 + (1 - distanceFromProgress / Math.PI) * intensity * 0.5;
        const baseScale = isRunning ? 1 + intensity * 0.3 : 0.6;
        const scale = baseScale * proximityScale;

        dummy.position.set(x, y, z);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        particles.setMatrixAt(i, dummy.matrix);
      }

      particles.instanceMatrix.needsUpdate = true;


      const targetOpacity = isRunning ? 0.85 + intensity * 0.15 : 0.5;
      (particles.material as THREE.MeshBasicMaterial).opacity =
        THREE.MathUtils.lerp(
          (particles.material as THREE.MeshBasicMaterial).opacity,
          targetOpacity,
          0.1
        );


      particles.rotation.z = frame * 0.1;

      renderer.render(scene, camera);
      sceneRef.current!.animationId = requestAnimationFrame(animate);
    };

    animate();


    return () => {
      if (sceneRef.current?.animationId !== null && sceneRef.current !== null) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
    };
  }, [isRunning, progress, intensity, particleCount]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 0,
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  );
}
