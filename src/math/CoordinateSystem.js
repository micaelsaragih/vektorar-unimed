/**
 * CoordinateSystem.js
 * Creates the 3D XYZ coordinate axes with labels and tick marks.
 * Professional mathematical visualization style.
 */

import * as THREE from 'three';
import { COORDINATE_SYSTEM, COLORS } from '../core/Constants.js';
import { createTextSprite } from '../vectors/VectorLabel.js';

export class CoordinateSystem {
  /**
   * @param {object} [options]
   * @param {number} [options.axisLength] — Override axis length
   */
  constructor(options = {}) {
    const axisLength = options.axisLength || COORDINATE_SYSTEM.axisLength;

    this.group = new THREE.Group();
    this.group.name = 'coordinate-system';

    this._createAxes(axisLength);
    this._createTickMarks(axisLength);
    this._createLabels(axisLength);
    this._createOriginMarker();
  }

  /**
   * Create the three axis arrows (X=red, Y=green, Z=blue).
   * Each axis is a cylinder shaft + cone arrowhead in both positive and negative directions.
   */
  _createAxes(length) {
    const axes = [
      { dir: new THREE.Vector3(1, 0, 0), color: COLORS.xAxis, name: 'x-axis' },
      { dir: new THREE.Vector3(0, 1, 0), color: COLORS.yAxis, name: 'y-axis' },
      { dir: new THREE.Vector3(0, 0, 1), color: COLORS.zAxis, name: 'z-axis' },
    ];

    for (const axis of axes) {
      // Positive direction — full arrow
      const arrow = this._createAxisArrow(axis.dir, length, axis.color);
      arrow.name = axis.name;
      this.group.add(arrow);

      // Negative direction — thin line (no arrowhead, dimmer)
      const negDir = axis.dir.clone().negate();
      const negLine = this._createAxisLine(negDir, length * 0.6, axis.color, 0.4);
      negLine.name = `${axis.name}-negative`;
      this.group.add(negLine);
    }
  }

  /**
   * Create a single axis arrow (shaft + arrowhead).
   */
  _createAxisArrow(direction, length, color) {
    const group = new THREE.Group();

    const shaftLength = length - COORDINATE_SYSTEM.arrowHeadLength;

    // Shaft (cylinder)
    const shaftGeometry = new THREE.CylinderGeometry(
      COORDINATE_SYSTEM.axisThickness,
      COORDINATE_SYSTEM.axisThickness,
      shaftLength,
      8
    );
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.15,
      metalness: 0.3,
      roughness: 0.6,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = shaftLength / 2;
    group.add(shaft);

    // Arrowhead (cone)
    const headGeometry = new THREE.ConeGeometry(
      COORDINATE_SYSTEM.arrowHeadRadius,
      COORDINATE_SYSTEM.arrowHeadLength,
      COORDINATE_SYSTEM.arrowSegments
    );
    const headMaterial = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.2,
      metalness: 0.3,
      roughness: 0.5,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = shaftLength + COORDINATE_SYSTEM.arrowHeadLength / 2;
    group.add(head);

    // Orient the group so Y-up aligns with the target direction
    this._orientGroup(group, direction);

    return group;
  }

