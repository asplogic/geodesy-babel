"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Dms", {
  enumerable: true,
  get: function () {
    return _latlonEllipsoidalDatum.Dms;
  }
});
exports.default = exports.LatLon = void 0;
var _latlonEllipsoidalDatum = _interopRequireWildcard(require("./latlon-ellipsoidal-datum.js"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const nationalGrid = {
  trueOrigin: {
    lat: 49,
    lon: -2
  },
  falseOrigin: {
    easting: -400e3,
    northing: 100e3
  },
  scaleFactor: 0.9996012717,
  ellipsoid: _latlonEllipsoidalDatum.default.ellipsoids.Airy1830
};
class OsGridRef {
  constructor(easting, northing) {
    this.easting = Number(easting);
    this.northing = Number(northing);
    if (isNaN(easting) || this.easting < 0 || this.easting > 700e3) throw new RangeError(`invalid easting ‘${easting}’`);
    if (isNaN(northing) || this.northing < 0 || this.northing > 1300e3) throw new RangeError(`invalid northing ‘${northing}’`);
  }
  toLatLon(datum = _latlonEllipsoidalDatum.default.datums.WGS84) {
    const {
      easting: E,
      northing: N
    } = this;
    const {
      a,
      b
    } = nationalGrid.ellipsoid;
    const φ0 = nationalGrid.trueOrigin.lat.toRadians();
    const λ0 = nationalGrid.trueOrigin.lon.toRadians();
    const E0 = -nationalGrid.falseOrigin.easting;
    const N0 = -nationalGrid.falseOrigin.northing;
    const F0 = nationalGrid.scaleFactor;
    const e2 = 1 - b * b / (a * a);
    const n = (a - b) / (a + b),
      n2 = n * n,
      n3 = n * n * n;
    let φ = φ0,
      M = 0;
    do {
      φ = (N - N0 - M) / (a * F0) + φ;
      const Ma = (1 + n + 5 / 4 * n2 + 5 / 4 * n3) * (φ - φ0);
      const Mb = (3 * n + 3 * n * n + 21 / 8 * n3) * Math.sin(φ - φ0) * Math.cos(φ + φ0);
      const Mc = (15 / 8 * n2 + 15 / 8 * n3) * Math.sin(2 * (φ - φ0)) * Math.cos(2 * (φ + φ0));
      const Md = 35 / 24 * n3 * Math.sin(3 * (φ - φ0)) * Math.cos(3 * (φ + φ0));
      M = b * F0 * (Ma - Mb + Mc - Md);
    } while (Math.abs(N - N0 - M) >= 0.00001);
    const cosφ = Math.cos(φ),
      sinφ = Math.sin(φ);
    const ν = a * F0 / Math.sqrt(1 - e2 * sinφ * sinφ);
    const ρ = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinφ * sinφ, 1.5);
    const η2 = ν / ρ - 1;
    const tanφ = Math.tan(φ);
    const tan2φ = tanφ * tanφ,
      tan4φ = tan2φ * tan2φ,
      tan6φ = tan4φ * tan2φ;
    const secφ = 1 / cosφ;
    const ν3 = ν * ν * ν,
      ν5 = ν3 * ν * ν,
      ν7 = ν5 * ν * ν;
    const VII = tanφ / (2 * ρ * ν);
    const VIII = tanφ / (24 * ρ * ν3) * (5 + 3 * tan2φ + η2 - 9 * tan2φ * η2);
    const IX = tanφ / (720 * ρ * ν5) * (61 + 90 * tan2φ + 45 * tan4φ);
    const X = secφ / ν;
    const XI = secφ / (6 * ν3) * (ν / ρ + 2 * tan2φ);
    const XII = secφ / (120 * ν5) * (5 + 28 * tan2φ + 24 * tan4φ);
    const XIIA = secφ / (5040 * ν7) * (61 + 662 * tan2φ + 1320 * tan4φ + 720 * tan6φ);
    const dE = E - E0,
      dE2 = dE * dE,
      dE3 = dE2 * dE,
      dE4 = dE2 * dE2,
      dE5 = dE3 * dE2,
      dE6 = dE4 * dE2,
      dE7 = dE5 * dE2;
    φ = φ - VII * dE2 + VIII * dE4 - IX * dE6;
    const λ = λ0 + X * dE - XI * dE3 + XII * dE5 - XIIA * dE7;
    let point = new LatLon_OsGridRef(φ.toDegrees(), λ.toDegrees(), 0, _latlonEllipsoidalDatum.default.datums.OSGB36);
    if (datum != _latlonEllipsoidalDatum.default.datums.OSGB36) {
      point = point.convertDatum(datum);
      point = new LatLon_OsGridRef(point.lat, point.lon, point.height, point.datum);
    }
    return point;
  }
  static parse(gridref) {
    gridref = String(gridref).trim();
    let match = gridref.match(/^(\d+),\s*(\d+)$/);
    if (match) return new OsGridRef(match[1], match[2]);
    match = gridref.match(/^[HNST][ABCDEFGHJKLMNOPQRSTUVWXYZ]\s*[0-9]+\s*[0-9]+$/i);
    if (!match) throw new Error(`invalid grid reference ‘${gridref}’`);
    let l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    let l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;
    const e100km = (l1 - 2) % 5 * 5 + l2 % 5;
    const n100km = 19 - Math.floor(l1 / 5) * 5 - Math.floor(l2 / 5);
    let en = gridref.slice(2).trim().split(/\s+/);
    if (en.length == 1) en = [en[0].slice(0, en[0].length / 2), en[0].slice(en[0].length / 2)];
    if (en[0].length != en[1].length) throw new Error(`invalid grid reference ‘${gridref}’`);
    en[0] = en[0].padEnd(5, '0');
    en[1] = en[1].padEnd(5, '0');
    const e = e100km + en[0];
    const n = n100km + en[1];
    return new OsGridRef(e, n);
  }
  toString(digits = 10) {
    if (![0, 2, 4, 6, 8, 10, 12, 14, 16].includes(Number(digits))) throw new RangeError(`invalid precision ‘${digits}’`);
    let {
      easting: e,
      northing: n
    } = this;
    if (digits == 0) {
      const format = {
        useGrouping: false,
        minimumIntegerDigits: 6,
        maximumFractionDigits: 3
      };
      const ePad = e.toLocaleString('en', format);
      const nPad = n.toLocaleString('en', format);
      return `${ePad},${nPad}`;
    }
    const e100km = Math.floor(e / 100000),
      n100km = Math.floor(n / 100000);
    let l1 = 19 - n100km - (19 - n100km) % 5 + Math.floor((e100km + 10) / 5);
    let l2 = (19 - n100km) * 5 % 25 + e100km % 5;
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    const letterPair = String.fromCharCode(l1 + 'A'.charCodeAt(0), l2 + 'A'.charCodeAt(0));
    e = Math.floor(e % 100000 / Math.pow(10, 5 - digits / 2));
    n = Math.floor(n % 100000 / Math.pow(10, 5 - digits / 2));
    e = e.toString().padStart(digits / 2, '0');
    n = n.toString().padStart(digits / 2, '0');
    return `${letterPair} ${e} ${n}`;
  }
}
exports.default = OsGridRef;
class LatLon_OsGridRef extends _latlonEllipsoidalDatum.default {
  toOsGrid() {
    const point = this.datum == _latlonEllipsoidalDatum.default.datums.OSGB36 ? this : this.convertDatum(_latlonEllipsoidalDatum.default.datums.OSGB36);
    const φ = point.lat.toRadians();
    const λ = point.lon.toRadians();
    const {
      a,
      b
    } = nationalGrid.ellipsoid;
    const φ0 = nationalGrid.trueOrigin.lat.toRadians();
    const λ0 = nationalGrid.trueOrigin.lon.toRadians();
    const E0 = -nationalGrid.falseOrigin.easting;
    const N0 = -nationalGrid.falseOrigin.northing;
    const F0 = nationalGrid.scaleFactor;
    const e2 = 1 - b * b / (a * a);
    const n = (a - b) / (a + b),
      n2 = n * n,
      n3 = n * n * n;
    const cosφ = Math.cos(φ),
      sinφ = Math.sin(φ);
    const ν = a * F0 / Math.sqrt(1 - e2 * sinφ * sinφ);
    const ρ = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinφ * sinφ, 1.5);
    const η2 = ν / ρ - 1;
    const Ma = (1 + n + 5 / 4 * n2 + 5 / 4 * n3) * (φ - φ0);
    const Mb = (3 * n + 3 * n * n + 21 / 8 * n3) * Math.sin(φ - φ0) * Math.cos(φ + φ0);
    const Mc = (15 / 8 * n2 + 15 / 8 * n3) * Math.sin(2 * (φ - φ0)) * Math.cos(2 * (φ + φ0));
    const Md = 35 / 24 * n3 * Math.sin(3 * (φ - φ0)) * Math.cos(3 * (φ + φ0));
    const M = b * F0 * (Ma - Mb + Mc - Md);
    const cos3φ = cosφ * cosφ * cosφ;
    const cos5φ = cos3φ * cosφ * cosφ;
    const tan2φ = Math.tan(φ) * Math.tan(φ);
    const tan4φ = tan2φ * tan2φ;
    const I = M + N0;
    const II = ν / 2 * sinφ * cosφ;
    const III = ν / 24 * sinφ * cos3φ * (5 - tan2φ + 9 * η2);
    const IIIA = ν / 720 * sinφ * cos5φ * (61 - 58 * tan2φ + tan4φ);
    const IV = ν * cosφ;
    const V = ν / 6 * cos3φ * (ν / ρ - tan2φ);
    const VI = ν / 120 * cos5φ * (5 - 18 * tan2φ + tan4φ + 14 * η2 - 58 * tan2φ * η2);
    const Δλ = λ - λ0;
    const Δλ2 = Δλ * Δλ,
      Δλ3 = Δλ2 * Δλ,
      Δλ4 = Δλ3 * Δλ,
      Δλ5 = Δλ4 * Δλ,
      Δλ6 = Δλ5 * Δλ;
    let N = I + II * Δλ2 + III * Δλ4 + IIIA * Δλ6;
    let E = E0 + IV * Δλ + V * Δλ3 + VI * Δλ5;
    N = Number(N.toFixed(3));
    E = Number(E.toFixed(3));
    try {
      return new OsGridRef(E, N);
    } catch (e) {
      throw new Error(`${e.message} from (${point.lat.toFixed(6)},${point.lon.toFixed(6)}).toOsGrid()`);
    }
  }
  convertDatum(toDatum) {
    const osgbED = super.convertDatum(toDatum);
    const osgbOSGR = new LatLon_OsGridRef(osgbED.lat, osgbED.lon, osgbED.height, osgbED.datum);
    return osgbOSGR;
  }
}
exports.LatLon = LatLon_OsGridRef;