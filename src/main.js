import './style.css';
import * as THREE from 'three';

console.log("02-Objeto-Heroe. Thomas Bangalter Helmet (Reflejos Limpios).");

// DOM Elements ---------------------------------------------------------------
const normContainerX = document.getElementById("norm-x");
const normContainerY = document.getElementById("norm-y");
const rotationContainerX = document.getElementById("rotation-x");
const rotationContainerY = document.getElementById("rotation-y");
const lienzo = document.getElementById("lienzo");

// Variables & Constants ---------------------------------------------------------------
let pointerData = { x: 0, y: 0 };
let normalizedPointer = { x: 0, y: 0 };
let normalizedLerpPointer = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };

const COF = 0.06;

// Configuración de rangos
const ROTATION_LIMIT = 35;
const LIGHT_RANGE = 5;
const PARALLAX_CERCA = 0.8;
const PARALLAX_LEJOS = 0.15;

// Utilidades ---------------------------------------------------------------
function map(valor, inMin, inMax, outMin, outMax) {
  const t = (valor - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

// Generador de Entorno de Estudio Suave (Sin paredes ni formas de cuarto) -----
function createCleanStudioEnvironment(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Degradado vertical suave que simula luz de estudio cenital y suelo oscuro
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0.0, '#ffffff'); // Luz intensa superior
  gradient.addColorStop(0.2, '#d0d8e0'); // Tono azulado de estudio suave
  gradient.addColorStop(0.5, '#707880'); // Transición media
  gradient.addColorStop(0.8, '#202428'); // Contraste inferior
  gradient.addColorStop(1.0, '#050508'); // Sombra base

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Softboxes/franjas de luz difusas verticales (Añaden brillo especular pulido al cromo)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(200, 0, 150, canvas.height * 0.6);
  ctx.fillRect(670, 0, 150, canvas.height * 0.6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

// Escena 3D ---------------------------------------------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Asignar el nuevo entorno de reflejo limpio a la escena --------------------
scene.environment = createCleanStudioEnvironment(renderer);

// Luces ---------------------------------------------------------------
const hemiLight = new THREE.HemisphereLight("#ffffff", "#222233", 0.6);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight("#ffffff", 2.5);
keyLight.position.set(3, 4, 6);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight("#88bbff", 1.0);
fillLight.position.set(-4, -1, 4);
scene.add(fillLight);

// Materiales ---------------------------------------------------------------
const chromeMaterial = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  metalness: 0.98,
  roughness: 0.1 // Ligeramente difuminado para reflejos súper suaves y elegantes
});

const visorMaterial = new THREE.MeshStandardMaterial({
  color: "#050505",
  metalness: 0.9,
  roughness: 0.05
});

const darkMetalMaterial = new THREE.MeshStandardMaterial({
  color: "#1a1a1a",
  metalness: 0.8,
  roughness: 0.3
});

// Objeto héroe: Grupo ---------------------------------------------------------------
const hero = new THREE.Group();
hero.position.x = 1.8;
scene.add(hero);

// 1. Cúpula superior (Esfera)
const topDome = new THREE.Mesh(
  new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
  chromeMaterial
);
topDome.position.set(0, 0.45, 0);
hero.add(topDome);

// 2. Base de la cabeza posterior
const headBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.98, 0.95, 0.8, 32),
  chromeMaterial
);
headBase.position.set(0, 0.05, 0);
hero.add(headBase);

// 3. Visera simétrica
const visorGeo = new THREE.CylinderGeometry(1.01, 1.01, 0.42, 32, 1, true, -Math.PI * 0.4, Math.PI * 0.8);
const visor = new THREE.Mesh(visorGeo, visorMaterial);
visor.position.set(0, 0.22, 0.02);
hero.add(visor);

// Marcos superior e inferior
const frameTopGeo = new THREE.CylinderGeometry(1.02, 1.02, 0.05, 32, 1, true, -Math.PI * 0.4, Math.PI * 0.8);

const visorFrameTop = new THREE.Mesh(frameTopGeo, chromeMaterial);
visorFrameTop.position.set(0, 0.44, 0.02);
hero.add(visorFrameTop);

const visorFrameBottom = new THREE.Mesh(frameTopGeo, chromeMaterial);
visorFrameBottom.position.set(0, 0.00, 0.02);
hero.add(visorFrameBottom);

// 4. Ranura de la boca
const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.12), darkMetalMaterial);
mouth.position.set(0, -0.22, 0.94);
hero.add(mouth);

// 5. Base redonda del mentón
const chinBaseRing = new THREE.Mesh(
  new THREE.CylinderGeometry(0.85, 0.78, 0.3, 32),
  chromeMaterial
);
chinBaseRing.position.set(0, -0.52, 0);
hero.add(chinBaseRing);

