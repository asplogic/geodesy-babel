"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cartesian = void 0;
Object.defineProperty(exports, "Dms", {
  enumerable: true,
  get: function () {
    return _latlonEllipsoidal.Dms;
  }
});
exports.default = exports.Nvector = exports.Ned = void 0;
var _latlonEllipsoidal = _interopRequireWildcard(require("./latlon-ellipsoidal.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
class LatLon_NvectorEllipsoidal extends _latlonEllipsoidal.default {
  deltaTo(point) {
    if (!(point instanceof _latlonEllipsoidal.default)) throw new TypeError(`invalid point ‘${point}’`);
    const c1 = this.toCartesian();
    const c2 = point.toCartesian();
    const δc = c2.minus(c1);
    const n1 = this.toNvector();
    const a = new _latlonEllipsoidal.Vector3d(0, 0, 1);
    const d = n1.negate();
    const e = a.cross(n1).unit();
    const n = e.cross(d);
    const r = [[n.x, n.y, n.z], [e.x, e.y, e.z], [d.x, d.y, d.z]];
    const δn = new _latlonEllipsoidal.Cartesian(r[0][0] * δc.x + r[0][1] * δc.y + r[0][2] * δc.z, r[1][0] * δc.x + r[1][1] * δc.y + r[1][2] * δc.z, r[2][0] * δc.x + r[2][1] * δc.y + r[2][2] * δc.z);
    return new Ned(δn.x, δn.y, δn.z);
  }
  destinationPoint(delta) {
    if (!(delta instanceof Ned)) throw new TypeError('delta is not Ned object');
    const δn = new _latlonEllipsoidal.Vector3d(delta.north, delta.east, delta.down);
    const n1 = this.toNvector();
    const a = new _latlonEllipsoidal.Vector3d(0, 0, 1);
    const d = n1.negate();
    const e = a.cross(n1).unit();
    const n = e.cross(d);
    const r = [[n.x, e.x, d.x], [n.y, e.y, d.y], [n.z, e.z, d.z]];
    const δc = new _latlonEllipsoidal.Cartesian(r[0][0] * δn.x + r[0][1] * δn.y + r[0][2] * δn.z, r[1][0] * δn.x + r[1][1] * δn.y + r[1][2] * δn.z, r[2][0] * δn.x + r[2][1] * δn.y + r[2][2] * δn.z);
    const c1 = this.toCartesian();
    const v2 = c1.plus(δc);
    const c2 = new _latlonEllipsoidal.Cartesian(v2.x, v2.y, v2.z);
    return c2.toLatLon();
  }
  toNvector() {
    const φ = this.lat.toRadians();
    const λ = this.lon.toRadians();
    const sinφ = Math.sin(φ),
      cosφ = Math.cos(φ);
    const sinλ = Math.sin(λ),
      cosλ = Math.cos(λ);
    const x = cosφ * cosλ;
    const y = cosφ * sinλ;
    const z = sinφ;
    return new NvectorEllipsoidal(x, y, z, this.h, this.datum);
  }
  toCartesian() {
    const c = super.toCartesian();
    return new Cartesian_Nvector(c.x, c.y, c.z);
  }
}
exports.default = LatLon_NvectorEllipsoidal;
class NvectorEllipsoidal extends _latlonEllipsoidal.Vector3d {
  constructor(x, y, z, h = 0, datum = _latlonEllipsoidal.default.datums.WGS84) {
    const u = new _latlonEllipsoidal.Vector3d(x, y, z).unit();
    super(u.x, u.y, u.z);
    this.h = Number(h);
    this.datum = datum;
  }
  toLatLon() {
    const {
      x,
      y,
      z
    } = this;
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    return new LatLon_NvectorEllipsoidal(φ.toDegrees(), λ.toDegrees(), this.h, this.datum);
  }
  toCartesian() {
    const {
      b,
      f
    } = this.datum.ellipsoid;
    const {
      x,
      y,
      z,
      h
    } = this;
    const m = (1 - f) * (1 - f);
    const n = b / Math.sqrt(x * x / m + y * y / m + z * z);
    const xʹ = n * x / m + x * h;
    const yʹ = n * y / m + y * h;
    const zʹ = n * z + z * h;
    return new Cartesian_Nvector(xʹ, yʹ, zʹ);
  }
  toString(dp = 3, dpHeight = null) {
    const {
      x,
      y,
      z
    } = this;
    const h = `${this.h >= 0 ? '+' : ''}${this.h.toFixed(dpHeight)}m`;
    return `[${x.toFixed(dp)},${y.toFixed(dp)},${z.toFixed(dp)}${dpHeight == null ? '' : h}]`;
  }
}
exports.Nvector = NvectorEllipsoidal;
class Cartesian_Nvector extends _latlonEllipsoidal.Cartesian {
  toNvector(datum = _latlonEllipsoidal.default.datums.WGS84) {
    const {
      a,
      f
    } = datum.ellipsoid;
    const {
      x,
      y,
      z
    } = this;
    const e2 = 2 * f - f * f;
    const e4 = e2 * e2;
    const p = (x * x + y * y) / (a * a);
    const q = z * z * (1 - e2) / (a * a);
    const r = (p + q - e4) / 6;
    const s = e4 * p * q / (4 * r * r * r);
    const t = Math.cbrt(1 + s + Math.sqrt(2 * s + s * s));
    const u = r * (1 + t + 1 / t);
    const v = Math.sqrt(u * u + e4 * q);
    const w = e2 * (u + v - q) / (2 * v);
    const k = Math.sqrt(u + v + w * w) - w;
    const d = k * Math.sqrt(x * x + y * y) / (k + e2);
    const tmp = 1 / Math.sqrt(d * d + z * z);
    const xʹ = tmp * k / (k + e2) * x;
    const yʹ = tmp * k / (k + e2) * y;
    const zʹ = tmp * z;
    const h = (k + e2 - 1) / k * Math.sqrt(d * d + z * z);
    const n = new NvectorEllipsoidal(xʹ, yʹ, zʹ, h, datum);
    return n;
  }
}
exports.Cartesian = Cartesian_Nvector;
class Ned {
  constructor(north, east, down) {
    this.north = north;
    this.east = east;
    this.down = down;
  }
  get length() {
    const {
      north,
      east,
      down
    } = this;
    return Math.sqrt(north * north + east * east + down * down);
  }
  get bearing() {
    const θ = Math.atan2(this.east, this.north);
    return _latlonEllipsoidal.Dms.wrap360(θ.toDegrees());
  }
  get elevation() {
    const α = Math.asin(this.down / this.length);
    return -α.toDegrees();
  }
  static fromDistanceBearingElevation(dist, brng, elev) {
    const θ = Number(brng).toRadians();
    const α = Number(elev).toRadians();
    dist = Number(dist);
    const sinθ = Math.sin(θ),
      cosθ = Math.cos(θ);
    const sinα = Math.sin(α),
      cosα = Math.cos(α);
    const n = cosθ * dist * cosα;
    const e = sinθ * dist * cosα;
    const d = -sinα * dist;
    return new Ned(n, e, d);
  }
  toString(dp = 0) {
    return `[N:${this.north.toFixed(dp)},E:${this.east.toFixed(dp)},D:${this.down.toFixed(dp)}]`;
  }
}
exports.Ned = Ned;