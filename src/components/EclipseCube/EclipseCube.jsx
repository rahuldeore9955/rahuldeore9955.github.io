import { useCallback, useLayoutEffect, useRef } from 'react';
import './EclipseCube.css';

const FACES = ['front', 'back', 'right', 'left', 'top', 'bottom'];

const DRAG_SENSITIVITY = 0.5; // degrees per pixel dragged
const KEY_STEP = 10;          // degrees per arrow-key press

/**
 * A solid black 3D cube on a black background.
 * Drag (mouse, touch or pen) to rotate; arrow keys also rotate it when focused.
 */
export default function EclipseCube({ size = 200, initialRotation = { x: -20, y: 30 } }) {
  const cubeRef = useRef(null);
  const rotation = useRef({ x: initialRotation.x, y: initialRotation.y });
  const drag = useRef({ pointerId: null, lastX: 0, lastY: 0 });

  // Rotation updates go straight to the DOM so dragging never re-renders React.
  const applyRotation = useCallback(() => {
    const { x, y } = rotation.current;
    if (cubeRef.current) {
      cubeRef.current.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
    }
  }, []);

  useLayoutEffect(() => {
    applyRotation();
  }, [applyRotation]);

  const handlePointerDown = (e) => {
    drag.current = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY };
    // Pointer capture keeps the drag reliable even if the pointer leaves the cube.
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const d = drag.current;
    if (e.pointerId !== d.pointerId) return;

    // Horizontal movement turns the cube left/right; vertical movement tilts it.
    rotation.current.y += (e.clientX - d.lastX) * DRAG_SENSITIVITY;
    rotation.current.x -= (e.clientY - d.lastY) * DRAG_SENSITIVITY;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    applyRotation();
  };

  const stopDragging = (e) => {
    if (e.pointerId !== drag.current.pointerId) return;
    drag.current.pointerId = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e) => {
    const r = rotation.current;
    switch (e.key) {
      case 'ArrowLeft':  r.y -= KEY_STEP; break;
      case 'ArrowRight': r.y += KEY_STEP; break;
      case 'ArrowUp':    r.x += KEY_STEP; break;
      case 'ArrowDown':  r.x -= KEY_STEP; break;
      default: return;
    }
    e.preventDefault();
    applyRotation();
  };

  return (
    <section className="eclipse-scene" aria-label="Interactive 3D cube">
      <div
        ref={cubeRef}
        className="eclipse-cube"
        style={{ '--cube-size': `${size}px` }}
        role="img"
        aria-label="3D cube. Drag or use the arrow keys to rotate it."
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onKeyDown={handleKeyDown}
      >
        {FACES.map((name) => (
          <div key={name} className={`eclipse-face eclipse-face--${name}`} />
        ))}
      </div>
    </section>
  );
}
