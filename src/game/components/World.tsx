export function World() {
  return (
    <>
      <color attach="background" args={['#d6e4f0']} />
      <ambientLight intensity={0.7} />
      <directionalLight castShadow intensity={1.2} position={[6, 10, 4]} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#7ca982" />
      </mesh>

      <mesh castShadow position={[0, 0, 0]}>
        <capsuleGeometry args={[0.45, 1.1, 6, 12]} />
        <meshStandardMaterial color="#2f4858" />
      </mesh>
    </>
  )
}
