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
  //   const green = "#22577A";
  //   const blue = "#38A3A5";
  //   const yellow = "#57CC99";
  //   const orange = "#E94F37";
  //   const red = "#D9594C";
  //   const white = "#F9F8F8";

  // Adjustable parameters
  const fogDensity = 0.0015; //Cloud and rain visibility ranging from 0.006 (no clouds) to 0.001 (dense clouds) EXTRA: 0.5 to hide rain and clouds
  const cameraPosition = { x: 0, y: 0, z: 1 };
  const cameraRotation = { x: 1.16, y: -0.12, z: 0.27 };
  const ambientLightIntensity = 0.1; // how thick the clouds will be, 0.1 for light clouds and 100 for dense clouds
  const directionalLightIntensity = 50; // Light intensity ranging from 0 (no light) to 50 (brightest light) color intensity for the clouds at 50 with cloudColor as white makes them white, suited for when cloudy but daytime and sunny
  const flashColor = 0x062d89;
  const flashIntensity = 30;
  const flashDistance = 10;
  const flashDecay = 1.7;
  let rainCount;
  switch (environment) {
    case "clear":
      rainCount = 0;
      break;
    case "rainy":
      rainCount = 10000;
      break;
    case "snowy":
      rainCount = 5000;
      break;
    default:
      rainCount = 500; // Default to light rain
  }
  const rainColor = environment === "snowy" ? 0xffffff : 0xaaaaaa; // Raindrop color
  let rainSize;
  switch (environment) {
    case "rainy":
      rainSize = 0.1;
      break;
    case "snowy":
      rainSize = 1;
      break;
    default:
      rainSize = 0.1; // Default to rain size
  }
  const cloudOpacity = 1; // Cloud opacity
  let cloudCount;
  switch (environment) {
    case "clear":
      cloudCount = 0;
      break;
    case "cloudy":
      cloudCount = 25;
      break;
    case "rainy":
      cloudCount = 15;
      break;
    case "snowy":
      cloudCount = 20;
      break;
    default:
      cloudCount = 25; // Default to cloudy
  }
  let skyColor;
  switch (time) {
    case "morning":
      skyColor = 0xffd700; // Yellow
      break;
    case "afternoon":
      skyColor = 0x87ceeb; // Light blue
      break;
    case "evening":
      skyColor = 0xff69b4; // Pink
      break;
    case "night":
      skyColor = 0x11111f; // Dark blue
      break;
    default:
      skyColor = 0x87ceeb; // Default to light blue
  }
  let cloudColor;
  switch (time) {
    case "morning":
      cloudColor = 0xffe4b5; // Light yellow
      break;
    case "afternoon":
      cloudColor = 0xffffff; // White
      break;
    case "evening":
      cloudColor = 0xffc0cb; // Light pink
      break;
    case "night":
      cloudColor = 0x111111; // Dark
      break;
    default:
      cloudColor = 0xffffff; // Default to white
  }
  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(skyColor, fogDensity);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.rotation.set(cameraRotation.x, cameraRotation.y, cameraRotation.z);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(scene.fog.color);
    renderer.setSize(window.innerWidth, window.innerHeight);

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
      transparent: true,
    });

    const rain = new THREE.Points(rainGeo, rainMaterial);
    scene.add(rain);

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
      }
    );

    // Animation loop
    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);

      cloudParticles.forEach((p) => {
        p.rotation.z -= 0.002;
      });

      const positions = rainGeo.attributes.position.array as Float32Array;

      for (let i = 0; i < rainCount; i++) {
        velocities[i] -= 3 * Math.random() * 1;
        positions[i * 3 + 1] += velocities[i];
        if (positions[i * 3 + 1] < -100) {
          positions[i * 3 + 1] = 100;
          velocities[i] = 0;
        }
      }

      rainGeo.attributes.position.needsUpdate = true;
      rain.rotation.y += 0.002;

      if (Math.random() > 0.96 || flash.power > 100) {
        if (flash.power < 100) {
          flash.position.set(
            Math.random() * 400,
            300 + Math.random() * 200,
            100
          );
        }
        flash.power = 50 + Math.random() * 500;
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} />;
};

export default RainScene;
