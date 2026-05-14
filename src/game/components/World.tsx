import { useFrame } from '@react-three/fiber'

import { Player } from './Player'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import {
  HEX_TILE_HEIGHT,
  HEX_TILE_RADIUS,
  hexToWorldPosition,
} from '../engine/movement'
import type { HexCoordinate, PlayerMotion, Position3D } from '../types/game'

type WorldProps = {
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

const MAP_RADIUS = 4

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

function createHexMap(radius: number): HexTile[] {
  const tiles: HexTile[] = []

  for (let q = -radius; q <= radius; q += 1) {
    const minR = Math.max(-radius, -q - radius)
    const maxR = Math.min(radius, -q + radius)

    for (let r = minR; r <= maxR; r += 1) {
      const coordinate = { q, r }

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

const HEX_MAP = createHexMap(MAP_RADIUS)

export function World({ playerMotion, playerPosition, onPlayerFrame }: WorldProps) {
  useFrame((_, delta) => {
    onPlayerFrame(delta)
  })

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

      {HEX_MAP.map(({ biome, coordinate }) => {
        const position = hexToWorldPosition(coordinate)
        const tree = resolveTreeScenery({ biome, coordinate })

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
              <meshStandardMaterial color={biome.color} roughness={0.94} />
            </mesh>

            {tree ? (
              <group
                data-scenery="tree"
                name={`world-tree-${coordinate.q}-${coordinate.r}`}
                position={[position.x + tree.offsetX, 0, position.z + tree.offsetZ]}
                scale={tree.scale}
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
          </group>
        )
      })}

      <Player
        animationName={playerMotion.isMoving ? 'Walk' : undefined}
        position={[playerPosition.x, playerPosition.y, playerPosition.z]}
        rotation={[0, playerMotion.facingAngle, 0]}
        scale={0.3}
      />
      <ThirdPersonCamera target={playerPosition} />
    </>
  )
}
