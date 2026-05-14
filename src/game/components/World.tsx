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

const MAP_RADIUS = 4

const BIOMES: HexBiome[] = [
  { color: '#8f7650', key: 'badlands' },
  { color: '#6e7350', key: 'brush' },
  { color: '#b19a66', key: 'dunes' },
  { color: '#78644a', key: 'highlands' },
]

function resolveBiome(coordinate: HexCoordinate) {
  const index =
    Math.abs(coordinate.q * 17 + coordinate.r * 11 + (coordinate.q + coordinate.r) * 5) %
    BIOMES.length

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

const HEX_MAP = createHexMap(MAP_RADIUS)

export function World({ playerMotion, playerPosition, onPlayerFrame }: WorldProps) {
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

        return (
          <mesh
            castShadow
            data-biome={biome.key}
            key={`${coordinate.q}:${coordinate.r}`}
            name={`hex-tile-${coordinate.q}-${coordinate.r}`}
            position={[position.x, -HEX_TILE_HEIGHT / 2, position.z]}
            receiveShadow
          >
            <cylinderGeometry
              args={[HEX_TILE_RADIUS, HEX_TILE_RADIUS * 1.04, HEX_TILE_HEIGHT, 6]}
            />
            <meshStandardMaterial color={biome.color} roughness={0.94} />
          </mesh>
        )
      })}

      <Player
        facingAngle={playerMotion.facingAngle}
        isMoving={playerMotion.isMoving}
        onFrame={onPlayerFrame}
        position={playerPosition}
      />
      <ThirdPersonCamera target={playerPosition} />
    </>
  )
}
