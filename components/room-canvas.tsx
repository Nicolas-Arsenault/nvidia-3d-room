"use client";

import { Canvas, ThreeEvent, useLoader } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, OrbitControls, RoundedBox } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import type { RoomObject, RoomSpec } from "@/lib/room-schema";

type Props = {
  room: RoomSpec;
  panoramaUrl?: string;
  mode: "design" | "panorama";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function Selection({ selected }: { selected: boolean }) {
  if (!selected) return null;
  return (
    <mesh scale={1.07}>
      <boxGeometry />
      <meshBasicMaterial color="#d9ff66" wireframe transparent opacity={0.85} />
    </mesh>
  );
}

function Furniture({ object, selected, onSelect }: { object: RoomObject; selected: boolean; onSelect: () => void }) {
  const common = {
    position: object.position as [number, number, number],
    rotation: [0, object.rotation, 0] as [number, number, number],
    onClick: (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      onSelect();
    },
  };

  if (object.type === "sofa") {
    const [w, h, d] = object.scale;
    return (
      <group {...common}>
        <RoundedBox args={[w, h * 0.52, d]} radius={0.12} smoothness={4} position={[0, -h * 0.18, 0]}>
          <meshStandardMaterial color={object.color} roughness={0.82} />
        </RoundedBox>
        <RoundedBox args={[w, h * 0.62, d * 0.28]} radius={0.12} smoothness={4} position={[0, h * 0.23, -d * 0.38]}>
          <meshStandardMaterial color={object.color} roughness={0.82} />
        </RoundedBox>
        <RoundedBox args={[w * 0.08, h * 0.58, d * 0.9]} radius={0.08} position={[-w * 0.48, h * 0.02, 0]}>
          <meshStandardMaterial color={object.color} roughness={0.82} />
        </RoundedBox>
        <RoundedBox args={[w * 0.08, h * 0.58, d * 0.9]} radius={0.08} position={[w * 0.48, h * 0.02, 0]}>
          <meshStandardMaterial color={object.color} roughness={0.82} />
        </RoundedBox>
        <Selection selected={selected} />
      </group>
    );
  }

  if (object.type === "table") {
    const [w, h, d] = object.scale;
    return (
      <group {...common}>
        <RoundedBox args={[w, h, d]} radius={0.07} smoothness={4}>
          <meshStandardMaterial color={object.color} roughness={0.55} />
        </RoundedBox>
        {[[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].map(([x, z]) => (
          <mesh key={`${x}-${z}`} position={[x * w, -0.24, z * d]}>
            <cylinderGeometry args={[0.035, 0.045, 0.5, 12]} />
            <meshStandardMaterial color="#554236" />
          </mesh>
        ))}
        <Selection selected={selected} />
      </group>
    );
  }

  if (object.type === "rug") {
    return (
      <group {...common}>
        <RoundedBox args={object.scale} radius={0.08} smoothness={4}>
          <meshStandardMaterial color={object.color} roughness={1} />
        </RoundedBox>
        <Selection selected={selected} />
      </group>
    );
  }

  if (object.type === "plant") {
    return (
      <group {...common}>
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.28, 0.21, 0.55, 18]} />
          <meshStandardMaterial color="#b06f4e" roughness={0.85} />
        </mesh>
        {[0, 1, 2, 3, 4].map((index) => (
          <mesh key={index} position={[Math.sin(index * 2.2) * 0.18, 0.22 + index * 0.09, Math.cos(index * 2.2) * 0.18]} rotation={[0, index, 0.35]}>
            <sphereGeometry args={[0.16, 10, 10]} />
            <meshStandardMaterial color={object.color} roughness={0.9} />
          </mesh>
        ))}
        <Selection selected={selected} />
      </group>
    );
  }

  if (object.type === "lamp") {
    return (
      <group {...common}>
        <mesh position={[0, -0.65, 0]}>
          <cylinderGeometry args={[0.22, 0.28, 0.1, 24]} />
          <meshStandardMaterial color="#292a28" metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.75, 12]} />
          <meshStandardMaterial color="#292a28" metalness={0.55} />
        </mesh>
        <mesh position={[0, 0.94, 0]}>
          <coneGeometry args={[0.35, 0.5, 24, 1, true]} />
          <meshStandardMaterial color={object.color} emissive={object.color} emissiveIntensity={0.12} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 0.8, 0]} intensity={5} distance={3} color="#ffd9a0" />
        <Selection selected={selected} />
      </group>
    );
  }

  return (
    <group {...common}>
      <RoundedBox args={object.scale} radius={0.08} smoothness={4}>
        <meshStandardMaterial color={object.color} />
      </RoundedBox>
      <Selection selected={selected} />
    </group>
  );
}

function Room({ room, selectedId, onSelect }: Omit<Props, "panoramaUrl" | "mode">) {
  const { width, depth, height } = room.dimensions;
  return (
    <>
      <color attach="background" args={["#cbc7bd"]} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 8, 5]} intensity={2.4} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={() => onSelect(null)}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={room.surfaces.floorColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={room.surfaces.wallColor} roughness={0.95} />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={room.surfaces.wallColor} roughness={0.95} />
      </mesh>
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={room.surfaces.wallColor} roughness={0.95} />
      </mesh>
      <mesh position={[1.2, 1.6, -depth / 2 + 0.015]}>
        <planeGeometry args={[1.8, 1.45]} />
        <meshStandardMaterial color="#bcd5dc" emissive="#8fc5d5" emissiveIntensity={0.16} />
      </mesh>
      {room.objects.map((object) => (
        <Furniture key={object.id} object={object} selected={selectedId === object.id} onSelect={() => onSelect(object.id)} />
      ))}
      <Grid position={[0, 0.012, 0]} args={[width, depth]} cellSize={0.5} cellThickness={0.35} cellColor="#ffffff" sectionSize={2} sectionThickness={0.65} sectionColor="#ffffff" fadeDistance={12} fadeStrength={2} infiniteGrid={false} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.25} scale={12} blur={2.4} far={5} />
      <Environment preset="apartment" />
      <OrbitControls makeDefault minDistance={3.5} maxDistance={11} maxPolarAngle={Math.PI / 2.05} target={[0, 0.75, 0]} />
    </>
  );
}

function PanoramaSphere({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <>
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[8, 64, 40]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      <OrbitControls makeDefault enablePan={false} enableZoom={false} rotateSpeed={-0.35} target={[0, 0, 0.01]} />
    </>
  );
}

export function RoomCanvas(props: Props) {
  return (
    <Canvas shadows camera={{ position: [6.6, 5.1, 7.2], fov: 42 }} dpr={[1, 1.7]}>
      <Suspense fallback={null}>
        {props.mode === "panorama" && props.panoramaUrl ? (
          <PanoramaSphere url={props.panoramaUrl} />
        ) : (
          <Room room={props.room} selectedId={props.selectedId} onSelect={props.onSelect} />
        )}
      </Suspense>
    </Canvas>
  );
}