// 6. Orejeras laterales
const earLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.16, 32), chromeMaterial);
earLeft.rotation.z = Math.PI * 0.5;
earLeft.position.set(-1.0, 0.2, 0.0);
hero.add(earLeft);

const earRight = earLeft.clone();
earRight.position.set(1.0, 0.2, 0.0);
hero.add(earRight);

const earInnerLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 24), darkMetalMaterial);
earInnerLeft.rotation.z = Math.PI * 0.5;
earInnerLeft.position.set(-1.01, 0.2, 0.0);
hero.add(earInnerLeft);

const earInnerRight = earInnerLeft.clone();
earInnerRight.position.set(1.01, 0.2, 0.0);
hero.add(earInnerRight);

// 7. Cuello base
const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.75, 0.35, 24), darkMetalMaterial);
neck.position.set(0, -0.82, -0.02);
hero.add(neck);

// Elementos Secundarios (Parallax) ---------------------------------------------------------------
const secundarios = [];
const materialSecundario = new THREE.MeshStandardMaterial({ color: "#c0c0c0", roughness: 0.2, metalness: 0.8 });
const geometrias = [
  new THREE.OctahedronGeometry(0.28),
  new THREE.TetrahedronGeometry(0.3),
  new THREE.BoxGeometry(0.34, 0.34, 0.34),
];

const posiciones = [
  [-1.0,  2.6, -4.0], [ 4.6,  2.4, -2.5], [ 5.4, -1.6, -5.0], [ 0.2, -2.8, -1.0],
  [ 3.4, -3.0,  1.4], [-2.2, -0.8, -6.0], [ 6.2,  0.6,  0.8], [ 1.2,  3.2,  1.8],
];

posiciones.forEach(([x, y, z], i) => {
  const mesh = new THREE.Mesh(geometrias[i % geometrias.length], materialSecundario);
  mesh.position.set(x, y, z);
  mesh.rotation.set(i, i * 0.7, 0);
  scene.add(mesh);
  secundarios.push({ mesh, base: { x, y, z } });
});

// Window Resize ---------------------------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Pointer events ---------------------------------------------------------------
function calculateNormalizedPointer() {
  normalizedPointer.x = (pointerData.x / window.innerWidth) * 2 - 1;
  normalizedPointer.y = -(pointerData.y / window.innerHeight) * 2 + 1;
}

document.addEventListener("pointermove", (event) => {
  pointerData.x = Math.floor(event.clientX);
  pointerData.y = Math.floor(event.clientY);
  calculateNormalizedPointer();
});

function calculateNormalizedLerpPointer() {
  normalizedLerpPointer.x += (normalizedPointer.x - normalizedLerpPointer.x) * COF;
  normalizedLerpPointer.y += (normalizedPointer.y - normalizedLerpPointer.y) * COF;

  if (normContainerX) normContainerX.innerText = normalizedLerpPointer.x.toFixed(2);
  if (normContainerY) normContainerY.innerText = normalizedLerpPointer.y.toFixed(2);
}

// Actualizar rotación del héroe ---------------------------------------------------------------
function updateHero() {
  rotation.y = map(normalizedLerpPointer.x, -1, 1, -ROTATION_LIMIT, ROTATION_LIMIT);
  rotation.x = map(normalizedLerpPointer.y, -1, 1, ROTATION_LIMIT, -ROTATION_LIMIT);

  hero.rotation.y = THREE.MathUtils.degToRad(rotation.y);
  hero.rotation.x = THREE.MathUtils.degToRad(rotation.x);

  if (rotationContainerX) rotationContainerX.innerText = Math.round(rotation.x);
  if (rotationContainerY) rotationContainerY.innerText = Math.round(rotation.y);
}

// Parallax en objetos secundarios ---------------------------------------------------------------
function updateSecundarios() {
  for (const s of secundarios) {
    const factorParallax = map(s.base.z, -6, 2, PARALLAX_LEJOS, PARALLAX_CERCA);

    s.mesh.position.x = s.base.x + map(normalizedLerpPointer.x, -1, 1, -factorParallax, factorParallax);
    s.mesh.position.y = s.base.y + map(normalizedLerpPointer.y, -1, 1, -factorParallax, factorParallax);
  }
}

// Movimiento de la luz ---------------------------------------------------------------
function updateLight() {
  keyLight.position.x = 3 + map(normalizedLerpPointer.x, -1, 1, -LIGHT_RANGE, LIGHT_RANGE);
  keyLight.position.y = 4 + map(normalizedLerpPointer.y, -1, 1, -LIGHT_RANGE, LIGHT_RANGE);
}

// Loop de animación ---------------------------------------------------------------
function animate() {
  calculateNormalizedLerpPointer();
  updateHero();
  updateSecundarios();
  updateLight();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();