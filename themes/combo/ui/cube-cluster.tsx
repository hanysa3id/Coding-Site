/**
 * 3D isometric cube cluster — pure CSS via `.theme-combo .combo-3d-*`.
 *
 * 8 cubes arranged in a 2×2×2 grid that rotates around the Y axis. Each cube
 * has 6 colored faces with subtle inner highlights so they catch the light.
 */
export function CubeCluster() {
  return (
    <div className="combo-3d-scene" aria-hidden>
      <div className="combo-3d-ring" />
      <div className="combo-3d-group">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`combo-cube c${i + 1}`}>
            <span className="face f-front" />
            <span className="face f-back" />
            <span className="face f-right" />
            <span className="face f-left" />
            <span className="face f-top" />
            <span className="face f-bottom" />
          </div>
        ))}
      </div>
    </div>
  );
}
