import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Homepage.css'; // Assuming you place your CSS in this file

function Homepage() {
  const canvasRef = useRef(null); // ✅ Added useRef

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create playful floating toy shapes (mascots)
    const createFloatingToy = (shape, color, size = 1) => {
      let geometry;
      switch (shape) {
        case 'sphere':
          geometry = new THREE.SphereGeometry(size, 32, 32);
          break;
        case 'box':
          geometry = new THREE.BoxGeometry(size, size, size);
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(size, size * 2, 32);
          break;
        default:
          geometry = new THREE.SphereGeometry(size, 32, 32);
      }
      const material = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return mesh;
    };

    // Create multiple floating toys with different speeds and shapes
    const toys = [
      { mesh: createFloatingToy('sphere', 0xff6b6b, 0.8), speed: 0.01 },
      { mesh: createFloatingToy('box', 0x6bcb77, 1), speed: 0.015 },
      { mesh: createFloatingToy('cone', 0x4d96ff, 0.9), speed: 0.012 },
    ];

    // Position camera
    camera.position.z = 10;

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      toys.forEach((toy, i) => {
        toy.mesh.rotation.x += toy.speed;
        toy.mesh.rotation.y += toy.speed;
        toy.mesh.position.y = Math.sin(Date.now() * toy.speed + i) * 2;
      });
      renderer.render(scene, camera);
    };
    animate();

    // Responsive Handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Fun Zone: Bouncing Ball & Confetti Effect
    const ball = document.getElementById('bouncing-ball');
    ball.addEventListener('click', (e) => {
      for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.left = `${e.clientX + (Math.random() - 0.5) * 200}px`;
        confetti.style.top = `${e.clientY + (Math.random() - 0.5) * 200}px`;
        document.body.appendChild(confetti);
        confetti.animate(
          [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(100px)', opacity: 0 },
          ],
          {
            duration: 1000 + Math.random() * 500,
            easing: 'ease-out',
          }
        ).onfinish = () => confetti.remove();
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div>
      <nav className="navbar">
        <div className="logo">FunLearn 🎓</div>
        <div className="nav-links">
          <a href="#home">🏠 Home</a>
          <a href="#lessons">📚 Lessons</a>
          <a href="#games">🎮 Games</a>
          <a href="#progress">📈 Progress</a>
          <a href="#profile">👤 Profile</a>
        </div>
      </nav>

      <main>
        <section className="hero-section" id="home">
          <div className="welcome-message">
            <h1>Welcome to FunLearn! 🚀</h1>
            <p className="subtitle">Learn, Play, and Grow! 🌱</p>
            <button className="cta-button">Start Learning! 🎉</button>
          </div>
          <canvas ref={canvasRef} id="three-canvas"></canvas>
        </section>

        <section className="mascot-section" id="mascots">
          <h2>Meet Our Playful Mascots!</h2>
          <div className="mascot-grid">
            <div className="mascot-card">
              <img src="https://via.placeholder.com/100?text=Bunny" alt="Bouncy Bunny" />
              <h3>Bouncy Bunny</h3>
              <p>Always hopping around to bring smiles!</p>
            </div>
            <div className="mascot-card">
              <img src="https://via.placeholder.com/100?text=Cat" alt="Curious Cat" />
              <h3>Curious Cat</h3>
              <p>Exploring fun and learning every day!</p>
            </div>
            <div className="mascot-card">
              <img src="https://via.placeholder.com/100?text=Hippo" alt="Happy Hippo" />
              <h3>Happy Hippo</h3>
              <p>Loving adventures and fun challenges!</p>
            </div>
          </div>
        </section>

        <section className="activities-grid" id="activities">
          <div className="activity-card">
            <h2>Math Adventures ➕</h2>
            <p>Solve puzzles with friendly monsters!</p>
          </div>
          <div className="activity-card">
            <h2>Alphabet Safari 🔤</h2>
            <p>Explore letters with jungle animals!</p>
          </div>
          <div className="activity-card">
            <h2>Science World 🌍</h2>
            <p>Discover amazing science facts!</p>
          </div>
        </section>

        <section className="fun-zone" id="fun">
          <h2>Fun Zone!</h2>
          <p>Click on the bouncing ball to see magic!</p>
          <div className="bouncing-ball" id="bouncing-ball"></div>
        </section>
      </main>
    </div>
  );
}

export default Homepage;
