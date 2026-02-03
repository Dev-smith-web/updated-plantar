"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Cylinder, Text } from "@react-three/drei"
import * as THREE from "three"
import type { PlantType, PlantPart } from "./plant-explorer"

type PlantSceneProps = {
  plant: PlantType
  onPartClick: (part: PlantPart) => void
  isRotating: boolean
  showLabels: boolean
}

export default function PlantScene({ plant, onPartClick, isRotating, showLabels }: PlantSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)

  useFrame((state) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += 0.002
    }
  })

  const isHovered = (partId: string) => hoveredPart === partId

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Ground with grass texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color="#7CB342" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Soil mound */}
      <mesh position={[0, -1.8, 0]} receiveShadow>
        <sphereGeometry args={[1.2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#6D4C41" roughness={1} />
      </mesh>

      {/* SUNFLOWER */}
      {plant.id === "sunflower" && (
        <>
          {/* Root System */}
          <group
            onClick={() => onPartClick(plant.parts[5])}
            onPointerOver={() => setHoveredPart("roots")}
            onPointerOut={() => setHoveredPart(null)}
          >
            {/* Main taproot */}
            <Cylinder args={[0.08, 0.04, 2.5, 16]} position={[0, -2.8, 0]}>
              <meshStandardMaterial
                color={isHovered("roots") ? "#A1887F" : "#795548"}
                roughness={0.95}
                emissive={isHovered("roots") ? "#FF6B35" : "#000000"}
                emissiveIntensity={isHovered("roots") ? 0.4 : 0}
              />
            </Cylinder>
            {/* Lateral roots */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2
              const length = 1.2 + Math.random() * 0.5
              return (
                <Cylinder
                  key={i}
                  args={[0.04, 0.02, length, 12]}
                  position={[Math.sin(angle) * 0.4, -2.5 - length / 2, Math.cos(angle) * 0.4]}
                  rotation={[Math.PI / 2.5, 0, angle]}
                >
                  <meshStandardMaterial
                    color={isHovered("roots") ? "#A1887F" : "#795548"}
                    roughness={0.95}
                    emissive={isHovered("roots") ? "#FF6B35" : "#000000"}
                    emissiveIntensity={isHovered("roots") ? 0.4 : 0}
                  />
                </Cylinder>
              )
            })}
            {showLabels && (
              <Text position={[0, -3.5, 0]} fontSize={0.3} color="#795548" anchorX="center" anchorY="middle">
                Roots
              </Text>
            )}
          </group>

          {/* Main Stem */}
          <group
            onClick={() => onPartClick(plant.parts[4])}
            onPointerOver={() => setHoveredPart("stem")}
            onPointerOut={() => setHoveredPart(null)}
          >
            <Cylinder args={[0.18, 0.25, 5, 24]} position={[0, 0.5, 0]}>
              <meshStandardMaterial
                color={isHovered("stem") ? "#9CCC65" : "#8BC34A"}
                roughness={0.8}
                emissive={isHovered("stem") ? "#FF6B35" : "#000000"}
                emissiveIntensity={isHovered("stem") ? 0.3 : 0}
              />
            </Cylinder>
            {/* Stem texture lines */}
            {[...Array(8)].map((_, i) => (
              <Cylinder
                key={i}
                args={[0.19, 0.26, 5, 24]}
                position={[0, 0.5, 0]}
                rotation={[0, (i / 8) * Math.PI * 2, 0]}
              >
                <meshStandardMaterial color="#7CB342" roughness={0.9} transparent opacity={0.3} depthWrite={false} />
              </Cylinder>
            ))}
            {showLabels && (
              <Text position={[1, 1, 0]} fontSize={0.3} color="#8BC34A" anchorX="center" anchorY="middle">
                Stem
              </Text>
            )}
          </group>

          {/* Leaves */}
          <group
            onClick={() => onPartClick(plant.parts[3])}
            onPointerOver={() => setHoveredPart("leaves")}
            onPointerOut={() => setHoveredPart(null)}
          >
            {[...Array(8)].map((_, i) => {
              const height = -0.5 + i * 0.7
              const angle = (i / 8) * Math.PI * 2 + Math.PI / 8
              const size = 0.8 - i * 0.05
              return (
                <group key={i} position={[0, height, 0]} rotation={[0, angle, 0]}>
                  {/* Leaf blade */}
                  <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 6]}>
                    <sphereGeometry args={[size * 0.6, 16, 16, 0, Math.PI]} />
                    <meshStandardMaterial
                      color={isHovered("leaves") ? "#66BB6A" : "#4CAF50"}
                      roughness={0.6}
                      side={THREE.DoubleSide}
                      emissive={isHovered("leaves") ? "#FF6B35" : "#000000"}
                      emissiveIntensity={isHovered("leaves") ? 0.3 : 0}
                    />
                  </mesh>
                  {/* Leaf veins */}
                  <Cylinder args={[0.02, 0.02, size * 0.8, 8]} position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <meshStandardMaterial color="#2E7D32" roughness={0.8} />
                  </Cylinder>
                </group>
              )
            })}
            {showLabels && (
              <Text position={[-1.5, 1.5, 0]} fontSize={0.3} color="#4CAF50" anchorX="center" anchorY="middle">
                Leaves
              </Text>
            )}
          </group>

          {/* Flower Head */}
          <group position={[0, 3.5, 0]}>
            {/* Disk Florets (Center) */}
            <group
              onClick={() => onPartClick(plant.parts[2])}
              onPointerOver={() => setHoveredPart("center")}
              onPointerOut={() => setHoveredPart(null)}
            >
              <Sphere args={[0.6, 32, 32]}>
                <meshStandardMaterial
                  color={isHovered("center") ? "#A1887F" : "#8B4513"}
                  roughness={0.9}
                  emissive={isHovered("center") ? "#FF6B35" : "#000000"}
                  emissiveIntensity={isHovered("center") ? 0.4 : 0}
                />
              </Sphere>
              {/* Seed pattern */}
              <SpiralSeeds isHovered={isHovered("center")} />
              {showLabels && (
                <Text position={[0, 0, 1.2]} fontSize={0.25} color="#8B4513" anchorX="center" anchorY="middle">
                  Center
                </Text>
              )}
            </group>

            {/* Ray Florets (Petals) */}
            <group
              onClick={() => onPartClick(plant.parts[1])}
              onPointerOver={() => setHoveredPart("petals")}
              onPointerOut={() => setHoveredPart(null)}
            >
              {[...Array(21)].map((_, i) => {
                const angle = (i / 21) * Math.PI * 2
                const radius = 0.65
                return (
                  <group key={i} position={[0, 0, 0]} rotation={[0, angle, 0]}>
                    <mesh position={[radius + 0.4, 0, 0]} rotation={[0, 0, 0]}>
                      <sphereGeometry args={[0.35, 16, 16, 0, Math.PI, 0, Math.PI]} />
                      <meshStandardMaterial
                        color={isHovered("petals") ? "#FFD54F" : "#FFC107"}
                        roughness={0.4}
                        side={THREE.DoubleSide}
                        emissive={isHovered("petals") ? "#FF6B35" : "#FFEB3B"}
                        emissiveIntensity={isHovered("petals") ? 0.5 : 0.2}
                      />
                    </mesh>
                    {/* Petal vein */}
                    <Cylinder
                      args={[0.02, 0.03, 0.6, 8]}
                      position={[radius + 0.3, 0, 0]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <meshStandardMaterial color="#FFA000" roughness={0.6} />
                    </Cylinder>
                  </group>
                )
              })}
              {showLabels && (
                <Text position={[1.8, 0, 0]} fontSize={0.25} color="#FFC107" anchorX="center" anchorY="middle">
                  Petals
                </Text>
              )}
            </group>

            {/* Flower receptacle */}
            <Cylinder args={[0.65, 0.4, 0.3, 32]} position={[0, -0.15, 0]}>
              <meshStandardMaterial color="#7CB342" roughness={0.7} />
            </Cylinder>
          </group>

          {/* Bees flying around */}
          <FloatingBee position={[2, 3, 1]} />
          <FloatingBee position={[-1.5, 3.5, -1]} delay={1} />
        </>
      )}

      {/* Ambient particles */}
      {[...Array(15)].map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}
    </group>
  )
}