  /**
   * Create a thin dimmed axis line for negative direction.
   */
  _createAxisLine(direction, length, color, opacity) {
    const geometry = new THREE.CylinderGeometry(
      COORDINATE_SYSTEM.axisThickness * 0.5,
      COORDINATE_SYSTEM.axisThickness * 0.5,
      length,
      6
    );
    const material = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      metalness: 0.2,
      roughness: 0.8,
    });
    const line = new THREE.Mesh(geometry, material);
    line.position.y = length / 2;

    const group = new THREE.Group();
    group.add(line);
    this._orientGroup(group, direction);

    return group;
  }

  /**
   * Orient a group (built along Y-axis) to point in target direction.
   */
  _orientGroup(group, direction) {
    if (direction.y === 1) {
      // Already aligned with Y
    } else if (direction.y === -1) {
      group.rotation.z = Math.PI;
    } else if (direction.x === 1) {
      group.rotation.z = -Math.PI / 2;
    } else if (direction.x === -1) {
      group.rotation.z = Math.PI / 2;
    } else if (direction.z === 1) {
      group.rotation.x = Math.PI / 2;
    } else if (direction.z === -1) {
      group.rotation.x = -Math.PI / 2;
    }
  }

  /**
   * Create tick marks along each axis.
   */
  _createTickMarks(length) {
    const interval = COORDINATE_SYSTEM.tickMarkInterval;
    const tickLen = COORDINATE_SYSTEM.tickMarkLength;

    const axes = [
      { dir: 'x', color: COLORS.xAxis },
      { dir: 'y', color: COLORS.yAxis },
      { dir: 'z', color: COLORS.zAxis },
    ];

    const tickGeometry = new THREE.BoxGeometry(tickLen, tickLen, tickLen);

    for (const axis of axes) {
      const tickMaterial = new THREE.MeshStandardMaterial({
        color: axis.color,
        transparent: true,
        opacity: 0.5,
      });

      for (let i = interval; i < length; i += interval) {
        // Positive tick
        const tickPos = new THREE.Mesh(tickGeometry, tickMaterial);
        if (axis.dir === 'x') tickPos.position.set(i, 0, 0);
        else if (axis.dir === 'y') tickPos.position.set(0, i, 0);
        else tickPos.position.set(0, 0, i);
        tickPos.name = `tick-${axis.dir}-${i}`;
        this.group.add(tickPos);

        // Negative tick (dimmer)
        const negTickMaterial = new THREE.MeshStandardMaterial({
          color: axis.color,
          transparent: true,
          opacity: 0.25,
        });
        const tickNeg = new THREE.Mesh(tickGeometry, negTickMaterial);
        if (axis.dir === 'x') tickNeg.position.set(-i, 0, 0);
        else if (axis.dir === 'y') tickNeg.position.set(0, -i, 0);
        else tickNeg.position.set(0, 0, -i);
        tickNeg.name = `tick-${axis.dir}-neg-${i}`;
        this.group.add(tickNeg);
      }
    }
  }

  /**
   * Create axis labels (X, Y, Z) at the ends of each axis.
   */
  _createLabels(length) {
    const offset = COORDINATE_SYSTEM.labelOffset;
    const size = COORDINATE_SYSTEM.labelSize;

    const labels = [
      { text: 'X', position: new THREE.Vector3(length + offset, 0, 0), color: COLORS.xAxis },
      { text: 'Y', position: new THREE.Vector3(0, length + offset, 0), color: COLORS.yAxis },
      { text: 'Z', position: new THREE.Vector3(0, 0, length + offset), color: COLORS.zAxis },
    ];

    for (const label of labels) {
      const sprite = createTextSprite(label.text, {
        fontSize: 48,
        color: '#' + new THREE.Color(label.color).getHexString(),
        fontWeight: 'bold',
        backgroundColor: 'rgba(10, 10, 26, 0.6)',
        padding: 10,
        borderRadius: 6,
      });
      sprite.position.copy(label.position);
      sprite.scale.set(size, size, 1);
      sprite.name = `label-${label.text.toLowerCase()}`;
      this.group.add(sprite);
    }
  }

  /**
   * Create a small sphere at the origin.
   */
  _createOriginMarker() {
    const geometry = new THREE.SphereGeometry(0.06, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.origin,
      emissive: COLORS.origin,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.3,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = 'origin-marker';
    this.group.add(sphere);
  }

  /**
   * Add the entire coordinate system to a scene or group.
   * @param {THREE.Scene | THREE.Group} parent
   */
  addTo(parent) {
    parent.add(this.group);
  }

  /**
   * Remove from parent.
   */
  removeFrom(parent) {
    parent.remove(this.group);
  }

  /**
   * Set visibility.
   * @param {boolean} visible
   */
  setVisible(visible) {
    this.group.visible = visible;
  }
}
