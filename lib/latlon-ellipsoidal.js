"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cartesian = void 0;
Object.defineProperty(exports, "Dms", {
  enumerable: true,
  get: function () {
    return _dms.default;
  }
});
Object.defineProperty(exports, "Vector3d", {
  enumerable: true,
  get: function () {
    return _vector3d.default;
  }
});
exports.default = void 0;
var _dms = _interopRequireDefault(require("./dms.js"));
var _vector3d = _interopRequireDefault(require("./vector3d.js"));
const ellipsoids = {
  WGS84: {
    a: 6378137,
    b: 6356752.314245,
    f: 1 / 298.257223563
  }
};
const datums = {
  WGS84: {
    ellipsoid: ellipsoids.WGS84
  }
};
Object.freeze(ellipsoids.WGS84);
Object.freeze(datums.WGS84);
class LatLonEllipsoidal {
  constructor(lat, lon, height = 0) {
    if (isNaN(lat) || lat == null) throw new TypeError(`invalid lat ‘${lat}’`);
    if (isNaN(lon) || lon == null) throw new TypeError(`invalid lon ‘${lon}’`);
    if (isNaN(height) || height == null) throw new TypeError(`invalid height ‘${height}’`);
    this._lat = _dms.default.wrap90(Number(lat));
    this._lon = _dms.default.wrap180(Number(lon));
    this._height = Number(height);
  }
  get lat() {
    return this._lat;
  }
  get latitude() {
    return this._lat;
  }
  set lat(lat) {
    this._lat = isNaN(lat) ? _dms.default.wrap90(_dms.default.parse(lat)) : _dms.default.wrap90(Number(lat));
    if (isNaN(this._lat)) throw new TypeError(`invalid lat ‘${lat}’`);
  }
  set latitude(lat) {
    this._lat = isNaN(lat) ? _dms.default.wrap90(_dms.default.parse(lat)) : _dms.default.wrap90(Number(lat));
    if (isNaN(this._lat)) throw new TypeError(`invalid latitude ‘${lat}’`);
  }
  get lon() {
    return this._lon;
  }
  get lng() {
    return this._lon;
  }
  get longitude() {
    return this._lon;
  }
  set lon(lon) {
    this._lon = isNaN(lon) ? _dms.default.wrap180(_dms.default.parse(lon)) : _dms.default.wrap180(Number(lon));
    if (isNaN(this._lon)) throw new TypeError(`invalid lon ‘${lon}’`);
  }
  set lng(lon) {
    this._lon = isNaN(lon) ? _dms.default.wrap180(_dms.default.parse(lon)) : _dms.default.wrap180(Number(lon));
    if (isNaN(this._lon)) throw new TypeError(`invalid lng ‘${lon}’`);
  }
  set longitude(lon) {
    this._lon = isNaN(lon) ? _dms.default.wrap180(_dms.default.parse(lon)) : _dms.default.wrap180(Number(lon));
    if (isNaN(this._lon)) throw new TypeError(`invalid longitude ‘${lon}’`);
  }
  get height() {
    return this._height;
  }
  set height(height) {
    this._height = Number(height);
    if (isNaN(this._height)) throw new TypeError(`invalid height ‘${height}’`);
  }
  get datum() {
    return this._datum;
  }
  set datum(datum) {
    this._datum = datum;
  }
  static get ellipsoids() {
    return ellipsoids;
  }
  static get datums() {
    return datums;
  }
  static parse(...args) {
    if (args.length == 0) throw new TypeError('invalid (empty) point');
    let lat = undefined,
      lon = undefined,
      height = undefined;
    if (typeof args[0] == 'object' && (args.length == 1 || !isNaN(parseFloat(args[1])))) {
      const ll = args[0];
      if (ll.type == 'Point' && Array.isArray(ll.coordinates)) {
        [lon, lat, height] = ll.coordinates;
        height = height || 0;
      } else {
        if (ll.latitude != undefined) lat = ll.latitude;
        if (ll.lat != undefined) lat = ll.lat;
        if (ll.longitude != undefined) lon = ll.longitude;
        if (ll.lng != undefined) lon = ll.lng;
        if (ll.lon != undefined) lon = ll.lon;
        if (ll.height != undefined) height = ll.height;
        lat = _dms.default.wrap90(_dms.default.parse(lat));
        lon = _dms.default.wrap180(_dms.default.parse(lon));
      }
      if (args[1] != undefined) height = args[1];
      if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${JSON.stringify(args[0])}’`);
    }
    if (typeof args[0] == 'string' && args[0].split(',').length == 2) {
      [lat, lon] = args[0].split(',');
      lat = _dms.default.wrap90(_dms.default.parse(lat));
      lon = _dms.default.wrap180(_dms.default.parse(lon));
      height = args[1] || 0;
      if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${args[0]}’`);
    }
    if (lat == undefined && lon == undefined) {
      [lat, lon] = args;
      lat = _dms.default.wrap90(_dms.default.parse(lat));
      lon = _dms.default.wrap180(_dms.default.parse(lon));
      height = args[2] || 0;
      if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${args.toString()}’`);
    }
    return new this(lat, lon, height);
  }
  toCartesian() {
    const ellipsoid = this.datum ? this.datum.ellipsoid : this.referenceFrame ? this.referenceFrame.ellipsoid : ellipsoids.WGS84;
    const φ = this.lat.toRadians();
    const λ = this.lon.toRadians();
    const h = this.height;
    const {
      a,
      f
    } = ellipsoid;
    const sinφ = Math.sin(φ),
      cosφ = Math.cos(φ);
    const sinλ = Math.sin(λ),
      cosλ = Math.cos(λ);
    const eSq = 2 * f - f * f;
    const ν = a / Math.sqrt(1 - eSq * sinφ * sinφ);
    const x = (ν + h) * cosφ * cosλ;
    const y = (ν + h) * cosφ * sinλ;
    const z = (ν * (1 - eSq) + h) * sinφ;
    return new Cartesian(x, y, z);
  }
  equals(point) {
    if (!(point instanceof LatLonEllipsoidal)) throw new TypeError(`invalid point ‘${point}’`);
    if (Math.abs(this.lat - point.lat) > Number.EPSILON) return false;
    if (Math.abs(this.lon - point.lon) > Number.EPSILON) return false;
    if (Math.abs(this.height - point.height) > Number.EPSILON) return false;
    if (this.datum != point.datum) return false;
    if (this.referenceFrame != point.referenceFrame) return false;
    if (this.epoch != point.epoch) return false;
    return true;
  }
  toString(format = 'd', dp = undefined, dpHeight = null) {
    if (!['d', 'dm', 'dms', 'n'].includes(format)) throw new RangeError(`invalid format ‘${format}’`);
    const height = (this.height >= 0 ? ' +' : ' ') + this.height.toFixed(dpHeight) + 'm';
    if (format == 'n') {
      if (dp == undefined) dp = 4;
      const lat = this.lat.toFixed(dp);
      const lon = this.lon.toFixed(dp);
      return `${lat}, ${lon}${dpHeight == null ? '' : height}`;
    }
    const lat = _dms.default.toLat(this.lat, format, dp);
    const lon = _dms.default.toLon(this.lon, format, dp);
    return `${lat}, ${lon}${dpHeight == null ? '' : height}`;
  }
}
exports.default = LatLonEllipsoidal;
class Cartesian extends _vector3d.default {
  constructor(x, y, z) {
    super(x, y, z);
  }
  toLatLon(ellipsoid = ellipsoids.WGS84) {
    if (!ellipsoid || !ellipsoid.a) throw new TypeError(`invalid ellipsoid ‘${ellipsoid}’`);
    const {
      x,
      y,
      z
    } = this;
    const {
      a,
      b,
      f
    } = ellipsoid;
    const e2 = 2 * f - f * f;
    const ε2 = e2 / (1 - e2);
    const p = Math.sqrt(x * x + y * y);
    const R = Math.sqrt(p * p + z * z);
    const tanβ = b * z / (a * p) * (1 + ε2 * b / R);
    const sinβ = tanβ / Math.sqrt(1 + tanβ * tanβ);
    const cosβ = sinβ / tanβ;
    const φ = isNaN(cosβ) ? 0 : Math.atan2(z + ε2 * b * sinβ * sinβ * sinβ, p - e2 * a * cosβ * cosβ * cosβ);
    const λ = Math.atan2(y, x);
    const sinφ = Math.sin(φ),
      cosφ = Math.cos(φ);
    const ν = a / Math.sqrt(1 - e2 * sinφ * sinφ);
    const h = p * cosφ + z * sinφ - a * a / ν;
    const point = new LatLonEllipsoidal(φ.toDegrees(), λ.toDegrees(), h);
    return point;
  }
  toString(dp = 0) {
    const x = this.x.toFixed(dp),
      y = this.y.toFixed(dp),
      z = this.z.toFixed(dp);
    return `[${x},${y},${z}]`;
  }
}
exports.Cartesian = Cartesian;