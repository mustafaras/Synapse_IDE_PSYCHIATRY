import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';


interface Node {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  pulse: number;
  pulsePhase: number;
  energy: number;
  type: 'core' | 'satellite' | 'pulse';
  lastActivation: number;
  neighbors: number[];
  colorShift: number;
  activationDecay: number;
  isActive: boolean;
  activationTime: number;
  size: number;
}

interface Connection {
  from: number;
  to: number;
  strength: number;
}

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  opacity: 0.7;
  pointer-events: none;
  overflow: hidden;


  &,
  * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
`;

const PhaseIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 13px;
  font-weight: 600;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  opacity: 0.9;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  user-select: none;

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  &::before {
    content: '🧠 ';
    margin-right: 6px;
    font-size: 14px;
  }

  .phase-progress {
    margin-top: 4px;
    font-size: 10px;
    opacity: 0.7;
    font-weight: 400;
  }

  .progress-bar {
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 1px;
    margin-top: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
      border-radius: 1px;
      transition: width 0.1s ease-out;
    }
  }
`;

const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesARef = useRef<Node[]>([]);
  const nodesBRef = useRef<Node[] | null>(null);
  const connectionsARef = useRef<Connection[]>([]);
  const connectionsBRef = useRef<Connection[] | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, isActive: false });
  const rotationRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const autoRotationRef = useRef({ enabled: true, speed: 0.0018 });
  const { themeName } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);


  const previousThemeRef = useRef<string>(themeName);
  const initializedRef = useRef<boolean>(false);
  const themeTransitionRef = useRef<{
    isTransitioning: boolean;
    startTime: number;
    duration: number;
    fromColors: any;
    toColors: any;
  }>({
    isTransitioning: false,
    startTime: 0,
    duration: 1200,
    fromColors: null,
    toColors: null,
  });


  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);


  useEffect(() => {
    if (initializedRef.current && previousThemeRef.current !== themeName) {
      const transition = themeTransitionRef.current;
      transition.fromColors = getThemeColors(previousThemeRef.current);
      transition.toColors = getThemeColors(themeName);
      transition.isTransitioning = true;
      transition.startTime = performance.now();
      transition.duration = 800;

      previousThemeRef.current = themeName;
    } else if (!initializedRef.current) {

      previousThemeRef.current = themeName;
      initializedRef.current = true;
    }
  }, [themeName]);


  const generateMathematicalLayout = (
    layoutType: number,
    nodeCount: number,
    radius: number = 300
  ) => {
    switch (layoutType) {
      case 0:
        return { ...generateSphereLayout(nodeCount, radius), type: 'Sphere' };
      case 1:
        return { ...generateFibonacciSpiral(nodeCount, radius), type: 'Fibonacci' };
      case 2:
        return { ...generateRandomCloud(nodeCount, radius), type: 'Cloud' };
      case 3:
        return { ...generateRandomSphere1(nodeCount, radius), type: 'Pulse Sphere' };
      case 4:
        return { ...generateHopfFibration(nodeCount, radius), type: 'Hopf Fibration' };
      case 5:
        return { ...generateDumbbellOrbital(nodeCount, radius), type: 'Dumbbell Orbital' };
      case 6:
        return { ...generateCloverleafOrbital(nodeCount, radius), type: 'Cloverleaf Orbital' };
      case 7:
        return { ...generateToroidalShell(nodeCount, radius), type: 'Toroidal Shell' };
      case 8:
        return { ...generateNeuralNetwork(nodeCount, radius), type: 'Neural Network' };
      case 9:
        return { ...generateDoubleTorus(nodeCount, radius), type: 'Double Torus' };
      case 10:
        return { ...generateRandomPhase(nodeCount, radius), type: 'Random Phase' };
      default:
        return { ...generateSphereLayout(nodeCount, radius), type: 'Sphere' };
    }
  };


  const generateSphereLayout = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = Math.random() < 0.1 ? 'core' : Math.random() < 0.5 ? 'satellite' : 'pulse';
      const phi = Math.random() * Math.PI * 2;
      const cosTheta = Math.random() * 2 - 1;
      const theta = Math.acos(cosTheta);

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 0.5,
        pulse: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        energy: nodeType === 'core' ? 1.0 : Math.random() * 0.8,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: Math.random() * Math.PI * 2,
        activationDecay: 0.95 + Math.random() * 0.04,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.random() * 1,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateFibonacciSpiral = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 21 === 0 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';


      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      const x = Math.cos(theta) * radiusAtY * radius;
      const z = Math.sin(theta) * radiusAtY * radius;
      const yPos = y * radius;

      nodes.push({
        x,
        y: yPos,
        z,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        pulse: Math.random(),
        pulsePhase: i * 0.1,
        energy: Math.abs(Math.sin(i * goldenAngle)) * 0.8 + 0.2,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: i * 0.1,
        activationDecay: 0.96 + Math.random() * 0.03,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.abs(Math.sin(i * 0.1)) * 0.8,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateRandomCloud = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const nodeType = Math.random() < 0.08 ? 'core' : Math.random() < 0.5 ? 'satellite' : 'pulse';


      const variance = radius * 0.6;
      const x = (Math.random() + Math.random() + Math.random() - 1.5) * variance;
      const y = (Math.random() + Math.random() + Math.random() - 1.5) * variance;
      const z = (Math.random() + Math.random() + Math.random() - 1.5) * variance;


      const distance = Math.sqrt(x * x + y * y + z * z);
      const targetRadius = radius * (0.8 + Math.random() * 0.4);
      const scale = distance > 0 ? targetRadius / distance : 1;

      nodes.push({
        x: x * scale,
        y: y * scale,
        z: z * scale,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        vz: (Math.random() - 0.5) * 0.6,
        pulse: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.random() * 0.7 + 0.3,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: Math.random() * Math.PI * 2,
        activationDecay: 0.94 + Math.random() * 0.05,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.random() * 1.2,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateRandomSphere1 = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 15 === 0 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';


      const phi = Math.acos(2 * (i / nodeCount) - 1);
      const theta = ((i * 0.618) % 1) * Math.PI * 2;


      const pulseFreq = 3 + Math.random() * 2;
      const radiusVariation =
        radius * (0.8 + 0.3 * Math.sin(pulseFreq * phi) * Math.cos(pulseFreq * theta));

      const x = radiusVariation * Math.sin(phi) * Math.cos(theta);
      const y = radiusVariation * Math.sin(phi) * Math.sin(theta);
      const z = radiusVariation * Math.cos(phi);

      const pulseIntensity = Math.abs(Math.sin(pulseFreq * phi) * Math.cos(pulseFreq * theta));

      nodes.push({
        x,
        y,
        z,
        vx: Math.sin(theta + phi) * 0.01,
        vy: Math.cos(theta - phi) * 0.01,
        vz: Math.sin(pulseFreq * phi) * 0.005,
        pulse: Math.random(),
        pulsePhase: pulseFreq * phi + theta,
        energy: 0.5 + pulseIntensity * 0.5,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: theta + phi,
        activationDecay: 0.94 + Math.random() * 0.05,
        isActive: false,
        activationTime: 0,
        size: 1 + pulseIntensity * 0.8,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateHopfFibration = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 30 === 0 ? 'core' : Math.random() < 0.25 ? 'satellite' : 'pulse';


      const phi = (i / nodeCount) * Math.PI * 2;
      const theta = ((i * 0.618) % 1) * Math.PI;
      const psi = ((i * 2.718) % 1) * Math.PI * 2;


      const x1 = Math.cos(theta / 2) * Math.cos((phi - psi) / 2);
      const x2 = Math.cos(theta / 2) * Math.sin((phi - psi) / 2);
      const x3 = Math.sin(theta / 2) * Math.cos((phi + psi) / 2);
      const x4 = Math.sin(theta / 2) * Math.sin((phi + psi) / 2);


      const factor = radius * 0.6;
      const x = factor * (2 * (x1 * x3 + x2 * x4));
      const y = factor * (2 * (x2 * x3 - x1 * x4));
      const z = factor * (x1 * x1 + x2 * x2 - x3 * x3 - x4 * x4);

      const fibrationComplexity = Math.abs(x1 * x2 * x3 * x4);

      nodes.push({
        x,
        y,
        z,
        vx: Math.sin(phi + psi) * 0.008,
        vy: Math.cos(theta + phi) * 0.008,
        vz: Math.sin(theta + psi) * 0.006,
        pulse: Math.random(),
        pulsePhase: phi + theta + psi,
        energy: 0.4 + fibrationComplexity * 0.6,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: theta + phi,
        activationDecay: 0.91 + Math.random() * 0.08,
        isActive: false,
        activationTime: 0,
        size: 1 + fibrationComplexity * 0.9,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateDumbbellOrbital = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 18 === 0 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';

      const theta = Math.acos(2 * (i / nodeCount) - 1);
      const phi = Math.random() * Math.PI * 2;

      const r = radius * (0.7 + 0.3 * Math.sin(theta) ** 2);
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        pulse: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.abs(Math.cos(theta)) * 0.7 + 0.3,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: theta + phi,
        activationDecay: 0.95 + Math.random() * 0.04,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.abs(Math.cos(theta)) * 0.7,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateCloverleafOrbital = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 22 === 0 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';

      const theta = Math.acos(2 * (i / nodeCount) - 1);
      const phi = (i / nodeCount) * Math.PI * 2;

      const r = radius * (0.7 + 0.3 * Math.pow(Math.sin(2 * phi) * Math.sin(theta), 2));
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        pulse: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.abs(Math.sin(2 * phi)) * 0.7 + 0.3,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: phi,
        activationDecay: 0.95 + Math.random() * 0.04,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.abs(Math.sin(2 * phi)) * 0.7,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateToroidalShell = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    const torusRadius = radius * 0.6;
    const tubeRadius = radius * 0.25;
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 20 === 0 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';

      const u = (i / nodeCount) * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const x = (torusRadius + tubeRadius * Math.cos(v)) * Math.cos(u);
      const y = (torusRadius + tubeRadius * Math.cos(v)) * Math.sin(u);
      const z = tubeRadius * Math.sin(v);
      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        pulse: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.abs(Math.sin(v)) * 0.7 + 0.3,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: u + v,
        activationDecay: 0.95 + Math.random() * 0.04,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.abs(Math.sin(v)) * 0.7,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateNeuralNetwork = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    const layers = 5;
    const neuronsPerLayer = Math.floor(nodeCount / layers);

    for (let layer = 0; layer < layers; layer++) {
      const layerNodes =
        layer === layers - 1 ? nodeCount - layer * neuronsPerLayer : neuronsPerLayer;

      for (let n = 0; n < layerNodes; n++) {
        const nodeType =
          Math.random() < 0.15 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';


        const layerSpacing = (radius * 1.6) / (layers - 1);
        const baseZ = -radius * 0.8 + layer * layerSpacing;


        let x, y, z;

        if (layer === 0) {

          const cols = Math.ceil(Math.sqrt(layerNodes));
          const row = Math.floor(n / cols);
          const col = n % cols;
          x = (col - cols / 2) * radius * 0.3 + (Math.random() - 0.5) * 40;
          y = (row - Math.floor(layerNodes / cols) / 2) * radius * 0.3 + (Math.random() - 0.5) * 40;
          z = baseZ + (Math.random() - 0.5) * 60;
        } else if (layer === layers - 1) {

          const angle = (n / layerNodes) * Math.PI * 2;
          const r = radius * 0.2 * (0.5 + Math.random() * 0.5);
          x = r * Math.cos(angle) + (Math.random() - 0.5) * 50;
          y = r * Math.sin(angle) + (Math.random() - 0.5) * 50;
          z = baseZ + (Math.random() - 0.5) * 80;
        } else {

          const clusterCount = 3 + Math.floor(Math.random() * 3);
          const cluster = Math.floor(n / (layerNodes / clusterCount));
          const clusterAngle = (cluster / clusterCount) * Math.PI * 2;
          const clusterRadius = radius * (0.4 + Math.random() * 0.3);


          const clusterX = clusterRadius * Math.cos(clusterAngle);
          const clusterY = clusterRadius * Math.sin(clusterAngle);


          const localRadius = radius * 0.25;
          const localAngle = Math.random() * Math.PI * 2;
          const localDistance = localRadius * Math.sqrt(Math.random());

          x = clusterX + localDistance * Math.cos(localAngle) + (Math.random() - 0.5) * 60;
          y = clusterY + localDistance * Math.sin(localAngle) + (Math.random() - 0.5) * 60;
          z = baseZ + (Math.random() - 0.5) * 100;
        }


        const neuronActivity = 0.3 + Math.random() * 0.7;
        const synapseStrength = Math.random();

        nodes.push({
          x,
          y,
          z,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          vz: (Math.random() - 0.5) * 0.1,
          pulse: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2 + layer * 0.5,
          energy: neuronActivity,
          type: nodeType,
          lastActivation: 0,
          neighbors: [],
          colorShift: (layer * Math.PI) / 3 + Math.random() * 0.5,
          activationDecay: 0.92 + Math.random() * 0.07,
          isActive: false,
          activationTime: 0,
          size: 1 + synapseStrength * 0.8 + (nodeType === 'core' ? 0.5 : 0),
        });
      }
    }


    return { nodes, connections: generateNeuralConnections(nodes, layers, neuronsPerLayer) };
  };


  const generateNeuralConnections = (nodes: Node[], layers: number, neuronsPerLayer: number) => {
    const connections: Connection[] = [];

    for (let layer = 0; layer < layers - 1; layer++) {
      const currentLayerStart = layer * neuronsPerLayer;
      const nextLayerStart = (layer + 1) * neuronsPerLayer;
      const currentLayerSize =
        layer === 0
          ? neuronsPerLayer
          : layer === layers - 2
            ? nodes.length - nextLayerStart + neuronsPerLayer
            : neuronsPerLayer;
      const nextLayerSize = layer === layers - 2 ? nodes.length - nextLayerStart : neuronsPerLayer;


      for (let i = 0; i < currentLayerSize; i++) {
        const currentIndex = currentLayerStart + i;
        if (currentIndex >= nodes.length) break;


        const connectionCount = 2 + Math.floor(Math.random() * 5);
        const targets = new Set<number>();

        for (let c = 0; c < connectionCount && targets.size < nextLayerSize; c++) {
          const targetInLayer = Math.floor(Math.random() * nextLayerSize);
          const targetIndex = nextLayerStart + targetInLayer;

          if (targetIndex < nodes.length && !targets.has(targetIndex)) {
            targets.add(targetIndex);


            const synapticStrength = 0.4 + Math.random() * 0.6;

            connections.push({
              from: currentIndex,
              to: targetIndex,
              strength: synapticStrength,
            });

            nodes[currentIndex].neighbors.push(targetIndex);
            nodes[targetIndex].neighbors.push(currentIndex);
          }
        }
      }
    }


    for (let layer = 1; layer < layers - 1; layer++) {
      const layerStart = layer * neuronsPerLayer;
      const layerSize = layer === layers - 1 ? nodes.length - layerStart : neuronsPerLayer;

      for (let i = 0; i < layerSize; i++) {
        if (Math.random() < 0.3) {

          const currentIndex = layerStart + i;
          const targetInLayer = Math.floor(Math.random() * layerSize);
          const targetIndex = layerStart + targetInLayer;

          if (currentIndex !== targetIndex && targetIndex < nodes.length) {
            const dx = nodes[currentIndex].x - nodes[targetIndex].x;
            const dy = nodes[currentIndex].y - nodes[targetIndex].y;
            const dz = nodes[currentIndex].z - nodes[targetIndex].z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);


            if (distance < 120) {
              connections.push({
                from: currentIndex,
                to: targetIndex,
                strength: 0.2 + Math.random() * 0.3,
              });

              nodes[currentIndex].neighbors.push(targetIndex);
              nodes[targetIndex].neighbors.push(currentIndex);
            }
          }
        }
      }
    }

    return connections;
  };


  const generateDoubleTorus = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    const torusRadius = radius * 0.55;
    const tubeRadius = radius * 0.22;
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 21 === 0 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';

      const u = (i / nodeCount) * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      let x = (torusRadius + tubeRadius * Math.cos(v)) * Math.cos(u);
      const y = (torusRadius + tubeRadius * Math.cos(v)) * Math.sin(u);
      let z = tubeRadius * Math.sin(v);

      if (i % 2 === 0) {
        const temp = x;
        x = z;
        z = temp;
      }
      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        pulse: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.abs(Math.sin(v)) * 0.7 + 0.3,
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: u + v,
        activationDecay: 0.95 + Math.random() * 0.04,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.abs(Math.sin(v)) * 0.7,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateRandomPhase = (nodeCount: number, radius: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = i % 17 === 0 ? 'core' : Math.random() < 0.4 ? 'satellite' : 'pulse';

      const phi = Math.random() * Math.PI * 2;
      const costheta = Math.random() * 2 - 1;
      const theta = Math.acos(costheta);
      const r = radius * Math.cbrt(Math.random());
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);
      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        pulse: Math.random(),
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.random(),
        type: nodeType,
        lastActivation: 0,
        neighbors: [],
        colorShift: Math.random() * Math.PI * 2,
        activationDecay: 0.93 + Math.random() * 0.06,
        isActive: false,
        activationTime: 0,
        size: 1 + Math.random() * 1.2,
      });
    }
    return { nodes, connections: generateConnections(nodes) };
  };


  const generateConnections = (nodes: Node[]) => {
    const connections: Connection[] = [];
    const connectionDistance = 150;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < connectionDistance) {

          if (Math.random() < 0.33) {
            connections.push({
              from: i,
              to: j,
              strength: Math.random() * 0.7 + 0.3,
            });
            nodes[i].neighbors.push(j);
            nodes[j].neighbors.push(i);
          }
        }
      }
    }
    return connections;
  };


  const rotateX = (y: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      y: y * cos - z * sin,
      z: y * sin + z * cos,
    };
  };

  const rotateY = (x: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos + z * sin,
      z: -x * sin + z * cos,
    };
  };


  const project3D = (x: number, y: number, z: number, width: number, height: number) => {


    const distance = Math.sqrt(x * x + y * y + z * z);
    const phi = Math.atan2(y, x);
    const theta = Math.acos(z / distance);


    const radius = Math.tan(theta / 2) * 200;


    const rightOffset = width * 0.25;

    const screenX = width / 2 + radius * Math.cos(phi) * 1.7 + rightOffset;
    const screenY = height / 2 + radius * Math.sin(phi) * 1.7;


    const nodeScale = 1.0;

    return {
      x: screenX,
      y: screenY,
      scale: nodeScale,
      depth: z,
    };
  };


  const getThemeColors = (theme?: string) => {
    const targetTheme = theme || themeName;

    switch (targetTheme) {
      case 'light':
        return {
          node: 'rgba(59, 130, 246, 0.8)',
          nodePulse: 'rgba(59, 130, 246, 1.0)',
          connection: 'rgba(59, 130, 246, 0.4)',
          connectionActive: 'rgba(59, 130, 246, 0.7)',
          gradient1: 'rgba(59, 130, 246, 0.05)',
          gradient2: 'rgba(96, 165, 250, 0.03)',
        };
      case 'dark':
        return {
          node: 'rgba(99, 102, 241, 0.9)',
          nodePulse: 'rgba(139, 92, 246, 1.0)',
          connection: 'rgba(99, 102, 241, 0.5)',
          connectionActive: 'rgba(139, 92, 246, 0.8)',
          gradient1: 'rgba(99, 102, 241, 0.05)',
          gradient2: 'rgba(139, 92, 246, 0.03)',
        };
      case 'neutral':
        return {

          node: 'rgba(0, 166, 215, 0.9)',
          nodePulse: 'rgba(0, 166, 215, 1.0)',
          connection: 'rgba(0, 166, 215, 0.50)',
          connectionActive: 'rgba(0, 166, 215, 0.80)',
          gradient1: 'rgba(0, 166, 215, 0.06)',
          gradient2: 'rgba(0, 166, 215, 0.03)',
        };
      default:
        return {
          node: 'rgba(59, 130, 246, 0.6)',
          nodePulse: 'rgba(59, 130, 246, 1.0)',
          connection: 'rgba(59, 130, 246, 0.25)',
          connectionActive: 'rgba(59, 130, 246, 0.5)',
          gradient1: 'rgba(59, 130, 246, 0.1)',
          gradient2: 'rgba(96, 165, 250, 0.1)',
        };
    }
  };


  const interpolateColor = (fromColor: string, toColor: string, t: number): string => {

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const easedT = easeInOutCubic(t);

    const parseRgba = (color: string) => {
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (!match) return { r: 0, g: 0, b: 0, a: 1 };
      const [r, g, b, a = 1] = match[1].split(',').map(v => parseFloat(v.trim()));
      return { r, g, b, a };
    };

    const from = parseRgba(fromColor);
    const to = parseRgba(toColor);

    const r = Math.round(from.r + (to.r - from.r) * easedT);
    const g = Math.round(from.g + (to.g - from.g) * easedT);
    const b = Math.round(from.b + (to.b - from.b) * easedT);
    const a = from.a + (to.a - from.a) * easedT;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };


  const getCurrentColors = () => {
    const transition = themeTransitionRef.current;

    if (!transition.isTransitioning || !transition.fromColors || !transition.toColors) {
      const colors = getThemeColors();
      return colors;
    }

    const elapsed = performance.now() - transition.startTime;
    const progress = Math.min(elapsed / transition.duration, 1);


    const easeInOutQuart = (t: number): number => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    };

    const easedProgress = easeInOutQuart(progress);

    if (progress >= 1) {
      transition.isTransitioning = false;
      const finalColors = getThemeColors();
      return finalColors;
    }


    const interpolatedColors = {
      node: interpolateColor(transition.fromColors.node, transition.toColors.node, easedProgress),
      nodePulse: interpolateColor(
        transition.fromColors.nodePulse,
        transition.toColors.nodePulse,
        easedProgress
      ),
      connection: interpolateColor(
        transition.fromColors.connection,
        transition.toColors.connection,
        easedProgress
      ),
      connectionActive: interpolateColor(
        transition.fromColors.connectionActive,
        transition.toColors.connectionActive,
        easedProgress
      ),
      gradient1: interpolateColor(
        transition.fromColors.gradient1,
        transition.toColors.gradient1,
        easedProgress
      ),
      gradient2: interpolateColor(
        transition.fromColors.gradient2,
        transition.toColors.gradient2,
        easedProgress
      ),
    };

    return interpolatedColors;
  };


  const morphDuration = 5000;
  const waitDuration = 3000;
  const phaseRef = useRef<'morphing' | 'waiting'>('waiting');
  const morphStartTimeRef = useRef<number>(performance.now());
  const lastMorphNodesRef = useRef<Node[] | null>(null);
  const lastMorphConnectionsRef = useRef<Connection[] | null>(null);
  const lastAnimationTimeRef = useRef<number>(performance.now());
  const lastPhaseChangeRef = useRef<number>(performance.now());


  const NUM_LAYOUTS = 11;
  const layoutsRef = useRef<{ nodes: Node[]; connections: Connection[]; type: string }[]>([]);
  const currentLayoutIdxRef = useRef<number>(0);
  const nextLayoutIdxRef = useRef<number>(1);
  const [currentPhaseName, setCurrentPhaseName] = useState<string>('Initializing');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nodeCount = prefersReducedMotion ? Math.round(202 * 1.2) : Math.round(843 * 1.2);


    if (layoutsRef.current.length === 0) {
      layoutsRef.current = [];
      for (let i = 0; i < NUM_LAYOUTS; i++) {
        const layout = generateMathematicalLayout(i, nodeCount, 300);
        if (layout.nodes.length > 0) {
          let maxIdx = 0;
          for (let j = 1; j < layout.nodes.length; j++) {
            if (layout.nodes[j].size > layout.nodes[maxIdx].size) maxIdx = j;
          }
          layout.nodes[maxIdx].size = 2;
        }
        layoutsRef.current.push(layout);
      }

      nodesARef.current = layoutsRef.current[0].nodes.map(n => ({ ...n }));
      connectionsARef.current = layoutsRef.current[0].connections.map(c => ({ ...c }));
      currentLayoutIdxRef.current = 0;
      nextLayoutIdxRef.current = 1;
      morphStartTimeRef.current = performance.now();
      lastPhaseChangeRef.current = performance.now();
      phaseRef.current = 'waiting';
      setCurrentPhaseName(layoutsRef.current[0].type);
    }
  }, []);


  useEffect(() => {
    if (layoutsRef.current.length === 0) return;


    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      const { width, height } = canvas;
      const colors = getCurrentColors();
      const now = performance.now();


      lastAnimationTimeRef.current = now;


      if (!isDraggingRef.current && autoRotationRef.current.enabled) {
        const autoRotation = autoRotationRef.current;

        rotationRef.current.y += autoRotation.speed;
        rotationRef.current.x = Math.sin(now * 0.0002) * 0.1;


        if (mouseRef.current.isActive) {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow(mouseRef.current.x - centerX, 2) + Math.pow(mouseRef.current.y - centerY, 2)
          );

          if (distanceFromCenter < 200) {
            autoRotation.speed = 0.0008;
          } else {
            autoRotation.speed = 0.0018;
          }
        } else {
          autoRotation.speed = 0.0018;
        }
      }


      const timeSinceLastPhaseChange = now - lastPhaseChangeRef.current;
      if (timeSinceLastPhaseChange > 15000) {

        phaseRef.current = 'waiting';
        morphStartTimeRef.current = now;
        lastPhaseChangeRef.current = now;

      }


      if (phaseRef.current === 'waiting') {
        const waitElapsed = now - morphStartTimeRef.current;
        const waitProgress = Math.min(1, waitElapsed / waitDuration);
        setPhaseProgress(waitProgress * 100);
        setIsTransitioning(false);

        if (waitElapsed > waitDuration) {
          const currentIdx = currentLayoutIdxRef.current;
          const nextIdx = nextLayoutIdxRef.current;


          if (layoutsRef.current[currentIdx] && layoutsRef.current[nextIdx]) {
            lastMorphNodesRef.current = layoutsRef.current[currentIdx].nodes.map(n => ({ ...n }));
            lastMorphConnectionsRef.current = layoutsRef.current[currentIdx].connections.map(c => ({
              ...c,
            }));
            nodesBRef.current = layoutsRef.current[nextIdx].nodes.map(n => ({ ...n }));
            connectionsBRef.current = layoutsRef.current[nextIdx].connections.map(c => ({ ...c }));
            phaseRef.current = 'morphing';
            morphStartTimeRef.current = now;
            lastPhaseChangeRef.current = now;
            setIsTransitioning(true);
          }
        }
      }


      let morphT = 0;
      if (phaseRef.current === 'morphing' && nodesBRef.current && lastMorphNodesRef.current) {
        const t = Math.min(1, (now - morphStartTimeRef.current) / morphDuration);
        setPhaseProgress(t * 100);


        const easeInOutQuint = (t: number): number => {
          return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
        };
        morphT = easeInOutQuint(t);


        if (t > 0.8) {
          const elasticT = (t - 0.8) / 0.2;
          const elasticEffect = Math.sin(elasticT * Math.PI * 2) * 0.02 * (1 - elasticT);
          morphT += elasticEffect;
        }

        if (t >= 1) {

          currentLayoutIdxRef.current = nextLayoutIdxRef.current;
          nextLayoutIdxRef.current = (nextLayoutIdxRef.current + 1) % NUM_LAYOUTS;
          const newPhaseName = layoutsRef.current[currentLayoutIdxRef.current]?.type || 'Unknown';

          setCurrentPhaseName(newPhaseName);
          setPhaseProgress(0);
          setIsTransitioning(false);

          nodesARef.current = nodesBRef.current;
          connectionsARef.current = connectionsBRef.current!;
          nodesBRef.current = null;
          connectionsBRef.current = null;
          lastMorphNodesRef.current = null;
          lastMorphConnectionsRef.current = null;
          phaseRef.current = 'waiting';
          morphStartTimeRef.current = now;
          lastPhaseChangeRef.current = now;
        }
      }


      let renderNodes: Node[] = [];
      let renderConnections: Connection[] = [];
      if (
        phaseRef.current === 'morphing' &&
        nodesBRef.current &&
        lastMorphNodesRef.current &&
        lastMorphConnectionsRef.current &&
        connectionsBRef.current
      ) {
        const minLen = Math.min(lastMorphNodesRef.current.length, nodesBRef.current.length);
        for (let i = 0; i < minLen; i++) {
          const a = lastMorphNodesRef.current[i];
          const b = nodesBRef.current[i];


          const velocitySmoothing = 0.1;
          const smoothedMorphT = morphT + Math.sin(morphT * Math.PI) * velocitySmoothing;
          const finalT = Math.max(0, Math.min(1, smoothedMorphT));


          renderNodes.push({
            ...a,
            x: a.x * (1 - finalT) + b.x * finalT,
            y: a.y * (1 - finalT) + b.y * finalT,
            z: a.z * (1 - finalT) + b.z * finalT,
            vx: a.vx * (1 - finalT) + b.vx * finalT,
            vy: a.vy * (1 - finalT) + b.vy * finalT,
            vz: a.vz * (1 - finalT) + b.vz * finalT,
            colorShift: a.colorShift * (1 - finalT) + b.colorShift * finalT,
            pulse: a.pulse * (1 - finalT) + b.pulse * finalT,
            energy: a.energy * (1 - finalT) + b.energy * finalT,
            size: a.size * (1 - finalT) + b.size * finalT,
            pulsePhase: a.pulsePhase * (1 - finalT) + b.pulsePhase * finalT,
            isActive: finalT < 0.5 ? a.isActive : b.isActive,
            activationTime: a.activationTime * (1 - finalT) + b.activationTime * finalT,
            activationDecay: a.activationDecay * (1 - finalT) + b.activationDecay * finalT,
          });
        }
        const minConn = Math.min(
          lastMorphConnectionsRef.current.length,
          connectionsBRef.current.length
        );
        for (let i = 0; i < minConn; i++) {
          const a = lastMorphConnectionsRef.current[i];
          const b = connectionsBRef.current[i];
          renderConnections.push({
            from: Math.round(a.from * (1 - morphT) + b.from * morphT),
            to: Math.round(a.to * (1 - morphT) + b.to * morphT),
            strength: a.strength * (1 - morphT) + b.strength * morphT,
          });
        }
      } else {
        renderNodes = nodesARef.current;
        renderConnections = connectionsARef.current;
      }

      ctx.save();
      ctx.globalAlpha = 1;
      drawNetwork(ctx, width, height, now * 0.001, renderNodes, renderConnections, colors);
      ctx.restore();


      animationRef.current = requestAnimationFrame(animate);
    };


    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);


    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };
  }, [themeName]);


  function drawNetwork(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    nodes: Node[],
    connections: Connection[],
    colors: any
  ) {
    ctx.clearRect(0, 0, width, height);


    const rightOffset = width * 0.15;
    const bgGradient = ctx.createRadialGradient(
      width / 2 + rightOffset,
      height / 2,
      0,
      width / 2 + rightOffset,
      height / 2,
      Math.max(width, height) / 2
    );
    bgGradient.addColorStop(0, colors.gradient1);
    bgGradient.addColorStop(1, colors.gradient2);

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);


    nodes.forEach(node => {

      const rotation = rotationRef.current;
      let { x, y, z } = node;


      const rotY = rotateY(x, z, rotation.y);
      x = rotY.x;
      z = rotY.z;


      const rotX = rotateX(y, z, rotation.x);
      y = rotX.y;
      z = rotX.z;


      const projected = project3D(x, y, z, width, height);


      if (projected.scale > 0.01) {

        const energyIntensity = node.isActive ? node.energy : 0.3;


        let nodeColor = colors.node;
        let pulseColor = colors.nodePulse;

        if (node.type === 'core') {

          const baseColor = colors.nodePulse;
          const parsed = baseColor
            .match(/rgba?\(([^)]+)\)/)?.[1]
            .split(',')
            .map((v: string) => parseFloat(v.trim())) || [255, 255, 255, 1];
          const [r, g, b] = parsed;

          nodeColor = `rgba(${Math.min(255, r + 50)}, ${Math.max(50, g)}, ${Math.max(50, b)}, ${0.6 + energyIntensity * 0.4})`;
          pulseColor = `rgba(${Math.min(255, r + 30)}, ${Math.max(100, g)}, ${Math.max(100, b)}, ${0.8 + energyIntensity * 0.2})`;
        } else if (node.type === 'pulse') {
          const baseColor = colors.nodePulse;
          const parsed = baseColor
            .match(/rgba?\(([^)]+)\)/)?.[1]
            .split(',')
            .map((v: string) => parseFloat(v.trim())) || [255, 255, 255, 1];
          const [r, g, b] = parsed;

          nodeColor = `rgba(${Math.max(50, r - 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${0.6 + energyIntensity * 0.4})`;
          pulseColor = `rgba(${Math.max(100, r - 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}, ${0.8 + energyIntensity * 0.2})`;
        } else {

          const baseColor = colors.node;
          const parsed = baseColor
            .match(/rgba?\(([^)]+)\)/)?.[1]
            .split(',')
            .map((v: string) => parseFloat(v.trim())) || [255, 255, 255, 1];
          const [r, g, b] = parsed;

          nodeColor = `rgba(${Math.max(50, r - 20)}, ${Math.min(255, g + 20)}, ${Math.max(50, b - 20)}, ${0.6 + energyIntensity * 0.4})`;
          pulseColor = `rgba(${Math.max(100, r)}, ${Math.min(255, g + 10)}, ${Math.max(100, b)}, ${0.8 + energyIntensity * 0.2})`;
        }


        ctx.beginPath();
        const baseRadius = (0.8 + energyIntensity * 0.4) * projected.scale * node.size;
        const pulseRadius = prefersReducedMotion
          ? baseRadius
          : baseRadius + node.pulse * projected.scale * 0.5 * node.size;


        if (node.isActive) {
          const activationRadius =
            pulseRadius * (2 + Math.sin(time * 4 + node.activationTime) * 0.5);
          const activationGradient = ctx.createRadialGradient(
            projected.x,
            projected.y,
            pulseRadius,
            projected.x,
            projected.y,
            activationRadius
          );
          activationGradient.addColorStop(0, pulseColor);
          activationGradient.addColorStop(0.7, `rgba(255, 255, 255, ${node.energy * 0.3})`);
          activationGradient.addColorStop(1, 'transparent');

          ctx.fillStyle = activationGradient;
          ctx.arc(projected.x, projected.y, activationRadius, 0, Math.PI * 2);
          ctx.fill();
        }


        const outerGradient = ctx.createRadialGradient(
          projected.x,
          projected.y,
          0,
          projected.x,
          projected.y,
          pulseRadius * 1.5
        );
        outerGradient.addColorStop(0, pulseColor);
        outerGradient.addColorStop(0.3, nodeColor);
        outerGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = outerGradient;
        ctx.arc(projected.x, projected.y, pulseRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();


        ctx.beginPath();
        const coreGradient = ctx.createRadialGradient(
          projected.x,
          projected.y,
          0,
          projected.x,
          projected.y,
          pulseRadius
        );
        coreGradient.addColorStop(0, node.isActive ? 'rgba(255, 255, 255, 0.9)' : pulseColor);
        coreGradient.addColorStop(1, nodeColor);

        ctx.fillStyle = coreGradient;
        ctx.arc(projected.x, projected.y, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });


    connections.forEach(connection => {
      const nodeA = nodes[connection.from];
      const nodeB = nodes[connection.to];
      if (!nodeA || !nodeB) return;


      const rotation = rotationRef.current;


      let { x: xA, y: yA, z: zA } = nodeA;
      const rotYA = rotateY(xA, zA, rotation.y);
      xA = rotYA.x;
      zA = rotYA.z;
      const rotXA = rotateX(yA, zA, rotation.x);
      yA = rotXA.y;
      zA = rotXA.z;
      const projectedA = project3D(xA, yA, zA, width, height);


      let { x: xB, y: yB, z: zB } = nodeB;
      const rotYB = rotateY(xB, zB, rotation.y);
      xB = rotYB.x;
      zB = rotYB.z;
      const rotXB = rotateX(yB, zB, rotation.x);
      yB = rotXB.y;
      zB = rotXB.z;
      const projectedB = project3D(xB, yB, zB, width, height);


      if (projectedA.scale > 0.01 && projectedB.scale > 0.01) {
        const dx = xA - xB;
        const dy = yA - yB;
        const dz = zA - zB;
        const distance3D = Math.sqrt(dx * dx + dy * dy + dz * dz);


        const mouse = mouseRef.current;
        let mouseInfluence = 1;
        if (mouse.isActive) {
          const midX = (projectedA.x + projectedB.x) / 2;
          const midY = (projectedA.y + projectedB.y) / 2;
          const mouseDistance = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
          const maxMouseDistance = 100;

          if (mouseDistance < maxMouseDistance) {
            mouseInfluence = 1 + ((maxMouseDistance - mouseDistance) / maxMouseDistance) * 2;
          }
        }


        if (distance3D < 200) {


          const distanceOpacity = 1 - distance3D / 200;
          const avgNodeSize = (nodeA.size + nodeB.size) / 2;


          let hierarchyMultiplier = 1.0;
          if (distance3D > 160) {
            hierarchyMultiplier = 0.3;
          } else if (distance3D > 120) {
            hierarchyMultiplier = 0.5;
          } else if (distance3D > 80) {
            hierarchyMultiplier = 0.7;
          } else {
            hierarchyMultiplier = 0.9;
          }


          const sizeInfluence = 0.4 + (avgNodeSize - 1) * 0.6;


          const typeInfluence =
            nodeA.type === 'core' || nodeB.type === 'core'
              ? 1.2
              : nodeA.type === 'pulse' || nodeB.type === 'pulse'
                ? 0.8
                : 1.0;


          const hierarchicalOpacity =
            distanceOpacity *
            connection.strength *
            mouseInfluence *
            hierarchyMultiplier *
            sizeInfluence *
            typeInfluence *
            0.80325;

          const energyFlow = nodeA.isActive || nodeB.isActive ? 1.2 : 0.6;
          const connectionIntensity = hierarchicalOpacity * energyFlow;

          if (nodeA.isActive || nodeB.isActive) {
            const flowPhase = time * 3 + connection.from * 0.5;
            const flowPosition = (Math.sin(flowPhase) + 1) / 2;

            const particleX = projectedA.x + (projectedB.x - projectedA.x) * flowPosition;
            const particleY = projectedA.y + (projectedB.y - projectedA.y) * flowPosition;
            ctx.beginPath();
            const particleGradient = ctx.createRadialGradient(
              particleX,
              particleY,
              0,
              particleX,
              particleY,
              1.5
            );
            particleGradient.addColorStop(0, `rgba(255, 255, 255, ${connectionIntensity})`);
            particleGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = particleGradient;
            ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.beginPath();

          const isHighPriority = distance3D < 120;
          const isMediumPriority = distance3D < 160;

          if (isHighPriority) {

            ctx.strokeStyle = colors.connectionActive.replace(
              /([\d.]+)\)$/g,
              (_: string, p1: string) => `${Math.min(Number(p1) * hierarchicalOpacity, 1)})`
            );
            ctx.lineWidth = 0.5;
          } else if (isMediumPriority) {

            ctx.strokeStyle = colors.connection.replace(
              /([\d.]+)\)$/g,
              (_: string, p1: string) => `${Math.min(Number(p1) * hierarchicalOpacity, 1)})`
            );
            ctx.lineWidth = 0.3;
          } else {

            ctx.strokeStyle = colors.connection.replace(
              /([\d.]+)\)$/g,
              (_: string, p1: string) => `${Math.min(Number(p1) * hierarchicalOpacity * 0.6, 1)})`
            );
            ctx.lineWidth = 0.2;
          }

          ctx.moveTo(projectedA.x, projectedA.y);
          ctx.lineTo(projectedB.x, projectedB.y);
          ctx.stroke();
        }
      }
    });
  }


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;


    const globalStyle = document.createElement('style');
    globalStyle.id = 'neural-unselectable';
    globalStyle.textContent = `
      *, *::before, *::after {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
        cursor: default !important;
      }


      input, textarea, select {
        user-select: text !important;
        -webkit-user-select: text !important;
      }
    `;
    document.head.appendChild(globalStyle);

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };


    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current = {
        x: event.clientX,
        y: event.clientY,
        isActive: true,
      };


      if (isDraggingRef.current) {
        const deltaX = event.clientX - lastMouseRef.current.x;
        const deltaY = event.clientY - lastMouseRef.current.y;


        rotationRef.current.y += deltaX * 0.01;
        rotationRef.current.x += deltaY * 0.01;

        lastMouseRef.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {

        isDraggingRef.current = true;
        lastMouseRef.current = { x: event.clientX, y: event.clientY };
        document.body.style.cursor = 'grabbing';


        autoRotationRef.current.enabled = false;


        const rightOffset = window.innerWidth * 0.15;
        const clickX = (event.clientX - (window.innerWidth / 2 + rightOffset)) * 1.5;
        const clickY = (event.clientY - window.innerHeight / 2) * 1.5;
        const clickZ = 0;

        nodesARef.current.forEach(node => {
          const dx = clickX - node.x;
          const dy = clickY - node.y;
          const dz = clickZ - node.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 180) {

            node.isActive = true;
            node.activationTime = Date.now() * 0.001;
            node.energy = Math.max(0.6, 1.0 - distance / 120);
          }
        });
      } else if (event.button === 2) {

        event.preventDefault();


        nodesARef.current.forEach(node => {
          if (Math.random() < 0.3) {
            node.isActive = true;
            node.activationTime = Date.now() * 0.001;
            node.energy = Math.random() * 0.8 + 0.2;
          }
        });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';


      setTimeout(() => {
        if (!isDraggingRef.current) {
          autoRotationRef.current.enabled = true;
        }
      }, 2000);
    };

    const handleMouseEnter = () => {
      mouseRef.current.isActive = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';


      setTimeout(() => {
        autoRotationRef.current.enabled = true;
      }, 1000);
    };


    resizeCanvas();


    document.body.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mousedown', handleMouseDown);
    document.body.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('contextmenu', e => e.preventDefault());


    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mousedown', handleMouseDown);
      document.body.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('contextmenu', e => e.preventDefault());
      window.removeEventListener('resize', handleResize);
      document.body.style.cursor = 'default';


      const existingStyle = document.getElementById('neural-unselectable');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <CanvasContainer>
      <Canvas ref={canvasRef} />
      <PhaseIndicator>
        Neural Phase: {currentPhaseName}
        <div className="phase-progress">
          {isTransitioning ? 'Morphing...' : 'Stabilizing...'} ({Math.round(phaseProgress)}%)
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${phaseProgress}%` }} />
        </div>
      </PhaseIndicator>
    </CanvasContainer>
  );
};

export default NeuralBackground;
