/**
 * AssetLoader.js
 * Centralized asset loading utilities.
 * Handles GLTF/DRACO model loading for future use.
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export class AssetLoader {
  constructor() {
    this._gltfLoader = new GLTFLoader();
    this._dracoLoader = new DRACOLoader();
    this._dracoLoader.setDecoderPath('/draco/');
    this._gltfLoader.setDRACOLoader(this._dracoLoader);

    /** @type {Map<string, THREE.Group>} */
    this._cache = new Map();
  }

  /**
   * Load a GLTF model.
   * @param {string} path — Path to the .gltf file
   * @param {string} [cacheKey] — Optional cache key
   * @returns {Promise<THREE.Group>}
   */
  async loadModel(path, cacheKey) {
    const key = cacheKey || path;

    if (this._cache.has(key)) {
      return this._cache.get(key).clone();
    }

    return new Promise((resolve, reject) => {
      this._gltfLoader.load(
        path,
        (gltf) => {
          this._cache.set(key, gltf.scene);
          resolve(gltf.scene.clone());
        },
        undefined,
        (error) => {
          console.error(`AssetLoader: Failed to load ${path}`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Clear the model cache.
   */
  clearCache() {
    this._cache.clear();
  }
}
