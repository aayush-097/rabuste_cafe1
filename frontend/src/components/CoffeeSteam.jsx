import { useEffect, useRef } from "react";
import * as THREE from "three";
import "../styles/CoffeeSteam.css";

export default function CoffeeSteam() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    /* ================= SCENE ================= */
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = isMobile ? 7.2 : 6; // ✅ visibility only

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
    window.addEventListener("resize", resize);

    /* ================= MOUSE ================= */
    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();

    const onMouseMove = (e) => {
      if (isMobile) return;
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    /* ================= STEAM TEXTURE ================= */
    const createSteamTexture = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d");

      const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(255,240,220,0.22)");
      g.addColorStop(0.4, "rgba(255,240,220,0.12)");
      g.addColorStop(1, "rgba(255,240,220,0)");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(128, 128, 128, 0, Math.PI * 2);
      ctx.fill();

      return new THREE.CanvasTexture(c);
    };

    const steamTexture = createSteamTexture();

    /* ================= PARTICLES ================= */
    const COUNT = isMobile ? 180 : 140;
    const CUP_POS = new THREE.Vector3(2, -0.5, -0.2); // ✅ NEVER CHANGE
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
      const t = clock.getElapsedTime();

      if (!isMobile) {
        mouse.lerp(targetMouse, 0.08);
      } else {
        mouse.x = Math.sin(t * 0.25) * 0.08;
        mouse.y = Math.cos(t * 0.3) * 0.06;
      }

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
        const zigzagX = Math.sin(h * 10 + t * 2 + p.curl) * 0.05;
        const zigzagZ = Math.cos(h * 10 + t * 2 + p.curl) * 0.05;

        p.mesh.position.x =
          CUP_POS.x +
          Math.cos(p.angle) * cone +
          zigzagX +
          mouse.x * h * 0.6;

        p.mesh.position.z =
          CUP_POS.z +
          Math.sin(p.angle) * cone +
          zigzagZ +
          mouse.y * h * 0.6;

        p.mesh.scale.x += 0.002;
        p.mesh.scale.y += 0.0035;

        p.mesh.material.opacity =
          Math.sin(p.life * Math.PI) * (isMobile ? 0.22 : 0.16);

        p.mesh.quaternion.copy(camera.quaternion);
      });

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

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