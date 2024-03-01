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
exports.default = exports.datums = void 0;
var _latlonEllipsoidal = _interopRequireWildcard(require("./latlon-ellipsoidal.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const ellipsoids = {
  WGS84: {
    a: 6378137,
    b: 6356752.314245,
    f: 1 / 298.257223563
  },
  Airy1830: {
    a: 6377563.396,
    b: 6356256.909,
    f: 1 / 299.3249646
  },
  AiryModified: {
    a: 6377340.189,
    b: 6356034.448,
    f: 1 / 299.3249646
  },
  Bessel1841: {
    a: 6377397.155,
    b: 6356078.962818,
    f: 1 / 299.1528128
  },
  Clarke1866: {
    a: 6378206.4,
    b: 6356583.8,
    f: 1 / 294.978698214
  },
  Clarke1880IGN: {
    a: 6378249.2,
    b: 6356515.0,
    f: 1 / 293.466021294
  },
  GRS80: {
    a: 6378137,
    b: 6356752.314140,
    f: 1 / 298.257222101
  },
  Intl1924: {
    a: 6378388,
    b: 6356911.946,
    f: 1 / 297
  },
  WGS72: {
    a: 6378135,
    b: 6356750.5,
    f: 1 / 298.26
  }
};
const datums = exports.datums = {
  ED50: {
    ellipsoid: ellipsoids.Intl1924,
    transform: [89.5, 93.8, 123.1, -1.2, 0.0, 0.0, 0.156]
  },
  ETRS89: {
    ellipsoid: ellipsoids.GRS80,
    transform: [0, 0, 0, 0, 0, 0, 0]
  },
  Irl1975: {
    ellipsoid: ellipsoids.AiryModified,
    transform: [-482.530, 130.596, -564.557, -8.150, 1.042, 0.214, 0.631]
  },
  NAD27: {
    ellipsoid: ellipsoids.Clarke1866,
    transform: [8, -160, -176, 0, 0, 0, 0]
  },
  NAD83: {
    ellipsoid: ellipsoids.GRS80,
    transform: [0.9956, -1.9103, -0.5215, -0.00062, 0.025915, 0.009426, 0.011599]
  },
  NTF: {
    ellipsoid: ellipsoids.Clarke1880IGN,
    transform: [168, 60, -320, 0, 0, 0, 0]
  },
  OSGB36: {
    ellipsoid: ellipsoids.Airy1830,
    transform: [-446.448, 125.157, -542.060, 20.4894, -0.1502, -0.2470, -0.8421]
  },
  Potsdam: {
    ellipsoid: ellipsoids.Bessel1841,
    transform: [-582, -105, -414, -8.3, 1.04, 0.35, -3.08]
  },
  TokyoJapan: {
    ellipsoid: ellipsoids.Bessel1841,
    transform: [148, -507, -685, 0, 0, 0, 0]
  },
  WGS72: {
    ellipsoid: ellipsoids.WGS72,
    transform: [0, 0, -4.5, -0.22, 0, 0, 0.554]
  },
  WGS84: {
    ellipsoid: ellipsoids.WGS84,
    transform: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
  }
};
Object.keys(ellipsoids).forEach(e => Object.freeze(ellipsoids[e]));
Object.keys(datums).forEach(d => {
  Object.freeze(datums[d]);
  Object.freeze(datums[d].transform);
});
class LatLonEllipsoidal_Datum extends _latlonEllipsoidal.default {
  constructor(lat, lon, height = 0, datum = datums.WGS84) {
    if (!datum || datum.ellipsoid == undefined) throw new TypeError(`unrecognised datum ‘${datum}’`);
    super(lat, lon, height);
    this._datum = datum;
  }
  get datum() {
    return this._datum;
  }
  static get ellipsoids() {
    return ellipsoids;
  }
  static get datums() {
    return datums;
  }
  static parse(...args) {
    let datum = datums.WGS84;
    if (args.length == 4 || args.length == 3 && typeof args[2] == 'object') datum = args.pop();
    if (!datum || datum.ellipsoid == undefined) throw new TypeError(`unrecognised datum ‘${datum}’`);
    const point = super.parse(...args);
    point._datum = datum;
    return point;
  }
  convertDatum(toDatum) {
    if (!toDatum || toDatum.ellipsoid == undefined) throw new TypeError(`unrecognised datum ‘${toDatum}’`);
    const oldCartesian = this.toCartesian();
    const newCartesian = oldCartesian.convertDatum(toDatum);
    const newLatLon = newCartesian.toLatLon();
    return newLatLon;
  }
  toCartesian() {
    const cartesian = super.toCartesian();
    const cartesianDatum = new Cartesian_Datum(cartesian.x, cartesian.y, cartesian.z, this.datum);
    return cartesianDatum;
  }
}
exports.default = LatLonEllipsoidal_Datum;
class Cartesian_Datum extends _latlonEllipsoidal.Cartesian {
  constructor(x, y, z, datum = undefined) {
    if (datum && datum.ellipsoid == undefined) throw new TypeError(`unrecognised datum ‘${datum}’`);
    super(x, y, z);
    if (datum) this._datum = datum;
  }
  get datum() {
    return this._datum;
  }
  set datum(datum) {
    if (!datum || datum.ellipsoid == undefined) throw new TypeError(`unrecognised datum ‘${datum}’`);
    this._datum = datum;
  }
  toLatLon(deprecatedDatum = undefined) {
    if (deprecatedDatum) {
      console.info('datum parameter to Cartesian_Datum.toLatLon is deprecated: set datum before calling toLatLon()');
      this.datum = deprecatedDatum;
    }
    const datum = this.datum || datums.WGS84;
    if (!datum || datum.ellipsoid == undefined) throw new TypeError(`unrecognised datum ‘${datum}’`);
    const latLon = super.toLatLon(datum.ellipsoid);
    const point = new LatLonEllipsoidal_Datum(latLon.lat, latLon.lon, latLon.height, this.datum);
    return point;
  }
  convertDatum(toDatum) {
    if (!toDatum || toDatum.ellipsoid == undefined) throw new TypeError(`unrecognised datum ‘${toDatum}’`);
    if (!this.datum) throw new TypeError('cartesian coordinate has no datum');
    let oldCartesian = null;
    let transform = null;
    if (this.datum == undefined || this.datum == datums.WGS84) {
      oldCartesian = this;
      transform = toDatum.transform;
    }
    if (toDatum == datums.WGS84) {
      oldCartesian = this;
      transform = this.datum.transform.map(p => -p);
    }
    if (transform == null) {
      oldCartesian = this.convertDatum(datums.WGS84);
      transform = toDatum.transform;
    }
    const newCartesian = oldCartesian.applyTransform(transform);
    newCartesian.datum = toDatum;
    return newCartesian;
  }
  applyTransform(t) {
    const {
      x: x1,
      y: y1,
      z: z1
    } = this;
    const tx = t[0];
    const ty = t[1];
    const tz = t[2];
    const s = t[3] / 1e6 + 1;
    const rx = (t[4] / 3600).toRadians();
    const ry = (t[5] / 3600).toRadians();
    const rz = (t[6] / 3600).toRadians();
    const x2 = tx + x1 * s - y1 * rz + z1 * ry;
    const y2 = ty + x1 * rz + y1 * s - z1 * rx;
    const z2 = tz - x1 * ry + y1 * rx + z1 * s;
    return new Cartesian_Datum(x2, y2, z2);
  }
}
exports.Cartesian = Cartesian_Datum;