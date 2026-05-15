import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'

import { Player } from './Player'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import {
  HEX_TILE_HEIGHT,
  HEX_TILE_RADIUS,
  hexToWorldPosition,
} from '../engine/movement'
import { getVisibleTiles, getTileKey } from '../fog-of-war/getVisibleTiles'
import type { HexCoordinate, PlayerMotion, Position3D } from '../types/game'

type WorldProps = {
  playerHex: HexCoordinate
  playerMotion: PlayerMotion
  playerPosition: Position3D
  onPlayerFrame: (delta: number) => void
}

type HexBiome = {
  color: string
  key: string
}

type HexTile = {
  biome: HexBiome
  coordinate: HexCoordinate
}

type TreeScenery = {
  canopyColor: string
  offsetX: number
  offsetZ: number
  scale: number
  trunkHeight: number
}

type GrassClumpScenery = {
  accentColor: string
  bladeColor: string
  offsetX: number
  offsetZ: number
  scale: number
}

const BIOMES: HexBiome[] = [
  { color: '#8f7650', key: 'badlands' },
  { color: '#6e7350', key: 'brush' },
  { color: '#b19a66', key: 'dunes' },
  { color: '#78644a', key: 'highlands' },
]

const TREE_BIOMES = new Set(['brush', 'highlands'])

function resolveBiome(coordinate: HexCoordinate) {
  const index = Math.abs(coordinate.q * 7 + coordinate.r * 13) % BIOMES.length

  return BIOMES[index]
}

function createHexMap(center: HexCoordinate, radius: number): HexTile[] {
  const tiles: HexTile[] = []

  for (let q = -radius; q <= radius; q += 1) {
    const minR = Math.max(-radius, -q - radius)
    const maxR = Math.min(radius, -q + radius)

    for (let r = minR; r <= maxR; r += 1) {
      const coordinate = { q: center.q + q, r: center.r + r }

      tiles.push({
        biome: resolveBiome(coordinate),
        coordinate,
      })
    }
  }

  return tiles
}

function resolveTreeScenery({ biome, coordinate }: HexTile): TreeScenery | null {
  if (!TREE_BIOMES.has(biome.key)) {
    return null
  }

  if (coordinate.q === 0 && coordinate.r === 0) {
    return null
  }

  const seed =
    Math.abs(coordinate.q * 37 + coordinate.r * 19 + (coordinate.q + coordinate.r) * 13) + 1

  if (seed % 3 !== 0) {
    return null
  }

  const canopyColor = biome.key === 'brush' ? '#7b8751' : '#5f754f'
  const scale = 0.9 + (seed % 3) * 0.12
  const trunkHeight = 0.74 + (seed % 2) * 0.14
  const offsetX = ((seed % 5) - 2) * 0.08
  const offsetZ = ((Math.floor(seed / 5) % 5) - 2) * 0.08

  return {
    canopyColor,
    offsetX,
    offsetZ,
    scale,
    trunkHeight,
  }
}

function resolveGrassClumpScenery({ biome, coordinate }: HexTile): GrassClumpScenery | null {
  if (coordinate.q === 0 && coordinate.r === 0) {
    return null
  }

  const seed =
    Math.abs(coordinate.q * 29 + coordinate.r * 41 + (coordinate.q - coordinate.r) * 17) + 1

  if (seed % 3 !== 0) {
    return null
  }

  const paletteByBiome: Record<string, Pick<GrassClumpScenery, 'accentColor' | 'bladeColor'>> = {
    badlands: { accentColor: '#8c8a5a', bladeColor: '#6f7444' },
    brush: { accentColor: '#7b9154', bladeColor: '#5e7b41' },
    dunes: { accentColor: '#a89e68', bladeColor: '#8d8a4f' },
    highlands: { accentColor: '#6f8a54', bladeColor: '#537042' },
  }

  const palette = paletteByBiome[biome.key] ?? paletteByBiome.brush

  return {
    accentColor: palette.accentColor,
    bladeColor: palette.bladeColor,
    offsetX: ((seed % 7) - 3) * 0.09,
    offsetZ: ((Math.floor(seed / 7) % 7) - 3) * 0.09,
    scale: 0.72 + (seed % 4) * 0.08,
  }
}

const MAP_RADIUS = 6

