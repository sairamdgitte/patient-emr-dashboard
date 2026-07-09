import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { WARDS } from './twinEngine';

// ============================================
// HTL DIGITAL TWIN — 3D floor view
// Light, architectural, brand-true. Beds are
// the data: indigo = occupied, teal = free,
// hatched grey = closed flex, red = ramped.
// Custom drag-orbit (no OrbitControls dep).
// ============================================

const COL = {
  bg: 0xf7f7fa,
  plate: 0xffffff,
  plateEdge: 0xd9d9e4,
  occupied: 0x2a2270,   // htl indigo 2
  free: 0x45b899,       // niin teal
  closed: 0xc8c8d4,
  ramped: 0xc0392b,
  floor: 0xefeff4,
};

// Ward plate layout (x, z, width, depth) — a believable single-level plan
const LAYOUT = {
  ed:     { x: -13, z: 4,   w: 12, d: 9,  cols: 5 },
  med7b:  { x: 3.5, z: -6,  w: 15, d: 8,  cols: 9 },
  surg5a: { x: 3.5, z: 5.5, w: 13, d: 7,  cols: 8 },
  icu:    { x: -12, z: -7,  w: 9,  d: 5,  cols: 6 },
  lounge: { x: 15.5, z: 5.5, w: 5, d: 7,  cols: 2 },
};

