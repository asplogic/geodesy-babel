"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Vector3d {
  constructor(x, y, z) {
    if (isNaN(x) || isNaN(x) || isNaN(x)) throw new TypeError(`invalid vector [${x},${y},${z}]`);
    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  plus(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');
    return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  minus(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');
    return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  times(x) {
    if (isNaN(x)) throw new TypeError(`invalid scalar value ‘${x}’`);
    return new Vector3d(this.x * x, this.y * x, this.z * x);
  }

  dividedBy(x) {
    if (isNaN(x)) throw new TypeError(`invalid scalar value ‘${x}’`);
    return new Vector3d(this.x / x, this.y / x, this.z / x);
  }

  dot(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    return new Vector3d(x, y, z);
  }

  negate() {
    return new Vector3d(-this.x, -this.y, -this.z);
  }

  unit() {
    const norm = this.length;
    if (norm == 1) return this;
    if (norm == 0) return this;
    const x = this.x / norm;
    const y = this.y / norm;
    const z = this.z / norm;
    return new Vector3d(x, y, z);
  }

  angleTo(v, n = undefined) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');
    if (!(n instanceof Vector3d || n == undefined)) throw new TypeError('n is not Vector3d object');
    const sign = n == undefined || this.cross(v).dot(n) >= 0 ? 1 : -1;
    const sinθ = this.cross(v).length * sign;
    const cosθ = this.dot(v);
    return Math.atan2(sinθ, cosθ);
  }

  rotateAround(axis, angle) {
    if (!(axis instanceof Vector3d)) throw new TypeError('axis is not Vector3d object');
    const θ = angle.toRadians();
    const p = this.unit();
    const a = axis.unit();
    const s = Math.sin(θ);
    const c = Math.cos(θ);
    const t = 1 - c;
    const x = a.x,
          y = a.y,
          z = a.z;
    const r = [[t * x * x + c, t * x * y - s * z, t * x * z + s * y], [t * x * y + s * z, t * y * y + c, t * y * z - s * x], [t * x * z - s * y, t * y * z + s * x, t * z * z + c]];
    const rp = [r[0][0] * p.x + r[0][1] * p.y + r[0][2] * p.z, r[1][0] * p.x + r[1][1] * p.y + r[1][2] * p.z, r[2][0] * p.x + r[2][1] * p.y + r[2][2] * p.z];
    const p2 = new Vector3d(rp[0], rp[1], rp[2]);
    return p2;
  }

  toString(dp = 3) {
    return `[${this.x.toFixed(dp)},${this.y.toFixed(dp)},${this.z.toFixed(dp)}]`;
  }

}

Number.prototype.toRadians = function () {
  return this * Math.PI / 180;
};

Number.prototype.toDegrees = function () {
  return this * 180 / Math.PI;
};

var _default = Vector3d;
exports.default = _default;