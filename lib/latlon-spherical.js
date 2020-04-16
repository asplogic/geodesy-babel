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
exports.default = void 0;

var _dms = _interopRequireDefault(require("./dms.js"));

const π = Math.PI;

class LatLonSpherical {
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

  static parse(...args) {
    if (args.length == 0) throw new TypeError('invalid (empty) point');
    if (args[0] === null || args[1] === null) throw new TypeError('invalid (null) point');
    let lat = undefined,
        lon = undefined;

    if (args.length == 2) {
      [lat, lon] = args;
      lat = _dms.default.wrap90(_dms.default.parse(lat));
      lon = _dms.default.wrap180(_dms.default.parse(lon));
      if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${args.toString()}’`);
    }

    if (args.length == 1 && typeof args[0] == 'string') {
      [lat, lon] = args[0].split(',');
      lat = _dms.default.wrap90(_dms.default.parse(lat));
      lon = _dms.default.wrap180(_dms.default.parse(lon));
      if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${args[0]}’`);
    }

    if (args.length == 1 && typeof args[0] == 'object') {
      const ll = args[0];

      if (ll.type == 'Point' && Array.isArray(ll.coordinates)) {
        [lon, lat] = ll.coordinates;
      } else {
        if (ll.latitude != undefined) lat = ll.latitude;
        if (ll.lat != undefined) lat = ll.lat;
        if (ll.longitude != undefined) lon = ll.longitude;
        if (ll.lng != undefined) lon = ll.lng;
        if (ll.lon != undefined) lon = ll.lon;
        lat = _dms.default.wrap90(_dms.default.parse(lat));
        lon = _dms.default.wrap180(_dms.default.parse(lon));
      }

      if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${JSON.stringify(args[0])}’`);
    }

    if (isNaN(lat) || isNaN(lon)) throw new TypeError(`invalid point ‘${args.toString()}’`);
    return new LatLonSpherical(lat, lon);
  }

  distanceTo(point, radius = 6371e3) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    if (isNaN(radius)) throw new TypeError(`invalid radius ‘${radius}’`);
    const R = radius;
    const φ1 = this.lat.toRadians(),
          λ1 = this.lon.toRadians();
    const φ2 = point.lat.toRadians(),
          λ2 = point.lon.toRadians();
    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  initialBearingTo(point) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    if (this.equals(point)) return NaN;
    const φ1 = this.lat.toRadians();
    const φ2 = point.lat.toRadians();
    const Δλ = (point.lon - this.lon).toRadians();
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const θ = Math.atan2(y, x);
    const bearing = θ.toDegrees();
    return _dms.default.wrap360(bearing);
  }

  finalBearingTo(point) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    const bearing = point.initialBearingTo(this) + 180;
    return _dms.default.wrap360(bearing);
  }

  midpointTo(point) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    const φ1 = this.lat.toRadians();
    const λ1 = this.lon.toRadians();
    const φ2 = point.lat.toRadians();
    const Δλ = (point.lon - this.lon).toRadians();
    const A = {
      x: Math.cos(φ1),
      y: 0,
      z: Math.sin(φ1)
    };
    const B = {
      x: Math.cos(φ2) * Math.cos(Δλ),
      y: Math.cos(φ2) * Math.sin(Δλ),
      z: Math.sin(φ2)
    };
    const C = {
      x: A.x + B.x,
      y: A.y + B.y,
      z: A.z + B.z
    };
    const φm = Math.atan2(C.z, Math.sqrt(C.x * C.x + C.y * C.y));
    const λm = λ1 + Math.atan2(C.y, C.x);
    const lat = φm.toDegrees();
    const lon = λm.toDegrees();
    return new LatLonSpherical(lat, lon);
  }

  intermediatePointTo(point, fraction) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    if (this.equals(point)) return new LatLonSpherical(this.lat, this.lon);
    const φ1 = this.lat.toRadians(),
          λ1 = this.lon.toRadians();
    const φ2 = point.lat.toRadians(),
          λ2 = point.lon.toRadians();
    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
    const B = Math.sin(fraction * δ) / Math.sin(δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const φ3 = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ3 = Math.atan2(y, x);
    const lat = φ3.toDegrees();
    const lon = λ3.toDegrees();
    return new LatLonSpherical(lat, lon);
  }

  destinationPoint(distance, bearing, radius = 6371e3) {
    const δ = distance / radius;
    const θ = Number(bearing).toRadians();
    const φ1 = this.lat.toRadians(),
          λ1 = this.lon.toRadians();
    const sinφ2 = Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ);
    const φ2 = Math.asin(sinφ2);
    const y = Math.sin(θ) * Math.sin(δ) * Math.cos(φ1);
    const x = Math.cos(δ) - Math.sin(φ1) * sinφ2;
    const λ2 = λ1 + Math.atan2(y, x);
    const lat = φ2.toDegrees();
    const lon = λ2.toDegrees();
    return new LatLonSpherical(lat, lon);
  }

  static intersection(p1, brng1, p2, brng2) {
    if (!(p1 instanceof LatLonSpherical)) p1 = LatLonSpherical.parse(p1);
    if (!(p2 instanceof LatLonSpherical)) p2 = LatLonSpherical.parse(p2);
    if (isNaN(brng1)) throw new TypeError(`invalid brng1 ‘${brng1}’`);
    if (isNaN(brng2)) throw new TypeError(`invalid brng2 ‘${brng2}’`);
    const φ1 = p1.lat.toRadians(),
          λ1 = p1.lon.toRadians();
    const φ2 = p2.lat.toRadians(),
          λ2 = p2.lon.toRadians();
    const θ13 = Number(brng1).toRadians(),
          θ23 = Number(brng2).toRadians();
    const Δφ = φ2 - φ1,
          Δλ = λ2 - λ1;
    const δ12 = 2 * Math.asin(Math.sqrt(Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)));
    if (Math.abs(δ12) < Number.EPSILON) return new LatLonSpherical(p1.lat, p1.lon);
    const cosθa = (Math.sin(φ2) - Math.sin(φ1) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ1));
    const cosθb = (Math.sin(φ1) - Math.sin(φ2) * Math.cos(δ12)) / (Math.sin(δ12) * Math.cos(φ2));
    const θa = Math.acos(Math.min(Math.max(cosθa, -1), 1));
    const θb = Math.acos(Math.min(Math.max(cosθb, -1), 1));
    const θ12 = Math.sin(λ2 - λ1) > 0 ? θa : 2 * π - θa;
    const θ21 = Math.sin(λ2 - λ1) > 0 ? 2 * π - θb : θb;
    const α1 = θ13 - θ12;
    const α2 = θ21 - θ23;
    if (Math.sin(α1) == 0 && Math.sin(α2) == 0) return null;
    if (Math.sin(α1) * Math.sin(α2) < 0) return null;
    const cosα3 = -Math.cos(α1) * Math.cos(α2) + Math.sin(α1) * Math.sin(α2) * Math.cos(δ12);
    const δ13 = Math.atan2(Math.sin(δ12) * Math.sin(α1) * Math.sin(α2), Math.cos(α2) + Math.cos(α1) * cosα3);
    const φ3 = Math.asin(Math.min(Math.max(Math.sin(φ1) * Math.cos(δ13) + Math.cos(φ1) * Math.sin(δ13) * Math.cos(θ13), -1), 1));
    const Δλ13 = Math.atan2(Math.sin(θ13) * Math.sin(δ13) * Math.cos(φ1), Math.cos(δ13) - Math.sin(φ1) * Math.sin(φ3));
    const λ3 = λ1 + Δλ13;
    const lat = φ3.toDegrees();
    const lon = λ3.toDegrees();
    return new LatLonSpherical(lat, lon);
  }

  crossTrackDistanceTo(pathStart, pathEnd, radius = 6371e3) {
    if (!(pathStart instanceof LatLonSpherical)) pathStart = LatLonSpherical.parse(pathStart);
    if (!(pathEnd instanceof LatLonSpherical)) pathEnd = LatLonSpherical.parse(pathEnd);
    const R = radius;
    if (this.equals(pathStart)) return 0;
    const δ13 = pathStart.distanceTo(this, R) / R;
    const θ13 = pathStart.initialBearingTo(this).toRadians();
    const θ12 = pathStart.initialBearingTo(pathEnd).toRadians();
    const δxt = Math.asin(Math.sin(δ13) * Math.sin(θ13 - θ12));
    return δxt * R;
  }

  alongTrackDistanceTo(pathStart, pathEnd, radius = 6371e3) {
    if (!(pathStart instanceof LatLonSpherical)) pathStart = LatLonSpherical.parse(pathStart);
    if (!(pathEnd instanceof LatLonSpherical)) pathEnd = LatLonSpherical.parse(pathEnd);
    const R = radius;
    if (this.equals(pathStart)) return 0;
    const δ13 = pathStart.distanceTo(this, R) / R;
    const θ13 = pathStart.initialBearingTo(this).toRadians();
    const θ12 = pathStart.initialBearingTo(pathEnd).toRadians();
    const δxt = Math.asin(Math.sin(δ13) * Math.sin(θ13 - θ12));
    const δat = Math.acos(Math.cos(δ13) / Math.abs(Math.cos(δxt)));
    return δat * Math.sign(Math.cos(θ12 - θ13)) * R;
  }

  maxLatitude(bearing) {
    const θ = Number(bearing).toRadians();
    const φ = this.lat.toRadians();
    const φMax = Math.acos(Math.abs(Math.sin(θ) * Math.cos(φ)));
    return φMax.toDegrees();
  }

  static crossingParallels(point1, point2, latitude) {
    if (point1.equals(point2)) return null;
    const φ = Number(latitude).toRadians();
    const φ1 = point1.lat.toRadians();
    const λ1 = point1.lon.toRadians();
    const φ2 = point2.lat.toRadians();
    const λ2 = point2.lon.toRadians();
    const Δλ = λ2 - λ1;
    const x = Math.sin(φ1) * Math.cos(φ2) * Math.cos(φ) * Math.sin(Δλ);
    const y = Math.sin(φ1) * Math.cos(φ2) * Math.cos(φ) * Math.cos(Δλ) - Math.cos(φ1) * Math.sin(φ2) * Math.cos(φ);
    const z = Math.cos(φ1) * Math.cos(φ2) * Math.sin(φ) * Math.sin(Δλ);
    if (z * z > x * x + y * y) return null;
    const λm = Math.atan2(-y, x);
    const Δλi = Math.acos(z / Math.sqrt(x * x + y * y));
    const λi1 = λ1 + λm - Δλi;
    const λi2 = λ1 + λm + Δλi;
    const lon1 = λi1.toDegrees();
    const lon2 = λi2.toDegrees();
    return {
      lon1: _dms.default.wrap180(lon1),
      lon2: _dms.default.wrap180(lon2)
    };
  }

  rhumbDistanceTo(point, radius = 6371e3) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    const R = radius;
    const φ1 = this.lat.toRadians();
    const φ2 = point.lat.toRadians();
    const Δφ = φ2 - φ1;
    let Δλ = Math.abs(point.lon - this.lon).toRadians();
    if (Math.abs(Δλ) > π) Δλ = Δλ > 0 ? -(2 * π - Δλ) : 2 * π + Δλ;
    const Δψ = Math.log(Math.tan(φ2 / 2 + π / 4) / Math.tan(φ1 / 2 + π / 4));
    const q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1);
    const δ = Math.sqrt(Δφ * Δφ + q * q * Δλ * Δλ);
    const d = δ * R;
    return d;
  }

  rhumbBearingTo(point) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    if (this.equals(point)) return NaN;
    const φ1 = this.lat.toRadians();
    const φ2 = point.lat.toRadians();
    let Δλ = (point.lon - this.lon).toRadians();
    if (Math.abs(Δλ) > π) Δλ = Δλ > 0 ? -(2 * π - Δλ) : 2 * π + Δλ;
    const Δψ = Math.log(Math.tan(φ2 / 2 + π / 4) / Math.tan(φ1 / 2 + π / 4));
    const θ = Math.atan2(Δλ, Δψ);
    const bearing = θ.toDegrees();
    return _dms.default.wrap360(bearing);
  }

  rhumbDestinationPoint(distance, bearing, radius = 6371e3) {
    const φ1 = this.lat.toRadians(),
          λ1 = this.lon.toRadians();
    const θ = Number(bearing).toRadians();
    const δ = distance / radius;
    const Δφ = δ * Math.cos(θ);
    let φ2 = φ1 + Δφ;
    if (Math.abs(φ2) > π / 2) φ2 = φ2 > 0 ? π - φ2 : -π - φ2;
    const Δψ = Math.log(Math.tan(φ2 / 2 + π / 4) / Math.tan(φ1 / 2 + π / 4));
    const q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1);
    const Δλ = δ * Math.sin(θ) / q;
    const λ2 = λ1 + Δλ;
    const lat = φ2.toDegrees();
    const lon = λ2.toDegrees();
    return new LatLonSpherical(lat, lon);
  }

  rhumbMidpointTo(point) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
    const φ1 = this.lat.toRadians();
    let λ1 = this.lon.toRadians();
    const φ2 = point.lat.toRadians(),
          λ2 = point.lon.toRadians();
    if (Math.abs(λ2 - λ1) > π) λ1 += 2 * π;
    const φ3 = (φ1 + φ2) / 2;
    const f1 = Math.tan(π / 4 + φ1 / 2);
    const f2 = Math.tan(π / 4 + φ2 / 2);
    const f3 = Math.tan(π / 4 + φ3 / 2);
    let λ3 = ((λ2 - λ1) * Math.log(f3) + λ1 * Math.log(f2) - λ2 * Math.log(f1)) / Math.log(f2 / f1);
    if (!isFinite(λ3)) λ3 = (λ1 + λ2) / 2;
    const lat = φ3.toDegrees();
    const lon = λ3.toDegrees();
    return new LatLonSpherical(lat, lon);
  }

  static areaOf(polygon, radius = 6371e3) {
    const R = radius;
    const closed = polygon[0].equals(polygon[polygon.length - 1]);
    if (!closed) polygon.push(polygon[0]);
    const nVertices = polygon.length - 1;
    let S = 0;

    for (let v = 0; v < nVertices; v++) {
      const φ1 = polygon[v].lat.toRadians();
      const φ2 = polygon[v + 1].lat.toRadians();
      const Δλ = (polygon[v + 1].lon - polygon[v].lon).toRadians();
      const E = 2 * Math.atan2(Math.tan(Δλ / 2) * (Math.tan(φ1 / 2) + Math.tan(φ2 / 2)), 1 + Math.tan(φ1 / 2) * Math.tan(φ2 / 2));
      S += E;
    }

    if (isPoleEnclosedBy(polygon)) S = Math.abs(S) - 2 * π;
    const A = Math.abs(S * R * R);
    if (!closed) polygon.pop();
    return A;

    function isPoleEnclosedBy(p) {
      let ΣΔ = 0;
      let prevBrng = p[0].initialBearingTo(p[1]);

      for (let v = 0; v < p.length - 1; v++) {
        const initBrng = p[v].initialBearingTo(p[v + 1]);
        const finalBrng = p[v].finalBearingTo(p[v + 1]);
        ΣΔ += (initBrng - prevBrng + 540) % 360 - 180;
        ΣΔ += (finalBrng - initBrng + 540) % 360 - 180;
        prevBrng = finalBrng;
      }

      const initBrng = p[0].initialBearingTo(p[1]);
      ΣΔ += (initBrng - prevBrng + 540) % 360 - 180;
      const enclosed = Math.abs(ΣΔ) < 90;
      return enclosed;
    }
  }

  equals(point) {
    if (!(point instanceof LatLonSpherical)) point = LatLonSpherical.parse(point);
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

exports.default = LatLonSpherical;