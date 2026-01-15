import { useEffect, useRef } from "react";
import * as THREE from "three";
import "../styles/CoffeeSteam.css";

export default function CoffeeSteam() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    /* ================= SCENE ================= */
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const resize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();

    /* ================= MOUSE ================= */
    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();
    const prevMouse = new THREE.Vector2();
    const mouseVelocity = new THREE.Vector2();

    const onMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      mouseVelocity.set(x - prevMouse.x, y - prevMouse.y);
      prevMouse.set(x, y);
      targetMouse.set(x, y);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);

    /* ================= STEAM TEXTURE ================= */
    const createSteamTexture = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d");

      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(255,240,220,0.2)");
      g.addColorStop(0.4, "rgba(255,240,220,0.1)");
      g.addColorStop(1, "rgba(255,240,220,0)");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(128, 128, 128, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    };

    const steamTexture = createSteamTexture();

    /* ================= PARTICLES ================= */
    const COUNT = 140;
    const CUP_POS = new THREE.Vector3(2, -0.5, -0.2);
    const RIM_RADIUS = 0.22;

    const geometry = new THREE.PlaneGeometry(0.75, 0.75);
    const particles = [];

    for (let i = 0; i < COUNT; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: steamTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      particles.push({
        mesh,
        life: Math.random(),
        speed: 0.006 + Math.random() * 0.006,
        angle: Math.random() * Math.PI * 2,
        spread: 0.45 + Math.random() * 0.4,
        curl: Math.random() * Math.PI * 2,
      });
    }

    /* ================= ANIMATION ================= */
    const clock = new THREE.Clock();

    const animate = () => {
      mouse.lerp(targetMouse, 0.08);
      const t = clock.getElapsedTime();

      particles.forEach((p) => {
        p.life += 0.003;

        if (p.life > 1) {
          p.life = 0;
          p.angle = Math.random() * Math.PI * 2;
          p.mesh.position.set(
            CUP_POS.x + Math.cos(p.angle) * RIM_RADIUS,
            CUP_POS.y,
            CUP_POS.z + Math.sin(p.angle) * RIM_RADIUS
          );
          p.mesh.scale.set(0.6, 0.6, 0.6);
        }

        p.mesh.position.y += p.speed;
        const h = p.mesh.position.y - CUP_POS.y;

        const cone = h * p.spread;
        const cursorForce = h * 0.6;

        const zigzagX = Math.sin(h * 10 + t * 2 + p.curl) * 0.05;
        const zigzagZ = Math.cos(h * 10 + t * 2 + p.curl) * 0.05;

        p.mesh.position.x =
          CUP_POS.x +
          Math.cos(p.angle) * cone +
          zigzagX +
          mouse.x * cursorForce +
          mouseVelocity.x * h;

        p.mesh.position.z =
          CUP_POS.z +
          Math.sin(p.angle) * cone +
          zigzagZ +
          mouse.y * cursorForce +
          mouseVelocity.y * h * 0.8;

        p.mesh.scale.x += 0.002;
        p.mesh.scale.y += 0.0035;

        p.mesh.material.opacity = Math.sin(p.life * Math.PI) * 0.16;
        p.mesh.quaternion.copy(camera.quaternion);
      });

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    /* ================= CLEANUP ================= */
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="steam-wrapper">
      <div className="background-container" />
      <div ref={containerRef} className="canvas-container" />
    </div>
  );
}
