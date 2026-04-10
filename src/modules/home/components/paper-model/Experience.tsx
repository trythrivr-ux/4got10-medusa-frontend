"use client";

import { OrbitControls, Sky } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import { Paper } from "./Paper";

interface ExperienceProps {
  currentState?: number;
  scrollProgress?: number;
  bendAmount?: number;
  frontCover?: string;
  backCover?: string;
}

export const Experience = ({ currentState, scrollProgress, bendAmount = 0, frontCover, backCover }: ExperienceProps) => {
  return (
    <>
      {/* Sky removed for transparent background */}
      
      <Physics gravity={[0, -9.81, 0]} iterations={10}>
        <Paper currentState={currentState} scrollProgress={scrollProgress} bendAmount={bendAmount} frontCover={frontCover} backCover={backCover} />
      </Physics>
      {/* <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} /> */}
      
      {/* Enhanced lighting setup */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={3}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0001}
      />
      
      <directionalLight
        position={[-3, 4, -3]}
        intensity={1.5}
        color="#b3d9ff"
      />
      
      <directionalLight
        position={[0, 2, -5]}
        intensity={1}
        color="#ffffff"
      />
      
      <ambientLight intensity={0.4} color="#ffffff" />
      
      <hemisphereLight
        args={["#87CEEB", "#ffffff", 0.6]}
        position={[0, 10, 0]}
      />
      
      <directionalLight
        position={[0, 3, 2]}
        intensity={4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-camera-near={0.1}
        shadow-camera-far={10}
        shadow-bias={-0.0001}
      />
      
      <directionalLight
        position={[-2, 2, 1]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <ambientLight intensity={0.2} />
    </>
  );
};
