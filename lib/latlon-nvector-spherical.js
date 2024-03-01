"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Dms", {
  enumerable: true,
  get: function () {
    return _dms.default;
  }
});
exports.default = exports.Nvector = void 0;
var _vector3d = _interopRequireDefault(require("./vector3d.js"));
var _dms = _interopRequireDefault(require("./dms.js"));
const π = Math.PI;
class LatLonNvectorSpherical {
  constructor(lat, lon) {
    if (isNaN(lat)) throw new TypeError(`invalid lat ‘${lat}’`);
    if (isNaN(lon)) throw new TypeError(`invalid lon ‘${lon}’`);
    this._lat = _dms.default.wrap90(Number(lat));
    this._lon = _dms.default.wrap180(Number(lon));
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
  static get metresToKm() {
    return 1 / 1000;
  }
  static get metresToMiles() {
    return 1 / 1609.344;
  }
  static get metresToNauticalMiles() {
    return 1 / 1852;
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
    return new NvectorSpherical(x, y, z);
  }
  greatCircle(bearing) {
    const φ = this.lat.toRadians();
    const λ = this.lon.toRadians();
    const θ = Number(bearing).toRadians();
    const x = Math.sin(λ) * Math.cos(θ) - Math.sin(φ) * Math.cos(λ) * Math.sin(θ);
    const y = -Math.cos(λ) * Math.cos(θ) - Math.sin(φ) * Math.sin(λ) * Math.sin(θ);
    const z = Math.cos(φ) * Math.sin(θ);
    return new _vector3d.default(x, y, z);
  }
  distanceTo(point, radius = 6371e3) {
    if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
    if (isNaN(radius)) throw new TypeError(`invalid radius ‘${radius}’`);
    const R = Number(radius);
    const n1 = this.toNvector();
    const n2 = point.toNvector();
    const sinθ = n1.cross(n2).length;
    const cosθ = n1.dot(n2);
    const δ = Math.atan2(sinθ, cosθ);
    return δ * R;
  }
  initialBearingTo(point) {
    if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
    if (this.equals(point)) return NaN;
    const p1 = this.toNvector();
    const p2 = point.toNvector();
    const N = new NvectorSpherical(0, 0, 1);
    const c1 = p1.cross(p2);
    const c2 = p1.cross(N);
    const θ = c1.angleTo(c2, p1);
    return _dms.default.wrap360(θ.toDegrees());
  }
  finalBearingTo(point) {
    if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
    return _dms.default.wrap360(point.initialBearingTo(this) + 180);
  }
  midpointTo(point) {
    if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
    const n1 = this.toNvector();
    const n2 = point.toNvector();
    const mid = n1.plus(n2);
    return new NvectorSpherical(mid.x, mid.y, mid.z).toLatLon();
  }
  intermediatePointTo(point, fraction) {
    if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
    if (isNaN(fraction)) throw new TypeError(`invalid fraction ‘${fraction}’`);
    const n1 = this.toNvector();
    const n2 = point.toNvector();
    const sinθ = n1.cross(n2).length;
    const cosθ = n1.dot(n2);
    const δ = Math.atan2(sinθ, cosθ);
    const δi = δ * Number(fraction);
    const sinδi = Math.sin(δi);
    const cosδi = Math.cos(δi);
    const d = n1.cross(n2).unit().cross(n1);
    const int = n1.times(cosδi).plus(d.times(sinδi));
    return new NvectorSpherical(int.x, int.y, int.z).toLatLon();
  }
  intermediatePointOnChordTo(point, fraction) {
    if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
    const n1 = this.toNvector();
    const n2 = point.toNvector();
    const int = n1.plus(n2.minus(n1).times(Number(fraction)));
    const n = new NvectorSpherical(int.x, int.y, int.z);
    return n.toLatLon();
  }
  destinationPoint(distance, bearing, radius = 6371e3) {
    const n1 = this.toNvector();
    const δ = distance / radius;
    const θ = Number(bearing).toRadians();
    const N = new NvectorSpherical(0, 0, 1);
    const de = N.cross(n1).unit();
    const dn = n1.cross(de);
    const deSinθ = de.times(Math.sin(θ));
    const dnCosθ = dn.times(Math.cos(θ));
    const d = dnCosθ.plus(deSinθ);
    const x = n1.times(Math.cos(δ));
    const y = d.times(Math.sin(δ));
    const n2 = x.plus(y);
    return new NvectorSpherical(n2.x, n2.y, n2.z).toLatLon();
  }
  static intersection(path1start, path1brngEnd, path2start, path2brngEnd) {
    if (!(path1start instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid path1start ‘${path1start}’`);
    if (!(path2start instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid path2start ‘${path2start}’`);
    if (!(path1brngEnd instanceof LatLonNvectorSpherical) && isNaN(path1brngEnd)) throw new TypeError(`invalid path1brngEnd ‘${path1brngEnd}’`);
    if (!(path2brngEnd instanceof LatLonNvectorSpherical) && isNaN(path2brngEnd)) throw new TypeError(`invalid path2brngEnd ‘${path2brngEnd}’`);
    if (path1start.equals(path2start)) return new LatLonNvectorSpherical(path1start.lat, path2start.lon);
    const p1 = path1start.toNvector();
    const p2 = path2start.toNvector();
    let c1 = null,
      c2 = null,
      path1def = null,
      path2def = null;
    if (path1brngEnd instanceof LatLonNvectorSpherical) {
      c1 = p1.cross(path1brngEnd.toNvector());
      path1def = 'endpoint';
    } else {
      c1 = path1start.greatCircle(path1brngEnd);
      path1def = 'bearing';
    }
    if (path2brngEnd instanceof LatLonNvectorSpherical) {
      c2 = p2.cross(path2brngEnd.toNvector());
      path2def = 'endpoint';
    } else {
      c2 = path2start.greatCircle(path2brngEnd);
      path2def = 'bearing';
    }
    const i1 = c1.cross(c2);
    const i2 = c2.cross(c1);
    let intersection = null,
      dir1 = null,
      dir2 = null;
    switch (path1def + '+' + path2def) {
      case 'bearing+bearing':
        dir1 = Math.sign(c1.cross(p1).dot(i1));
        dir2 = Math.sign(c2.cross(p2).dot(i1));
        switch (dir1 + dir2) {
          case 2:
            intersection = i1;
            break;
          case -2:
            intersection = i2;
            break;
          case 0:
            intersection = p1.plus(p2).dot(i1) > 0 ? i2 : i1;
            break;
        }
        break;
      case 'bearing+endpoint':
        dir1 = Math.sign(c1.cross(p1).dot(i1));
        intersection = dir1 > 0 ? i1 : i2;
        break;
      case 'endpoint+bearing':
        dir2 = Math.sign(c2.cross(p2).dot(i1));
        intersection = dir2 > 0 ? i1 : i2;
        break;
      case 'endpoint+endpoint':
        const mid = p1.plus(p2).plus(path1brngEnd.toNvector()).plus(path2brngEnd.toNvector());
        intersection = mid.dot(i1) > 0 ? i1 : i2;
        break;
    }
    return new NvectorSpherical(intersection.x, intersection.y, intersection.z).toLatLon();
  }
  crossTrackDistanceTo(pathStart, pathBrngEnd, radius = 6371e3) {
    if (!(pathStart instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid pathStart ‘${pathStart}’`);
    if (!(pathBrngEnd instanceof LatLonNvectorSpherical || !isNaN(pathBrngEnd))) throw new TypeError(`invalid pathBrngEnd ‘${pathBrngEnd}’`);
    if (this.equals(pathStart)) return 0;
    const p = this.toNvector();
    const R = Number(radius);
    const gc = pathBrngEnd instanceof LatLonNvectorSpherical ? pathStart.toNvector().cross(pathBrngEnd.toNvector()) : pathStart.greatCircle(pathBrngEnd);
    const α = gc.angleTo(p) - π / 2;
    return α * R;
  }
  alongTrackDistanceTo(pathStart, pathBrngEnd, radius = 6371e3) {
    if (!(pathStart instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid pathStart ‘${pathStart}’`);
    if (!(pathBrngEnd instanceof LatLonNvectorSpherical || !isNaN(pathBrngEnd))) throw new TypeError(`invalid pathBrngEnd ‘${pathBrngEnd}’`);
    const p = this.toNvector();
    const R = Number(radius);
    const gc = pathBrngEnd instanceof LatLonNvectorSpherical ? pathStart.toNvector().cross(pathBrngEnd.toNvector()) : pathStart.greatCircle(pathBrngEnd);
    const pat = gc.cross(p).cross(gc);
    const α = pathStart.toNvector().angleTo(pat, gc);
    return α * R;
  }
  nearestPointOnSegment(point1, point2) {
    let p = null;
    if (this.isWithinExtent(point1, point2) && !point1.equals(point2)) {
      const n0 = this.toNvector(),
        n1 = point1.toNvector(),
        n2 = point2.toNvector();
      const c1 = n1.cross(n2);
      const c2 = n0.cross(c1);
      const n = c1.cross(c2);
      p = new NvectorSpherical(n.x, n.y, n.z).toLatLon();
    } else {
      const d1 = this.distanceTo(point1);
      const d2 = this.distanceTo(point2);
      const pCloser = d1 < d2 ? point1 : point2;
      p = new LatLonNvectorSpherical(pCloser.lat, pCloser.lon);
    }
    return p;
  }
  isWithinExtent(point1, point2) {
    if (point1.equals(point2)) return this.equals(point1);
    const n0 = this.toNvector(),
      n1 = point1.toNvector(),
      n2 = point2.toNvector();
    const δ10 = n0.minus(n1),
      δ12 = n2.minus(n1);
    const δ20 = n0.minus(n2),
      δ21 = n1.minus(n2);
    const extent1 = δ10.dot(δ12);
    const extent2 = δ20.dot(δ21);
    const isSameHemisphere = n0.dot(n1) >= 0 && n0.dot(n2) >= 0;
    return extent1 >= 0 && extent2 >= 0 && isSameHemisphere;
  }
  static triangulate(point1, bearing1, point2, bearing2) {
    const n1 = point1.toNvector(),
      θ1 = Number(bearing1).toRadians();
    const n2 = point2.toNvector(),
      θ2 = Number(bearing2).toRadians();
    const N = new NvectorSpherical(0, 0, 1);
    const de1 = N.cross(n1).unit();
    const dn1 = n1.cross(de1);
    const de1Sinθ = de1.times(Math.sin(θ1));
    const dn1Cosθ = dn1.times(Math.cos(θ1));
    const d1 = dn1Cosθ.plus(de1Sinθ);
    const c1 = n1.cross(d1);
    const de2 = N.cross(n2).unit();
    const dn2 = n2.cross(de2);
    const de2Sinθ = de2.times(Math.sin(θ2));
    const dn2Cosθ = dn2.times(Math.cos(θ2));
    const d2 = dn2Cosθ.plus(de2Sinθ);
    const c2 = n2.cross(d2);
    const ni = c1.cross(c2);
    return new NvectorSpherical(ni.x, ni.y, ni.z).toLatLon();
  }
  static trilaterate(point1, distance1, point2, distance2, point3, distance3, radius = 6371e3) {
    const n1 = point1.toNvector(),
      δ1 = Number(distance1) / Number(radius);
    const n2 = point2.toNvector(),
      δ2 = Number(distance2) / Number(radius);
    const n3 = point3.toNvector(),
      δ3 = Number(distance3) / Number(radius);
    const eX = n2.minus(n1).unit();
    const i = eX.dot(n3.minus(n1));
    const eY = n3.minus(n1).minus(eX.times(i)).unit();
    const d = n2.minus(n1).length;
    const j = eY.dot(n3.minus(n1));
    const x = (δ1 * δ1 - δ2 * δ2 + d * d) / (2 * d);
    const y = (δ1 * δ1 - δ3 * δ3 + i * i + j * j) / (2 * j) - x * i / j;
    if (!isFinite(x) || !isFinite(y)) return null;
    const n = n1.plus(eX.times(x)).plus(eY.times(y));
    return new NvectorSpherical(n.x, n.y, n.z).toLatLon();
  }
  isEnclosedBy(polygon) {
    if (!(polygon instanceof Array)) throw new TypeError(`isEnclosedBy: polygon must be Array (not ${classOf(polygon)})`);
    if (!(polygon[0] instanceof LatLonNvectorSpherical)) throw new TypeError(`isEnclosedBy: polygon must be Array of LatLon (not ${classOf(polygon[0])})`);
    if (polygon.length < 3) return false;
    const nVertices = polygon.length;
    const p = this.toNvector();
    const vectorToVertex = [];
    for (let v = 0; v < nVertices; v++) vectorToVertex[v] = p.minus(polygon[v].toNvector());
    vectorToVertex.push(vectorToVertex[0]);
    let Σθ = 0;
    for (let v = 0; v < nVertices; v++) {
      Σθ += vectorToVertex[v].angleTo(vectorToVertex[v + 1], p);
    }
    return Math.abs(Σθ) > π;
  }
  static areaOf(polygon, radius = 6371e3) {
    const R = Number(radius);
    const c = [];
    for (let v = 0; v < polygon.length; v++) {
      if (polygon[v].equals(polygon[(v + 1) % polygon.length])) continue;
      const i = polygon[v].toNvector();
      const j = polygon[(v + 1) % polygon.length].toNvector();
      c.push(i.cross(j));
    }
    const n = c.length;
    const n1 = polygon[0].toNvector();
    let Σα = 0;
    for (let v = 0; v < n; v++) Σα += c[v].angleTo(c[(v + 1) % n], n1);
    const Σθ = n * π - Math.abs(Σα);
    const E = Σθ - (n - 2) * π;
    const A = E * R * R;
    return A;
  }
  static centreOf(polygon) {
    let centreV = new NvectorSpherical(0, 0, 0);
    for (let vertex = 0; vertex < polygon.length; vertex++) {
      const a = polygon[vertex].toNvector();
      const b = polygon[(vertex + 1) % polygon.length].toNvector();
      const v = a.cross(b).unit().times(a.angleTo(b) / 2);
      centreV = centreV.plus(v);
    }
    const θ = centreV.angleTo(polygon[0].toNvector());
    if (θ > π / 2) centreV = centreV.negate();
    const centreP = new NvectorSpherical(centreV.x, centreV.y, centreV.z).toLatLon();
    return centreP;
  }
  static centerOf(polygon) {
    return LatLonNvectorSpherical.centreOf(polygon);
  }
  static meanOf(points) {
    let m = new NvectorSpherical(0, 0, 0);
    for (let p = 0; p < points.length; p++) {
      m = m.plus(points[p].toNvector());
    }
    return new NvectorSpherical(m.x, m.y, m.z).toLatLon();
  }
  equals(point) {
    if (!(point instanceof LatLonNvectorSpherical)) throw new TypeError(`invalid point ‘${point}’`);
    if (Math.abs(this.lat - point.lat) > Number.EPSILON) return false;
    if (Math.abs(this.lon - point.lon) > Number.EPSILON) return false;
    return true;
  }
  toGeoJSON() {
    return {
      type: 'Point',
      coordinates: [this.lon, this.lat]
    };
  }
  toString(format = 'd', dp = undefined) {
    if (!['d', 'dm', 'dms', 'n'].includes(format)) throw new RangeError(`invalid format ‘${format}’`);
    if (format == 'n') {
      if (dp == undefined) dp = 4;
      return `${this.lat.toFixed(dp)},${this.lon.toFixed(dp)}`;
    }
    const lat = _dms.default.toLat(this.lat, format, dp);
    const lon = _dms.default.toLon(this.lon, format, dp);
    return `${lat}, ${lon}`;
  }
}
exports.default = LatLonNvectorSpherical;
class NvectorSpherical extends _vector3d.default {
  constructor(x, y, z) {
    const u = new _vector3d.default(x, y, z).unit();
    super(u.x, u.y, u.z);
  }
  toLatLon() {
    const x = this.x,
      y = this.y,
      z = this.z;
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    return new LatLonNvectorSpherical(φ.toDegrees(), λ.toDegrees());
  }
  greatCircle(bearing) {
    const θ = Number(bearing).toRadians();
    const N = new _vector3d.default(0, 0, 1);
    const e = N.cross(this);
    const n = this.cross(e);
    const eʹ = e.times(Math.cos(θ) / e.length);
    const nʹ = n.times(Math.sin(θ) / n.length);
    const c = nʹ.minus(eʹ);
    return c;
  }
  toString(dp = 3) {
    const x = this.x.toFixed(dp);
    const y = this.y.toFixed(dp);
    const z = this.z.toFixed(dp);
    return `[${x},${y},${z}]`;
  }
}
exports.Nvector = NvectorSpherical;
function classOf(thing) {
  return {}.toString.call(thing).match(/\s([a-zA-Z0-9]+)/)[1];
}