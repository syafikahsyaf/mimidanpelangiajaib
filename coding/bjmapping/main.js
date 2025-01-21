import { loadGLTF, loadAudio } from "../../libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../assets/targets/mapping/mapping.mind',
    });

    const { renderer, scene, camera } = mindarThree;

    // Add a hemisphere light to illuminate the AR scene
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    //-- Mouse Interaction for Rotation --
    let isMouseDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let rotationSpeed = 0.005;
    let targetScene = null; // Added a reference to the active scene

    // Event to capture mouse movement
    document.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    });

    document.addEventListener('mousemove', (event) => {
      if (isMouseDown && targetScene) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;
        targetScene.rotation.y += deltaX * rotationSpeed;  // Rotasi pada Y-axis
        targetScene.rotation.x += deltaY * rotationSpeed;  // Rotasi pada X-axis
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }
    });

    document.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    //-- Zoom Interaction with the Mouse Wheel --
    let zoomSpeed = 1;
    document.addEventListener('wheel', (event) => {
      if (event.deltaY < 0) {
        camera.position.z -= zoomSpeed;  // Zoom keluar
      } else {
        camera.position.z += zoomSpeed;  // Zoom masuk
      }
    });

    //-- Functions to load and add each page with interactions --
    const loadPage = async (pageIndex, modelPath, soundPath) => {
      const page = await loadGLTF(modelPath);
      page.scene.position.set(0.0, -0.4, 0);
      page.scene.name = `page${pageIndex}`;

      // SET MODEL SIZE MANUALLY
      switch (pageIndex) {
        case 0:  // Page 1
          page.scene.scale.set(0.2, 0.2, 0.2);
          break;
        case 1:  // Page 2
          page.scene.scale.set(0.3, 0.3, 0.3);
          break;
        case 2:  // Page 3
          page.scene.scale.set(0.3, 0.3, 0.3);
          break;
        case 3:  // Page 4
          page.scene.scale.set(0.5, 0.5, 0.5);
          break;
        case 4:  // Page 5
          page.scene.scale.set(0.5, 0.5, 0.5);
          break;
        case 5:  // Page 6
          page.scene.scale.set(0.5, 0.5, 0.5);
          break;
        case 6:  // Page 7
          page.scene.scale.set(0.1, 0.1, 0.1);
          break;
        case 7:  // Page 8
          page.scene.scale.set(0.2, 0.2, 0.2);
          break;
        case 8:  // Page 9
          page.scene.scale.set(0.2, 0.2, 0.2);
          break;
        default:
          page.scene.scale.set(0.01, 0.01, 0.01);
      }

      // ANCHORS
      const pageAnchor = mindarThree.addAnchor(pageIndex);
      pageAnchor.group.add(page.scene);

      // Audio setup
      const audioClip = await loadAudio(soundPath);
      const listener = new THREE.AudioListener();
      camera.add(listener);
      const audio = new THREE.PositionalAudio(listener);
      pageAnchor.group.add(audio);

      audio.setBuffer(audioClip);
      audio.setRefDistance(10000);
      audio.setLoop(true);

      pageAnchor.onTargetFound = () => {
        audio.play();
        targetScene = page.scene;  // Set the active scene for rotation
      };
      pageAnchor.onTargetLost = () => {
        audio.stop();
        targetScene = null;  // Reset the active scene when target is lost
      };

      // Animation mixer
      const mixer = new THREE.AnimationMixer(page.scene);
      const action = mixer.clipAction(page.animations[0]);
      action.play();

      return mixer;  // Return the mixer for animation update
    };

    // Load all pages and their respective sounds
    const mixers = [];
    mixers.push(await loadPage(0, '../../assets/models/g7/page1.glb', '../../assets/sounds/BJmap/place1bj.mp3'));
    mixers.push(await loadPage(1, '../../assets/models/g7/page2.glb', '../../assets/sounds/BJmap/place2bj.mp3'));
    mixers.push(await loadPage(2, '../../assets/models/g7/page3.glb', '../../assets/sounds/BJmap/place3bj.mp3'));
    mixers.push(await loadPage(3, '../../assets/models/g7/page4.glb', '../../assets/sounds/BJmap/place4bj.mp3'));
    mixers.push(await loadPage(4, '../../assets/models/g7/page5.glb', '../../assets/sounds/BJmap/place5bj.mp3'));
    mixers.push(await loadPage(5, '../../assets/models/g7/page6.glb', '../../assets/sounds/BJmap/place6bj.mp3'));
    mixers.push(await loadPage(6, '../../assets/models/g7/page7.glb', '../../assets/sounds/BJmap/place7bj.mp3'));
    mixers.push(await loadPage(7, '../../assets/models/g7/page9.glb', '../../assets/sounds/BJmap/place8bj.mp3'));
    mixers.push(await loadPage(8, '../../assets/models/g7/page11.glb', '../../assets/sounds/BJmap/place9bj.mp3'));

    // Start AR scene
    await mindarThree.start();

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      mixers.forEach((mixer) => mixer.update(delta));  // Update all mixers

      renderer.render(scene, camera);
    });
  };

  start();
});
