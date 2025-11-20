<script lang="ts">
  /* # --- Mappings (Phoneme -> Viseme -> Blendshape 52 -> blendshapes 121) ---
     # AE, Ah, B_M_P, Ch_J, EE, Er, F_V, Ih, K_G_H_NG, Oh, R, S_Z, T_L_D_N, Th and W_OO.
     # https://manual.reallusion.com/Character-Creator-4/Content/ENU/4.0/06-Facial-Profile-Editor/8_7_and_1_1.htm */

  import { onMount, onDestroy } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
  import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
  import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
  import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
  import { DAMPING_FACTOR } from "../Modalities/Visemes/Static";
  import loading from "$lib/images/loading.gif";
  import {
    agentStore,
    initializedTrigger,
    triggerAction,
  } from "$lib/Agent/Agent";
  import { get } from "svelte/store";
  import { chatStore } from "$lib/User/chatStore";
  import { browser } from "$app/environment";
  import { generalStore } from "$lib/Misc/generalStore";
  import thinkGIF from "$lib/images/think.gif";
  import server_sleep from "$lib/images/Misc/server_sleep.gif";
  import { FRAME_RATE, server_exhausted } from "$lib/General";
  import { get_avatar_gender } from "$lib/Misc/sessionStore";

  import { startBackgroundAudio, stopBackgroundAudio } from "./Logic/Misc";
  import {
    disposeMaterial,
    setBackgroundImage,
    type LightPreset,
  } from "./Avatar";

  let canvasContainer;
  let renderer: THREE.WebGLRenderer | null,
    camera: THREE.PerspectiveCamera | null,
    controls: OrbitControls | null,
    gui,
    animationFrameId: number | null;
  let onResize: (() => void) | null;

  let baseIdle: THREE.AnimationAction | null = null;

  let scene: THREE.Scene | null;
  const HEAD_MESH_NAME_MALE = "Mesh001";
  const HEAD_MESH_NAME_FEMALE = "NUG_Base_Body";
  let HEAD_MESH_NAME_CURR = null;

  let lite = false;
  $: lite = $generalStore.LITE_MODE === true;

  const animationPool_Male = [
    "Adjust Level Of",
    "Idle Kurz",
    "Idle Body Shake",
  ];

  /* perf overlay instance */
  const MALE_URL =
    "https://histar.informatik.uni-bremen.de/assets/models/Male_Version_2.glb";
  const FEMALE_URL =
    "https://histar.informatik.uni-bremen.de/assets/models/Female_Version_4.glb";

  /* Animation */
  let delta = 0,
    currentAction;
  let FPS_COUNT;
  let CURR_GLTF;

  let blinkAction: THREE.AnimationAction | null = null;
  let actions = new Map<string, THREE.AnimationAction>();
  /*  const stats = new Stats();
  document.body.appendChild(stats.dom); */

  /* morphing, blendshapes */
  let headMesh_CURR: any,
    model: THREE.Object3D | null,
    mixer: THREE.AnimationMixer | null;

  /* Animatio  allosauris */
  let blendshapeAnimation = [],
    audioStartTime = 0,
    isAnimatingVisemes = false,
    smileIndex = 0;

  /* HDRI */
  let textureLoader = new THREE.TextureLoader();
  let pmremHDRI: THREE.PMREMGenerator | null = null;
  let currentEnvTex: THREE.Texture | null = null;
  let currentBgTex: THREE.Texture | null = null;
  let pmrem: THREE.PMREMGenerator | null = null;
  let cachedEnvFromURL: Record<string, THREE.Texture> = {};
  let lastURL = "";

  /* audio lifcecycle */
  let currentAudio: HTMLAudioElement | null = null;
  let currentAudioUrl: string | null = null;

  function initScene(container) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      80 /* 105 */,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 1.6, 0.8);
    const DPR_MAX = lite ? 1 : 1.5;

    renderer = new THREE.WebGLRenderer({
      antialias: lite ? false : true,
      powerPreference:
        "low-power" /* lite ? "low-power" : "high-performance" */,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_MAX));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
  }

  function initControls(camera, domElement) {
    controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.maxDistance = 0.7;
    controls.minDistance = 0.5;
    controls.target.set(
      0,
      1.5,
      0
    ); /* muss matchen immer mit  camera.position.set(0, 1.5, 2); */
    return controls;
  }

  export async function initAvatar(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer
  ) {
    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath(
        "https://unpkg.com/three@0.165.0/examples/jsm/libs/basis/"
      )
      .detectSupport(renderer);
    const dracoLoader = new DRACOLoader().setDecoderPath(
      "https://unpkg.com/three@0.165.0/examples/jsm/libs/draco/"
    );

    const loader = new GLTFLoader()
      .setKTX2Loader(ktx2Loader)
      .setDRACOLoader(dracoLoader)
      .setMeshoptDecoder(MeshoptDecoder);

    ktx2Loader.detectSupport(renderer);

    /* muss noch in belnder  */
    // loader.register((parser) => new MSFTLODPlugin(parser));
    loader.setCrossOrigin("anonymous");

    async function loadAvatar(url: string, gender = "male") {
      HEAD_MESH_NAME_CURR =
        gender === "male" ? HEAD_MESH_NAME_MALE : HEAD_MESH_NAME_FEMALE;

      /* await enableProgressive(loader, renderer); */
      const gltf = await loader.loadAsync(url);
      const avatar = gltf.scene;

      avatar.position?.set(0, gender === "male" ? 0 : 0.13, 0);
      scene.add(avatar);

      CURR_GLTF?.dispose();
      CURR_GLTF = null;
      CURR_GLTF = gltf;
      model = avatar;

      mixer = new THREE.AnimationMixer(model);
      actions.clear();
      ensureBaseIdle();

      headMesh_CURR = (model as any).getObjectByName(
        gender === "male" ? HEAD_MESH_NAME_MALE : HEAD_MESH_NAME_FEMALE
      ) as any;

      /* console.log("headMesh_CURR:", headMesh_CURR); */
      startBlinkBase();
      //setExpression("default");
      /* https://discourse.threejs.org/t/swapping-between-2-model-glb/47052 */
      return gltf;
    }

    const initialGender = $chatStore.avatar_gender;
    const initialUrl = initialGender === "female" ? FEMALE_URL : MALE_URL;
    await loadAvatar(initialUrl, initialGender);

    if (mixer) {
      mixer.removeEventListener("finished");
      mixer.addEventListener("finished", (e: any) => {
        if (!mixer) return;
        if (!baseIdle) ensureBaseIdle();
        const a = e?.action;
        if (a && baseIdle && a !== baseIdle) {
          baseIdle.enabled = true;
          baseIdle.setLoop(THREE.LoopRepeat, Infinity);
          baseIdle.setEffectiveWeight(1);
          baseIdle.reset();
          baseIdle.play();
          a.crossFadeTo(baseIdle, 0.3, false);
          currentAction = baseIdle;
        }
      });
    }

    ktx2Loader.dispose();
    dracoLoader.dispose();
    return mixer;
  }

  function getAction(name: string) {
    const clip = CURR_GLTF?.animations.find((a) => a.name === name);
    if (!clip || !mixer) return null;
    let a = actions.get(name);
    if (!a) {
      a = mixer.clipAction(clip);
      actions.set(name, a);
    }
    a.enabled = true;
    a.setEffectiveWeight(1);
    a.setEffectiveTimeScale(1);
    return a;
  }

  function ensureBaseIdle() {
    if (baseIdle || !mixer) return;
    baseIdle = getAction("Standard Idle");
    baseIdle.reset();
    baseIdle.setLoop(THREE.LoopRepeat, Infinity);
    baseIdle.enabled = true;
    baseIdle.setEffectiveWeight(1);
    baseIdle.setEffectiveTimeScale(1);
    baseIdle.play();
    currentAction = baseIdle;
  }

  function disposeTexture(t?: any) {
    if (t && t.isTexture) t.dispose();
  }

  export async function initOrApplyEnvironment_HDRI(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    opts?: {
      type?: "day" | "sunset" | "night" | "default";
      lite?: boolean;
      bgURL?: string;
      yawDeg?: number;
      brightness?: number;
      lightPresets?: LightPreset;
    }
  ) {
    const lite = !!opts?.lite;
    const yaw = THREE.MathUtils.degToRad(opts?.yawDeg ?? 0);
    const b = opts?.brightness ?? 1;

    renderer.toneMapping = lite
      ? THREE.NoToneMapping
      : THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !lite;

    const hemi =
      (scene.getObjectByName("HemiLight") as THREE.HemisphereLight) ||
      (() => {
        const l = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        l.name = "HemiLight";
        scene.add(l);
        return l;
      })();
    const sun =
      (scene.getObjectByName("SunLight") as THREE.DirectionalLight) ||
      (() => {
        const l = new THREE.DirectionalLight(0xffffff, 1);
        l.name = "SunLight";
        scene.add(l);
        return l;
      })();
    const fill =
      (scene.getObjectByName("FillLight") as THREE.DirectionalLight) ||
      (() => {
        const l = new THREE.DirectionalLight(0xffffff, 1);
        l.name = "FillLight";
        scene.add(l);
        return l;
      })();

    const p = opts?.lightPresets;
    if (p) {
      hemi.color.setHex(p.hemi.color);
      (hemi as any).groundColor?.setHex?.(p.hemi.ground);
      hemi.intensity = p.hemi.intensity * b;

      sun.color.setHex(p.sun.color);
      sun.intensity = p.sun.intensity * b;
      sun.position.set(...p.sun.pos);

      fill.color.setHex(p.fill.color);
      fill.intensity = p.fill.intensity * b;
      fill.position.set(...p.fill.pos);
    }

    if (!pmrem) {
      pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
    }
    const url = opts?.bgURL;
    if (!url) return;
    if (lastURL === url) {
      if ("environmentRotation" in scene)
        (scene as any).environmentRotation = new THREE.Euler(0, yaw, 0);
      if ("backgroundRotation" in scene)
        (scene as any).backgroundRotation = new THREE.Euler(0, yaw, 0);
      return;
    }
    lastURL = url;

    new THREE.TextureLoader().load(url, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      const env = pmrem!.fromEquirectangular(tex).texture;
      scene.environment = env;
      scene.background = tex;
      if ("environmentRotation" in scene)
        (scene as any).environmentRotation = new THREE.Euler(0, yaw, 0);
      if ("backgroundRotation" in scene)
        (scene as any).backgroundRotation = new THREE.Euler(0, yaw, 0);
    });
  }
  function disposeTex(t?: THREE.Texture | null) {
    if (!t) return;
    t.dispose?.();
  }

  /* ----------------------------------------------------------------- */
  /* ----------------------------------------------------------------- */
  /* ----------------------------------------------------------------- */

  /* https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js */
  /* wenn numberRepeat = -1 dann endlos */

  /* RESET_ANIMATIONS */
  function playAnimation(
    name: string,
    {
      loop = "once",
      duration = 2,
      fade = 0.95,
    }: {
      loop?: "once" | "repeat" | "infinite";
      duration?: number;
      fade?: number;
    } = {}
  ) {
    if (!mixer || !CURR_GLTF) return;
    ensureBaseIdle();

    const next = getAction(name);
    if (!next) return;

    next.reset();
    if (loop === "infinite") next.setLoop(THREE.LoopRepeat, Infinity);
    else if (loop === "repeat") next.setLoop(THREE.LoopRepeat, duration);
    else next.setLoop(THREE.LoopOnce, 0);

    next.clampWhenFinished = true;
    next.enabled = true;
    next.setEffectiveWeight(1);
    next.setEffectiveTimeScale(1);
    next.time = 0;
    next.play();

    if (currentAction && currentAction !== next) {
      currentAction.crossFadeTo(next, fade, false);
    } else {
      next.fadeIn(fade);
    }
    currentAction = next;

    if (baseIdle && currentAction !== baseIdle) {
      baseIdle.enabled = true;
      baseIdle.setLoop(THREE.LoopRepeat, Infinity);
      baseIdle.play();
    }
  }

  /* ----------------------------------------------------------------- */
  /* --------------------- EXPRESSIONS --------------------------- */
  /* ----------------------------------------------------------------- */

  function startBlinkBase(clipName = "Blink_Movements", weight = 1) {
    const src = CURR_GLTF?.animations.find((a) => a.name === clipName);
    if (!src || !mixer || !headMesh_CURR) return;

    blinkAction?.stop();
    blinkAction = mixer.clipAction(src);
    /* blinkAction.blendMode = THREE.AdditiveAnimationBlendMode; */
    blinkAction.reset();
    blinkAction.setLoop(THREE.LoopRepeat, Infinity);
    blinkAction.enabled = true;
    blinkAction.setEffectiveWeight(weight);
    blinkAction.setEffectiveTimeScale(1);
    blinkAction.play();
  }

  /* ----------------------------------------------------------------- */
  /* ------------------ Animation to Audio stuff---------------------   */
  /* ----------------------------------------------------------------- */
  const SMOOTHING_FACTOR = 0.2;

  function playAction(action) {
    /*   const frames = phonemes_to_blendshapes(json.phonemes, FRAME_RATE, 0.8);
     */
    blendshapeAnimation = get(agentStore).blendshapes;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }

    const audioBlob = get(agentStore).audioBlob;
    currentAudioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null;
    const audio = currentAudioUrl ? new Audio(currentAudioUrl) : null;

    console.log("action", action);

    if (audio) {
      currentAudio = audio;
      audio.onplay = () => {
        audioStartTime = performance.now();
        isAnimatingVisemes = true;
      };
      audio.onended = () => {
        if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
        currentAudio = null;
      };
      audio.play();
    }
  }

  /* https://threejs.org/docs/#api/en/animation/AnimationAction */

  function updateLipSyncAnimation() {
    if (
      !isAnimatingVisemes ||
      blendshapeAnimation.length === 0 ||
      !headMesh_CURR?.morphTargetDictionary
    ) {
      return;
    }
    const elapsedTime = (performance.now() - audioStartTime) / 1000;
    const currentFrameIndex = Math.floor(elapsedTime * FRAME_RATE);

    if (currentFrameIndex >= blendshapeAnimation.length) {
      endLipSyncAnimation();
      return;
    }
    const targetFrameData = blendshapeAnimation[currentFrameIndex];
    for (const [morphName, value] of Object.entries(targetFrameData)) {
      const indx = headMesh_CURR?.morphTargetDictionary[morphName];
      setTargetValue(indx, value);
    }
  }

  function endLipSyncAnimation() {
    isAnimatingVisemes = false;

    for (const morphName in headMesh_CURR?.morphTargetDictionary) {
      const idx = headMesh_CURR?.morphTargetDictionary[morphName];
      setTargetValue(idx, 0);
    }
    /* setExpression("default"); */
  }

  /* TESITNG */
  /*   for (const [morphName, value] of Object.entries(
    CalculatedBlendshapesForThisFrame
  )) {
    const indx = headMesh_CURR?.morphTargetDictionary[morphName];
    headMesh_CURR.morphTargetInfluences[indx] = THREE.MathUtils.lerp(
      headMesh_CURR.morphTargetInfluences[indx], // aktueller wert
      value * DAMPING_FACTOR, // zielwert
      SMOOTHING_FACTOR // glättungsfaktor
    );
  }
 */
  function setTargetValue(indx, targetValue) {
    headMesh_CURR.morphTargetInfluences[indx] = THREE.MathUtils.lerp(
      headMesh_CURR.morphTargetInfluences[indx],
      targetValue * DAMPING_FACTOR,
      SMOOTHING_FACTOR
    );
  }

  /* https://discourse.threejs.org/t/blendshape-animation-for-visemes-slow/61681 */
  /* https://wave surfer.xyz/examples/?regions.js */

  function startAnimationLoop({ renderer, scene, camera, mixer, controls }) {
    const clock = new THREE.Clock();

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      delta = clock.getDelta();
      if (mixer) mixer.update(Math.min(delta, 0.04));
      updateLipSyncAnimation();
      if (controls) controls.update();
      /* stats.update(); */
      if (renderer) renderer.render(scene, camera);
    }
    animate();
  }

  /* ----------------------------------------------------------------- */
  /* ----------------------------------------------------------------- */
  /* ----------------------------------------------------------------- */

  const playActionHandler = (action) => {
    chatStore.update((s) => ({ ...s, thinking: false }));

    if (action.output_speech) {
      playAction(action);
      /* playAnimation("Talking", { loop: "repeat", duration: 1 }); */
    } else if (action.output_animation) {
      playAnimation(action.animation, { loop: "repeat", duration: 1 });
    }
  };

  function disposeObject3D(root: THREE.Object3D) {
    root.traverse((o: any) => {
      if (o.isMesh) {
        o.geometry && o.geometry.dispose();
        disposeMaterial(o.material);
      }
    });
  }

  function switchGender() {
    location.reload();
  }

  function cleanup() {
    stopBackgroundAudio();

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = null;

    if (onResize) {
      window.removeEventListener("resize", onResize);
    }
    onResize = null;

    // triggerAction.off("SPEECH_ANIMATION");
    triggerAction.off && triggerAction.off("PLAY_ACTION", playActionHandler);
    triggerAction.off("SWITCH_GENDER", switchGender);

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }

    if (mixer && model) {
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
    }
    if (scene && model) {
      scene.remove(model);
      disposeObject3D(model);
    }
    model = null;
    mixer = null;

    /* https://github.com/donmccurdy/three-gltf-viewer/blob/main/src/viewer.js#L678 */
    if (scene) {
      disposeTexture(currentEnvTex);
      currentEnvTex = null;
      disposeTexture(currentBgTex);
      currentBgTex = null;
      if ((scene as any).background && (scene as any).background.isTexture)
        (scene as any).background.dispose();
      if ((scene as any).environment && (scene as any).environment.isTexture)
        (scene as any).environment.dispose();
    }

    if (pmremHDRI) {
      pmremHDRI.dispose();
      pmremHDRI = null;
    }

    if (controls) {
      controls.dispose();
      controls = null;
    }
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement && renderer.domElement.parentElement)
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      renderer = null;
    }

    scene = null;
    camera = null;
    gui = null;
    CURR_GLTF = null;
  }

  onMount(async () => {
    if (!browser) return;
    if (scene) return;

    get_avatar_gender();

    initScene(canvasContainer);
    controls = initControls(camera, renderer.domElement);

    setBackgroundImage();
    startBackgroundAudio();

    /* $chatStore.backgroundImage = backgrounds.default[1]; */
    initOrApplyEnvironment_HDRI(scene, renderer, {
      lite,
      type: $chatStore.backgroundImage.type,
      bgURL: $chatStore.backgroundImage.src,
      yawDeg: $chatStore.backgroundImage.yawDeg,
      brightness: $chatStore.backgroundImage.brightness,
      lightPresets: $chatStore.backgroundImage.lightPresets,
    });
    mixer = await initAvatar(scene, renderer);

    startAnimationLoop({ renderer, scene, camera, mixer, controls });

    onResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", onResize);

    triggerAction.on && triggerAction.on("PLAY_ACTION", playActionHandler);
    triggerAction.on("SWITCH_GENDER", switchGender);
    triggerAction.on("SWITCH_ENVIRONMENT", switchEnvironment);

    if (CURR_GLTF) {
      $generalStore.ASSETS_LOADED = true;
    }

    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        cleanup();
      });
    }

    initializedTrigger.emit("AVATAR", {});
  });

  function switchEnvironment() {
    console.log("switchEnvironment");

    initOrApplyEnvironment_HDRI(scene, renderer, {
      lite,
      type: $chatStore.backgroundImage.type,
      bgURL: $chatStore.backgroundImage.src,
      yawDeg: $chatStore.backgroundImage.yawDeg,
      brightness: $chatStore.backgroundImage.brightness,
      lightPresets: $chatStore.backgroundImage.lightPresets,
      reusePMREM: true,
    });
  }

  onDestroy(() => {
    cleanup();
  });

  $: {
    if ($server_exhausted) {
      playAnimation("Lying Down Server Busy", {
        loop: "infinite",
        duration: 1,
      });
    }
  }
