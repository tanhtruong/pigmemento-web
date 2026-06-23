import { View } from '@react-three/drei';

/**
 * Dev-only proof (PIG-159) that a SECOND scene renders through the one shared
 * landing canvas — a small box, bottom-left, that is a distinct `<View>` from
 * the Act. It exists only to demonstrate the shared-context architecture for the
 * slice-0 go/no-go; slice #161 (the specimen stage) replaces it with the real
 * second set-piece. Mounted behind `import.meta.env.DEV`, never in production.
 *
 * `r3f-*` named + lazy so three/r3f/drei stay in the quarantined chunk.
 */
export default function PlaceholderView() {
  return (
    <View
      aria-hidden
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        width: 64,
        height: 64,
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={1.4} />
      <mesh rotation={[0.5, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#b98a5e" />
      </mesh>
    </View>
  );
}