export function World({ playerHex, playerMotion, playerPosition, onPlayerFrame }: WorldProps) {
  useFrame((_, delta) => {
    onPlayerFrame(delta)
  })

  const hexMap = useMemo(() => createHexMap(playerHex, MAP_RADIUS), [playerHex])

  const visibleTiles = useMemo(() => {
    return getVisibleTiles({
      playerCoordinate: playerHex,
      visionRange: 3,
    })
  }, [playerHex])

  return (
    <>
      <color attach="background" args={['#9fb4b2']} />
      <fog attach="fog" args={['#9fb4b2', 12, 28]} />
      <ambientLight intensity={0.92} color="#f3ead4" />
      <hemisphereLight args={['#d9e8e2', '#75664d', 0.62]} />
      <directionalLight
        castShadow
        color="#fff5de"
        intensity={1.45}
        position={[9, 13, 8]}
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

      {hexMap.map(({ biome, coordinate }) => {
        const position = hexToWorldPosition(coordinate)
        const tree = resolveTreeScenery({ biome, coordinate })
        const grassClump = resolveGrassClumpScenery({ biome, coordinate })
        const isVisible = visibleTiles.has(getTileKey(coordinate.q, coordinate.r))

        return (
          <group key={`${coordinate.q}:${coordinate.r}`} name={`world-cell-${coordinate.q}-${coordinate.r}`}>
            <mesh
              castShadow
              data-biome={biome.key}
              name={`hex-tile-${coordinate.q}-${coordinate.r}`}
              position={[position.x, -HEX_TILE_HEIGHT / 2, position.z]}
              receiveShadow
            >
              <cylinderGeometry
                args={[HEX_TILE_RADIUS, HEX_TILE_RADIUS * 1.04, HEX_TILE_HEIGHT, 6]}
              />
              <meshStandardMaterial 
                color={biome.color} 
                roughness={0.94}
              />
            </mesh>

            {!isVisible && (
              <mesh
                position={[position.x, HEX_TILE_HEIGHT / 2, position.z]}
              >
                <cylinderGeometry
                  args={[HEX_TILE_RADIUS, HEX_TILE_RADIUS, HEX_TILE_HEIGHT * 2, 6]}
                />
                <meshStandardMaterial 
                  color="#b3c6c3" 
                  roughness={1}
                  transparent={true}
                  opacity={0.85}
                />
              </mesh>
            )}

            {tree ? (
              <group
                data-scenery="tree"
                name={`world-tree-${coordinate.q}-${coordinate.r}`}
                position={[position.x + tree.offsetX, 0, position.z + tree.offsetZ]}
                scale={tree.scale}
                visible={isVisible}
              >
                <mesh castShadow position={[0, tree.trunkHeight / 2, 0]}>
                  <cylinderGeometry args={[0.08, 0.11, tree.trunkHeight, 7]} />
                  <meshStandardMaterial color="#5c4631" roughness={0.94} />
                </mesh>
                <mesh castShadow position={[0, tree.trunkHeight + 0.28, 0]}>
                  <coneGeometry args={[0.34, 0.56, 8]} />
                  <meshStandardMaterial color={tree.canopyColor} roughness={0.96} />
                </mesh>
                <mesh castShadow position={[0, tree.trunkHeight + 0.62, 0]}>
                  <coneGeometry args={[0.24, 0.42, 8]} />
                  <meshStandardMaterial color="#8f9b62" roughness={0.94} />
                </mesh>
              </group>
            ) : null}

            {grassClump ? (
              <group
                data-scenery="grass-clump"
                name={`world-grass-${coordinate.q}-${coordinate.r}`}
                position={[position.x + grassClump.offsetX, HEX_TILE_HEIGHT / 2 - 0.02, position.z + grassClump.offsetZ]}
                scale={grassClump.scale}
                visible={isVisible}
              >
                <mesh castShadow position={[-0.08, 0.18, 0.02]} rotation={[0.08, 0.18, 0.2]}>
                  <coneGeometry args={[0.045, 0.32, 5]} />
                  <meshStandardMaterial color={grassClump.bladeColor} roughness={0.96} />
                </mesh>
                <mesh castShadow position={[0.05, 0.16, -0.04]} rotation={[-0.12, -0.22, -0.1]}>
                  <coneGeometry args={[0.04, 0.28, 5]} />
                  <meshStandardMaterial color={grassClump.accentColor} roughness={0.95} />
                </mesh>
                <mesh castShadow position={[0, 0.21, 0.06]} rotation={[0.14, 0.06, -0.18]}>
                  <coneGeometry args={[0.042, 0.34, 5]} />
                  <meshStandardMaterial color={grassClump.bladeColor} roughness={0.94} />
                </mesh>
              </group>
            ) : null}
          </group>
        )
      })}

      <Player
        isMoving={playerMotion.isMoving}
        position={[playerPosition.x, playerPosition.y, playerPosition.z]}
        rotation={[0, playerMotion.facingAngle, 0]}
        scale={0.3}
      />
      <ThirdPersonCamera target={playerPosition} />
    </>
  )
}
