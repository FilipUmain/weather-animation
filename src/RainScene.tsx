import React, { useEffect, useRef } from "react";
import * as THREE from "three";

type Environment = "clear" | "cloudy" | "rainy" | "snowy";
type Time = "morning" | "afternoon" | "evening" | "night";

interface RainSceneProps {
  environment?: Environment;
  time?: Time;
}

const RainScene: React.FC<RainSceneProps> = ({ environment, time }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rainRef = useRef<THREE.Points | null>(null);
  const cloudParticlesRef = useRef<THREE.Mesh[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const flashRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const initScene = () => {
      // Adjustable parameters
      const fogDensity = 0.0015;
      const cameraPosition = { x: 0, y: 0, z: 1 };
      const cameraRotation = { x: 1.16, y: -0.12, z: 0.27 };
      const ambientLightIntensity = time === "morning" ? 0.02 : 0.1;
      const directionalLightIntensity =
        time === "morning" ? 20 : time === "evening" ? 30 : 50;
      const flashColor = 0x062d89;
      const flashIntensity = 30;
      const flashDistance = 10;
      const flashDecay = 1.7;

      let rainCount;
      switch (environment) {
        case "clear":
          if (time === "night") {
            rainCount = 500;
          } else {
            rainCount = 0;
          }
          break;
        case "cloudy":
          rainCount = 0;
          break;
        case "rainy":
          rainCount = 10000;
          break;
        case "snowy":
          rainCount = 10000;
          break;
        default:
          rainCount = 500;
      }
      const rainColor =
        environment === "clear" && time === "night"
          ? 0xffffff
          : time === "night"
          ? 0x555555
          : environment === "rainy" && time === "afternoon"
          ? 0xffffff // White raindrop color for rainy afternoon
          : 0xaaaaaa; // Raindrop color
      let rainSize;
      switch (environment) {
        case "rainy":
          rainSize = 0.1;
          break;
        case "snowy":
          rainSize = 1;
          break;
        default:
          rainSize = 0.1;
      }
      const rainVelocity =
        environment === "snowy"
          ? 0.5
          : environment === "clear" && time === "night"
          ? 0
          : 3;

      const cloudOpacity = environment === "clear" ? 0.3 : 1;
      let cloudCount;
      switch (environment) {
        case "clear":
          cloudCount = 10;
          break;
        case "cloudy":
          cloudCount = time === "morning" ? 15 : 30;
          break;
        case "rainy":
          cloudCount = 40;
          break;
        case "snowy":
          cloudCount = 20;
          break;
        default:
          cloudCount = 25;
      }

      let skyColor;
      switch (time) {
        case "morning":
          skyColor = "#add8e6";
          break;
        case "afternoon":
          skyColor = 0x87ceeb;
          break;
        case "evening":
          skyColor = "#4682b4";
          break;
        case "night":
          skyColor = 0x11111f;
          break;
        default:
          skyColor = 0x87ceeb;
      }
      if (environment === "rainy" || environment === "snowy") {
        if (time === "night") {
          skyColor = 0x11111f;
        } else if (time === "afternoon") {
          skyColor = "#888888";
        } else {
          skyColor = "#333333";
        }
      }

      let cloudColor;
      switch (time) {
        case "morning":
          cloudColor = 0xffe4b5;
          break;
        case "afternoon":
          cloudColor = "gray";
          break;
        case "evening":
          cloudColor = 0xffc0cb;
          break;
        case "night":
          cloudColor = 0x111111;
          break;
        default:
          cloudColor = 0xffffff;
      }
      if (environment === "rainy" || environment === "snowy") {
        cloudColor = time === "night" ? 0x111111 : "#333333";
      }

      // Scene setup
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(skyColor, fogDensity);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      camera.rotation.set(cameraRotation.x, cameraRotation.y, cameraRotation.z);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(scene.fog.color);
      renderer.setSize(window.innerWidth, window.innerHeight);
      rendererRef.current = renderer;

      // Append renderer to the DOM
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      // Lights
      const ambient = new THREE.AmbientLight(cloudColor, ambientLightIntensity);
      scene.add(ambient);

      const directionalLight = new THREE.DirectionalLight(
        cloudColor,
        directionalLightIntensity
      );
      directionalLight.position.set(0, 0, 1);
      scene.add(directionalLight);

      const flash = new THREE.PointLight(
        flashColor,
        flashIntensity,
        flashDistance,
        flashDecay
      );
      flash.position.set(window.innerWidth / 2, window.innerHeight / 2, 100);
      scene.add(flash);
      flashRef.current = flash;

      // Function to create a circular texture
      function createCircleTexture(size: number, color: string): THREE.Texture {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");

        if (context) {
          context.fillStyle = color;
          context.beginPath();
          context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          context.fill();
        }

        return new THREE.CanvasTexture(canvas);
      }

      // Create a circular texture
      const circleTexture = createCircleTexture(64, "white"); // Adjust size and color as needed

      // Rain setup
      const rainGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(rainCount * 3);
      const velocities = new Float32Array(rainCount);

      for (let i = 0; i < rainCount; i++) {
        positions[i * 3] = Math.random() * 400 - 200;
        positions[i * 3 + 1] = Math.random() * 500 - 250;
        positions[i * 3 + 2] = Math.random() * 400 - 200;
        velocities[i] = 0;
      }

      rainGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const rainMaterial = new THREE.PointsMaterial({
        color: rainColor,
        size: rainSize,
        map: circleTexture, // Apply the generated snowflake-like texture
        transparent: true,
        alphaTest: 0.5, // Ensure transparency works correctly
        sizeAttenuation: true, // Enable size attenuation for perspective effect
      });

      const rain = new THREE.Points(rainGeo, rainMaterial);
      scene.add(rain);
      rainRef.current = rain;

      // Cloud setup
      const cloudParticles: THREE.Mesh[] = [];
      const loader = new THREE.TextureLoader();
      loader.load(
        "https://raw.githubusercontent.com/navin-navi/codepen-assets/master/images/smoke.png",
        (texture) => {
          const cloudGeo = new THREE.PlaneGeometry(500, 500);
          const cloudMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
          });

          for (let p = 0; p < cloudCount; p++) {
            const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
            cloud.position.set(
              Math.random() * 800 - 400,
              500,
              Math.random() * 500 - 500
            );
            cloud.rotation.x = 1.16;
            cloud.rotation.y = -0.12;
            cloud.rotation.z = Math.random() * 2 * Math.PI;
            cloud.material.opacity = cloudOpacity;
            cloudParticles.push(cloud);
            scene.add(cloud);
          }
          // Start animation after clouds are loaded
          animate();
        }
      );
      cloudParticlesRef.current = cloudParticles;

      // Animation loop
      const animate = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
          return;

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        requestAnimationFrame(animate);

        cloudParticles.forEach((p) => {
          p.rotation.z -= 0.002;
        });

        const positions = rainGeo.attributes.position.array as Float32Array;

        for (let i = 0; i < rainCount; i++) {
          positions[i * 3 + 1] -= rainVelocity; // Use a consistent velocity
          if (positions[i * 3 + 1] < -100) {
            positions[i * 3 + 1] = 300;
          }
        }

        rainGeo.attributes.position.needsUpdate = true;
        if (environment === "snowy") {
          rain.rotation.y += 0.002;
        }

        if (flashRef.current) {
          if (Math.random() > 0.96 || flashRef.current.power > 100) {
            if (flashRef.current.power < 100) {
              flashRef.current.position.set(
                Math.random() * 400,
                300 + Math.random() * 200,
                100
              );
            }
            flashRef.current.power = 50 + Math.random() * 500;
          }
          flashRef.current.power *= 0.97; // Gradually decrease the power
        }
      };

      // Start the animation loop
      // animate(); // Moved to the texture loader callback
    };

    const cleanupScene = () => {
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      if (rendererRef.current) {
        if (
          mountRef.current &&
          mountRef.current.contains(rendererRef.current.domElement)
        ) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      cloudParticlesRef.current.forEach((cloud) => {
        cloud.geometry.dispose();
        if (cloud.material instanceof THREE.Material) {
          cloud.material.dispose();
        }
      });
      if (rainRef.current) {
        rainRef.current.geometry.dispose();
        if (rainRef.current.material instanceof THREE.Material) {
          rainRef.current.material.dispose();
        }
      }
    };

    cleanupScene();
    initScene();

    // Handle window resize
    const handleResize = () => {
      if (rendererRef.current && cameraRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      cleanupScene();
    };
  }, [environment, time]);

  return <div ref={mountRef} />;
};

export default RainScene;