</script>

<svelte:head><title>Ai Tutor</title></svelte:head>

<div class="fps">{JSON.stringify($FPS_COUNT)}</div>

{#if !$generalStore.ASSETS_LOADED}
  <div class="loading-gif-container">
    <img
      src={loading}
      alt="Avatar"
      width="356"
      height="156"
      decoding="async"
      loading="lazy"
      fetchpriority="low"
      draggable="false"
    />
  </div>
{/if}

{#if $chatStore.thinking}
  <div class="loading-gifTHINK-container">
    <img
      src={thinkGIF}
      alt="Thinking..."
      width="256"
      height="256"
      decoding="async"
      loading="lazy"
      fetchpriority="low"
      draggable="false"
    />
  </div>
{/if}
{#if $server_exhausted}
  <div class="loading-gifTHINK-container">
    <img
      src={server_sleep}
      decoding="async"
      width="256"
      height="256"
      loading="lazy"
      fetchpriority="low"
      draggable="false"
      alt="Servers are exhausted..."
    />
  </div>
{/if}

<!-- svelte-ignore element_invalid_self_closing_tag -->
<div bind:this={canvasContainer} class="scene-container" />

<style>
  .fps {
    position: fixed;
    top: 100px;
    right: 60px;
    color: rgb(255, 255, 255);
    z-index: 9999;
    font-size: 12px;
  }

  .loading-gif-container {
    display: flex;
    justify-content: center; /*hi  */
    align-items: center;
    width: 100%;
    filter: invert(1);
    height: 100%;
  }

  :global(#three-perf-ui) {
    margin-top: 80px;
    right: 10px;
  }
  :global(.three-perf) {
    top: 20px !important;
    right: 12px !important;
    z-index: 9999 !important;
  }

  :global(#gui_css) {
    margin-top: 100px;
    right: 10px;
  }

  .scene-container {
    width: 100vw;
    height: 100vh;
    display: block;
    margin: 0;
    padding: 0;
  }

  .loading-gifTHINK-container {
    position: absolute;
    top: -120px;
    left: 150px;
    width: 100vw;
    filter: invert(1);
    pointer-events: none;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    z-index: 1000;
  }

  .loading-gifTHINK-container img {
    width: 120px;
    height: auto;
    pointer-events: none;
    filter: invert(1);
    /*  color: #ffce2c; */
  }
</style>