// Spiral seed pattern component
function SpiralSeeds({ isHovered }: { isHovered: boolean }) {
  const seeds = useMemo(() => {
    const seedArray = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians

    for (let i = 0; i < 150; i++) {
      const theta = i * goldenAngle
      const r = 0.05 * Math.sqrt(i)
      const x = r * Math.cos(theta)
      const z = r * Math.sin(theta)
      const y = Math.sqrt(0.6 * 0.6 - r * r) // Project onto sphere
      seedArray.push({ x, y, z, scale: 0.03 + Math.random() * 0.02 })
    }
    return seedArray
  }, [])

  return (
    <>
      {seeds.map((seed, i) => (
        <Sphere key={i} args={[seed.scale, 8, 8]} position={[seed.x, seed.y, seed.z]}>
          <meshStandardMaterial
            color={isHovered ? "#6D4C41" : "#5D4037"}
            roughness={0.9}
            emissive={isHovered ? "#FF6B35" : "#000000"}
            emissiveIntensity={isHovered ? 0.3 : 0}
          />
        </Sphere>
      ))}
    </>
  )
}

// Floating bee component
function FloatingBee({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay
      ref.current.position.x = position[0] + Math.sin(t * 0.5) * 1.5
      ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.5
      ref.current.position.z = position[2] + Math.cos(t * 0.5) * 1.5
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.5
    }
  })

  return (
    <group ref={ref}>
      {/* Bee body */}
      <Sphere args={[0.08, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#FFD700" roughness={0.6} />
      </Sphere>
      <Sphere args={[0.06, 16, 16]} position={[0.1, 0, 0]}>
        <meshStandardMaterial color="#000000" roughness={0.8} />
      </Sphere>
      {/* Wings */}
      <mesh position={[0, 0.05, 0.08]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.12, 0.08]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, -0.08]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.12, 0.08]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// Floating particle component
function FloatingParticle({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const offset = Math.random() * Math.PI * 2
  const radius = 2 + Math.random() * 3

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + offset) * 2 + 3
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.3 + offset) * radius
      ref.current.position.z = Math.cos(state.clock.elapsedTime * 0.3 + offset) * radius
    }
  })

  return (
    <Sphere ref={ref} args={[0.04, 8, 8]} position={[0, 0, 0]}>
      <meshStandardMaterial color="#FFEB3B" emissive="#FFD700" emissiveIntensity={0.8} transparent opacity={0.6} />
    </Sphere>
  )
}
