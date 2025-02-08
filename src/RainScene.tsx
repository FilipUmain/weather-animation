import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SceneSettings } from "./App";
type Environment = "clear" | "cloudy" | "rainy" | "snowy";
type Time = "morning" | "afternoon" | "evening" | "night";

interface RainSceneProps {
  environment?: Environment;
  time?: Time;
  data: SceneSettings
}

const RainScene: React.FC<RainSceneProps> = ({ environment, time, data }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rainRef = useRef<THREE.Points | null>(null);
  const cloudParticlesRef = useRef<THREE.Mesh[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const flashRef = useRef<THREE.PointLight | null>(null);

  // const [fogDensity, setFogDensity] = useState(0.0015);
  // const [cameraPosition, setCameraPosition] = useState({ x: 1, y: -10, z: 1 });
  // const [cameraRotation, setCameraRotation] = useState({ x: 1.16, y: -0.12, z: 0.27 });
  // const [ambientLightIntensity, setAmbientLightIntensity] = useState(time === "morning" ? 0.02 : 0.1);
  // const [directionalLightIntensity, setDirectionalLightIntensity] = useState(
  //   time === "morning" ? 20 : time === "evening" ? 30 : 50
  // );
  // const [flashColor, setFlashColor] = useState(0x062d89);
  // const [flashIntensity, setFlashIntensity] = useState(30);
  // const [flashDistance, setFlashDistance] = useState(10);
  // const [flashDecay, setFlashDecay] = useState(1.7)
  const [rainColor, setRainColor] = useState(121212);
  const [skyColor, setSkyColor] = useState(468282);
  const [cloudColor, setCloudColor] = useState<string | number>("white");
  const [rainSize, setRainSize] = useState<number>(0.1); 
  const [rainCount, setRainCount] = useState<number>(0); 
  const [cloudCount, setCloudCount] = useState<number>(25); // Default cloud count
  const [cloudOpacity, setCloudOpacity] = useState<number>(1); // Default cloud opacity
  const [rainVelocity, setRainVelocity] = useState<number>(3); // Default rain velocity





  useEffect(() => {
    const initScene = () => {
      const fogDensity = 0.0015;
      const cameraPosition = { x: 1, y: -10, z: 1 };
      const cameraRotation = { x: 1.16, y: -0.12, z: 0.27 };
      const ambientLightIntensity = time === "morning" ? 0.02 : 0.1;
      const directionalLightIntensity =
        time === "morning" ? 20 : time === "evening" ? 30 : 50;
      const flashColor = 0x062d89;
      const flashIntensity = 30;
      const flashDistance = 10;
      const flashDecay = 1.7;

      switch (environment) {
        case "clear":
          setRainCount(time === "night" ? 500 : 0);
          break;
        case "cloudy":
          setRainCount(0);
          break;
        case "rainy":
          setRainCount(10000);
          break;
        case "snowy":
          setRainCount(10000);
          break;
        default:
          setRainCount(500);
      }
  
      // Rain Color
      if (environment === "clear" && time === "night") {
        setRainColor(0xffffff); // White
      } else if (time === "night") {
        setRainColor(0x555555); // Dark gray
      } else if (environment === "rainy" && time === "afternoon") {
        setRainColor(0xffffff); // White for rainy afternoon
      } else {
        setRainColor(0xaaaaaa); // Default raindrop color
      }
  
      // Rain Size
      switch (environment) {
        case "rainy":
          setRainSize(0.1);
          break;
        case "snowy":
          setRainSize(1);
          break;
        default:
          setRainSize(0.1);
      }
  
      // Rain Velocity
      if (environment === "snowy") {
        setRainVelocity(0.5);
      } else if (environment === "clear" && time === "night") {
        setRainVelocity(0);
      } else {
        setRainVelocity(3);
      }
  
      // Cloud Opacity
      switch (environment) {
        case "clear":
          setCloudOpacity(0.3);
          break;
        case "cloudy":
        case "rainy":
        case "snowy":
          setCloudOpacity(1);
          break;
        default:
          setCloudOpacity(1);
      }
  
      // Cloud Count
      switch (environment) {
        case "clear":
          setCloudCount(10);
          break;
        case "cloudy":
          setCloudCount(time === "morning" ? 15 : 30);
          break;
        case "rainy":
          setCloudCount(40);
          break;
        case "snowy":
          setCloudCount(20);
          break;
        default:
          setCloudCount(25);
      }
  
      // Sky Color
      switch (time) {
        case "morning":
          setSkyColor(6787490);
          break;
        case "afternoon":
          setSkyColor(8900331);
          break;
        case "evening":
            setSkyColor(4628916);
          break;
        case "night":
          setSkyColor(1118495);
          break;
        default:
          setSkyColor(8900331);
      }
  
      if (environment === "rainy" || environment === "snowy") {
        if (time === "night") {
          setSkyColor(0x11111f);
        } else if (time === "afternoon") {
          setSkyColor(0x888888);
        } else {
          setSkyColor(0x333333);
        }
      }
  
      // Cloud Color
      switch (time) {
        case "morning":
            setCloudColor(0xffe4b5); // "rgb(255, 228, 181)"
            break;
          case "afternoon":
            setCloudColor(0x808080); // "gray"
            break;
          case "evening":
            setCloudColor(0xd3d3d3); // "lightgray"
          break;
        case "night":
          setCloudColor(0x111111);
          break;
        default:
          setCloudColor(0xffffff);
      }
  
      if (environment === "rainy" || environment === "snowy") {
        if (time === "night") {
          setCloudColor(0x111111);
        } else if (time === "morning") {
          setCloudColor(0x7a7a7a); // rgb(122, 122, 122)
        } else {
          setCloudColor(0x333333);
        }
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
      // Create a radial gradient texture for the sun effect
      const createSunTexture = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");

        if (context) {
          const gradient = context.createRadialGradient(
            size / 2,
            size / 2,
            0,
            size / 2,
            size / 2,
            size / 2
          );
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)"); // White center
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // Transparent edge

          context.fillStyle = gradient;
          context.fillRect(0, 0, size, size);
        }

        return new THREE.CanvasTexture(canvas);
      };

      // Create a sprite for the sun effect
      const sunTexture = createSunTexture();
      const sunMaterial = new THREE.SpriteMaterial({ map: sunTexture });
      const sunSprite = new THREE.Sprite(sunMaterial);
      sunSprite.scale.set(200, 200, 2); // Adjust size to match the moon
      sunSprite.position.set(40, 565, -50); // Match the moon's position
      scene.add(sunSprite);

      // Add the moon mesh
      if (environment !== "cloudy") {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg",
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            const geometry = new THREE.CircleGeometry(20, 64);
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              opacity: environment === "snowy" && time === "night" ? 0.1 : 0.4,
            });
            const moon = new THREE.Mesh(geometry, material);
            moon.rotation.x = Math.PI / 2.5;
            moon.position.set(40, 570, -50);
            scene.add(moon);
          }
        );
      }
      // // Add a simple object to the scene
      // const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      // const material = new THREE.MeshBasicMaterial({
      //   color: 0xffffff,
      //   transparent: true,
      //   opacity:
      //     environment === "cloudy" && time === "night"
      //       ? 0
      //       : environment === "cloudy"
      //       ? 1
      //       : 0,
      // });
      // const sphere = new THREE.Mesh(geometry, material);
      // scene.add(sphere);

      // Composer setup
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      // Add UnrealBloomPass only when cloudy and not night
      if (
        (environment === "cloudy" && time !== "night") ||
        time === "morning"
      ) {
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          time === "morning" ? 0 : time === "evening" ? 0.45 : 0.4, // 0 for morning, 0.1 for evening, 0.6 for afternoon
          0.7, // Adjusted radius
          0.9 // Lower threshold to include more bright areas
        );
        composer.addPass(bloomPass);
      }

      // // Custom shader to tint the bloom
      // let colorShader: any = undefined;
      // if (environment === "cloudy" && time !== "night") {
      //   colorShader = {
      //     uniforms: {
      //       tDiffuse: { value: null },
      //       color: {
      //         value: new THREE.Color(
      //           time === "afternoon"
      //             ? 0xd3d3d3 // Super light gray for afternoon
      //             : time === "morning"
      //             ? 0xffffe0 // Super light white yellow for morning
      //             : time === "evening"
      //             ? 0xffc0cb // Slightly more pink for evening
      //             : 0xffffff // White (no tint) otherwise
      //         ),
      //       },
      //     },
      //     vertexShader: `
      //   varying vec2 vUv;
      //   void main() {
      //     vUv = uv;
      //     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      //   }
      //     `,
      //     fragmentShader: `
      //   uniform sampler2D tDiffuse;
      //   uniform vec3 color;
      //   varying vec2 vUv;
      //   void main() {
      //     vec4 texel = texture2D(tDiffuse, vUv);
      //     gl_FragColor = texel * vec4(color, 1.0);
      //   }
      //     `,
      //   };
      // }

      // if (colorShader) {
      //   const colorPass = new ShaderPass(colorShader);
      //   composer.addPass(colorPass);
      // }
      // Composer setup

      // Add UnrealBloomPass only when cloudy and not night
      if (environment === "cloudy" && time !== "night") {
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.1, // Increased strength for strong bloom
          0.7, // Adjusted radius
          0.9 // Lower threshold to include more bright areas
        );
        composer.addPass(bloomPass);
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

        composer.render();
        requestAnimationFrame(animate);

        cloudParticles.forEach((p) => {
          p.rotation.z -= 0.001;
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
  }, [environment, time, data, cloudColor, cloudCount, cloudOpacity, rainColor, rainCount, rainSize, rainVelocity, skyColor]);

  return <div ref={mountRef} />;
};

export default RainScene;