export default function TwinScene({ bedStates, pulseKeys, onLabelPositions }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  // ---- one-time scene construction ----
  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth, H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(COL.bg, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(COL.bg, 55, 95);

    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 200);

    // lights — soft daylight studio
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(18, 30, 14);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -30; key.shadow.camera.right = 30;
    key.shadow.camera.top = 30; key.shadow.camera.bottom = -30;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe6ff, 0.35);
    fill.position.set(-20, 12, -18);
    scene.add(fill);

    // ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: COL.floor, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.06;
    ground.receiveShadow = true;
    scene.add(ground);

    // materials (shared)
    const mats = {
      occupied: new THREE.MeshStandardMaterial({ color: COL.occupied, roughness: 0.55 }),
      free: new THREE.MeshStandardMaterial({ color: COL.free, roughness: 0.55 }),
      closed: new THREE.MeshStandardMaterial({ color: COL.closed, roughness: 0.9, transparent: true, opacity: 0.45 }),
      ramped: new THREE.MeshStandardMaterial({ color: COL.ramped, roughness: 0.5 }),
    };

    const bedGeo = new THREE.BoxGeometry(0.9, 0.42, 1.5);
    const headGeo = new THREE.BoxGeometry(0.9, 0.62, 0.16);
    const rampGeo = new THREE.CapsuleGeometry
      ? new THREE.CapsuleGeometry(0.28, 0.5, 3, 10)
      : new THREE.CylinderGeometry(0.28, 0.28, 0.9, 10);

    const beds = {}; // key -> [{group, body, head}]
    const rampedMeshes = [];
    const labelAnchors = [];

    WARDS.forEach(w => {
      const L = LAYOUT[w.key];
      const total = w.cap + (w.key === 'med7b' ? 6 : 0);

      // plate
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(L.w, 0.24, L.d),
        new THREE.MeshStandardMaterial({ color: COL.plate, roughness: 0.85 })
      );
      plate.position.set(L.x, 0.12, L.z);
      plate.receiveShadow = true;
      scene.add(plate);
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(L.w, 0.24, L.d)),
        new THREE.LineBasicMaterial({ color: COL.plateEdge })
      );
      edge.position.copy(plate.position);
      scene.add(edge);

      labelAnchors.push({ key: w.key, pos: new THREE.Vector3(L.x, 0.3, L.z - L.d / 2 - 0.6) });

      // beds in a grid on the plate
      beds[w.key] = [];
      const rows = Math.ceil(total / L.cols);
      const gx = L.w / (L.cols + 0.5), gz = L.d / (rows + 0.6);
      for (let i = 0; i < total; i++) {
        const r = Math.floor(i / L.cols), c = i % L.cols;
        const g = new THREE.Group();
        const body = new THREE.Mesh(bedGeo, mats.free);
        body.castShadow = true;
        body.position.y = 0.45;
        const head = new THREE.Mesh(headGeo, mats.free);
        head.castShadow = true;
        head.position.set(0, 0.55, -0.67);
        g.add(body); g.add(head);
        g.position.set(
          L.x - L.w / 2 + gx * (c + 0.75),
          0.12,
          L.z - L.d / 2 + gz * (r + 0.8)
        );
        scene.add(g);
        beds[w.key].push({ group: g, body, head, current: 'free', scaleT: 1 });
      }

      // ramped patient slots outside the ED plate (up to 8)
      if (w.key === 'ed') {
        for (let i = 0; i < 8; i++) {
          const m = new THREE.Mesh(rampGeo, mats.ramped);
          m.castShadow = true;
          m.position.set(L.x - L.w / 2 - 1.4, 0.6, L.z - L.d / 2 + 1 + i * 1.05);
          m.visible = false;
          scene.add(m);
          rampedMeshes.push(m);
        }
      }
    });

    // corridor hint — a quiet spine connecting the plates
    const corridor = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.1, 22),
      new THREE.MeshStandardMaterial({ color: 0xe7e7ef, roughness: 1 })
    );
    corridor.position.set(-4.5, 0.05, -0.5);
    corridor.receiveShadow = true;
    scene.add(corridor);

    // ---- custom orbit: drag to rotate, wheel to zoom ----
    const orbit = { theta: -0.62, phi: 0.98, radius: 40, target: new THREE.Vector3(0.5, 0, -0.5) };
    const applyCamera = () => {
      const { theta, phi, radius, target } = orbit;
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(target);
    };
    applyCamera();

    let dragging = false, px = 0, py = 0;
    const onDown = (e) => { dragging = true; px = e.clientX; py = e.clientY; mount.style.cursor = 'grabbing'; };
    const onUp = () => { dragging = false; mount.style.cursor = 'grab'; };
    const onMove = (e) => {
      if (!dragging) return;
      orbit.theta -= (e.clientX - px) * 0.005;
      orbit.phi = Math.min(1.35, Math.max(0.35, orbit.phi - (e.clientY - py) * 0.004));
      px = e.clientX; py = e.clientY;
      applyCamera();
    };
    const onWheel = (e) => {
      e.preventDefault();
      orbit.radius = Math.min(70, Math.max(20, orbit.radius + e.deltaY * 0.03));
      applyCamera();
    };
    mount.style.cursor = 'grab';
    mount.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // ---- render loop: state-driven, with settle animation on change ----
    const clock = new THREE.Clock();
    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      // ease pulsing beds back to rest (scale pop when a bed changes state)
      Object.values(beds).forEach(list => list.forEach(b => {
        if (b.scaleT < 1) {
          b.scaleT = Math.min(1, b.scaleT + dt * 4.5);
          const s = 1 + Math.sin(b.scaleT * Math.PI) * 0.28;
          b.group.scale.set(s, s, s);
          if (b.scaleT >= 1) b.group.scale.set(1, 1, 1);
        }
      }));

      // project ward label anchors to screen space for HTML labels
      if (onLabelPositions) {
        const rect = renderer.domElement.getBoundingClientRect();
        const out = {};
        labelAnchors.forEach(a => {
          const v = a.pos.clone().project(camera);
          out[a.key] = {
            x: (v.x * 0.5 + 0.5) * rect.width,
            y: (-v.y * 0.5 + 0.5) * rect.height,
            visible: v.z < 1,
          };
        });
        onLabelPositions(out);
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    stateRef.current = { beds, mats, rampedMeshes };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      mount.removeEventListener('wheel', onWheel);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []); // mount once; sim state applied in the effect below

  // ---- apply bed states whenever the sim tick / scenario changes ----
  useEffect(() => {
    const { beds, mats, rampedMeshes } = stateRef.current;
    if (!beds || !bedStates) return;
    WARDS.forEach(w => {
      const states = bedStates[w.key] || [];
      (beds[w.key] || []).forEach((b, i) => {
        const next = states[i] || 'free';
        if (next !== b.current) {
          b.current = next;
          b.body.material = mats[next] || mats.free;
          b.head.material = mats[next] || mats.free;
          b.group.visible = true;
          b.scaleT = 0; // trigger settle pop
        }
      });
    });
    const ramped = bedStates.rampedCount || 0;
    rampedMeshes.forEach((m, i) => { m.visible = i < ramped; });
  }, [bedStates, pulseKeys]);

  return <div ref={mountRef} className="twin-scene" />;
}
