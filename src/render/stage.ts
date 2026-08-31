import * as THREE from 'three';

export interface StageOptions {
  size: number;
  background: string | null; // null = transparent
  pitchDeg: number;
}

/** A self-contained renderer + scene that frames one model and spins it. */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  private readonly pivot: THREE.Group;
  private radius = 1;

  constructor(canvas: HTMLCanvasElement, options: StageOptions) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(1);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 4000);
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);

    const ambient = new THREE.AmbientLight(0xffffff, 2.1);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(1, 2, 3);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-2, 1, -1);
    this.scene.add(ambient, key, rim);

    this.configure(options);
  }

  configure(options: StageOptions): void {
    this.renderer.setSize(options.size, options.size, false);
    this.renderer.setClearColor(
      options.background ?? '#000000',
      options.background === null ? 0 : 1,
    );
    this.camera.aspect = 1;
    const pitch = (options.pitchDeg * Math.PI) / 180;
    // Fit the bounding sphere inside the vertical fov, with a little air.
    const fov = (this.camera.fov * Math.PI) / 180;
    const distance = (this.radius / Math.sin(fov / 2)) * 1.08;
    this.camera.position.set(
      0,
      Math.sin(pitch) * distance,
      Math.cos(pitch) * distance,
    );
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  setModel(group: THREE.Group, options: StageOptions): void {
    this.pivot.clear();

    // Center the model on the turntable axis.
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    this.pivot.add(group);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    this.radius = Math.max(sphere.radius, 0.001);
    this.configure(options);
  }

  renderAngle(angleRad: number): void {
    this.pivot.rotation.y = angleRad;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
