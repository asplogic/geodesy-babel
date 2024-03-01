"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Dms", {
  enumerable: true,
  get: function () {
    return _utm.Dms;
  }
});
exports.default = exports.Utm = exports.LatLon = void 0;
var _utm = _interopRequireWildcard(require("./utm.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const latBands = 'CDEFGHJKLMNPQRSTUVWXX';
const e100kLetters = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
const n100kLetters = ['ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE'];
class Mgrs {
  constructor(zone, band, e100k, n100k, easting, northing, datum = _utm.LatLon.datums.WGS84) {
    if (!(1 <= zone && zone <= 60)) throw new RangeError(`invalid MGRS zone ‘${zone}’`);
    if (zone != parseInt(zone)) throw new RangeError(`invalid MGRS zone ‘${zone}’`);
    const errors = [];
    if (band.length != 1 || latBands.indexOf(band) == -1) errors.push(`invalid MGRS band ‘${band}’`);
    if (e100k.length != 1 || e100kLetters[(zone - 1) % 3].indexOf(e100k) == -1) errors.push(`invalid MGRS 100km grid square column ‘${e100k}’ for zone ${zone}`);
    if (n100k.length != 1 || n100kLetters[0].indexOf(n100k) == -1) errors.push(`invalid MGRS 100km grid square row ‘${n100k}’`);
    if (isNaN(Number(easting))) errors.push(`invalid MGRS easting ‘${easting}’`);
    if (isNaN(Number(northing))) errors.push(`invalid MGRS northing ‘${northing}’`);
    if (!datum || datum.ellipsoid == undefined) errors.push(`unrecognised datum ‘${datum}’`);
    if (errors.length > 0) throw new RangeError(errors.join(', '));
    this.zone = Number(zone);
    this.band = band;
    this.e100k = e100k;
    this.n100k = n100k;
    this.easting = Number(easting);
    this.northing = Number(northing);
    this.datum = datum;
  }
  toUtm() {
    const hemisphere = this.band >= 'N' ? 'N' : 'S';
    const col = e100kLetters[(this.zone - 1) % 3].indexOf(this.e100k) + 1;
    const e100kNum = col * 100e3;
    const row = n100kLetters[(this.zone - 1) % 2].indexOf(this.n100k);
    const n100kNum = row * 100e3;
    const latBand = (latBands.indexOf(this.band) - 10) * 8;
    const nBand = Math.floor(new _utm.LatLon(latBand, 3).toUtm().northing / 100e3) * 100e3;
    let n2M = 0;
    while (n2M + n100kNum + this.northing < nBand) n2M += 2000e3;
    return new Utm_Mgrs(this.zone, hemisphere, e100kNum + this.easting, n2M + n100kNum + this.northing, this.datum);
  }
  static parse(mgrsGridRef) {
    if (!mgrsGridRef) throw new Error(`invalid MGRS grid reference ‘${mgrsGridRef}’`);
    if (!mgrsGridRef.trim().match(/\s/)) {
      if (!Number(mgrsGridRef.slice(0, 2))) throw new Error(`invalid MGRS grid reference ‘${mgrsGridRef}’`);
      let en = mgrsGridRef.trim().slice(5);
      en = en.slice(0, en.length / 2) + ' ' + en.slice(-en.length / 2);
      mgrsGridRef = mgrsGridRef.slice(0, 3) + ' ' + mgrsGridRef.slice(3, 5) + ' ' + en;
    }
    const ref = mgrsGridRef.match(/\S+/g);
    if (ref == null || ref.length != 4) throw new Error(`invalid MGRS grid reference ‘${mgrsGridRef}’`);
    const gzd = ref[0];
    const zone = gzd.slice(0, 2);
    const band = gzd.slice(2, 3);
    const en100k = ref[1];
    const e100k = en100k.slice(0, 1);
    const n100k = en100k.slice(1, 2);
    let e = ref[2],
      n = ref[3];
    e = e.length >= 5 ? e : (e + '00000').slice(0, 5);
    n = n.length >= 5 ? n : (n + '00000').slice(0, 5);
    return new Mgrs(zone, band, e100k, n100k, e, n);
  }
  toString(digits = 10) {
    if (![2, 4, 6, 8, 10].includes(Number(digits))) throw new RangeError(`invalid precision ‘${digits}’`);
    const {
      zone,
      band,
      e100k,
      n100k,
      easting,
      northing
    } = this;
    const eRounded = Math.floor(easting / Math.pow(10, 5 - digits / 2));
    const nRounded = Math.floor(northing / Math.pow(10, 5 - digits / 2));
    const zPadded = zone.toString().padStart(2, '0');
    const ePadded = eRounded.toString().padStart(digits / 2, '0');
    const nPadded = nRounded.toString().padStart(digits / 2, '0');
    return `${zPadded}${band} ${e100k}${n100k} ${ePadded} ${nPadded}`;
  }
}
exports.default = Mgrs;
class Utm_Mgrs extends _utm.default {
  toMgrs() {
    const zone = this.zone;
    const latlong = this.toLatLon();
    const band = latBands.charAt(Math.floor(latlong.lat / 8 + 10));
    const col = Math.floor(this.easting / 100e3);
    const e100k = e100kLetters[(zone - 1) % 3].charAt(col - 1);
    const row = Math.floor(this.northing / 100e3) % 20;
    const n100k = n100kLetters[(zone - 1) % 2].charAt(row);
    let easting = this.easting % 100e3;
    let northing = this.northing % 100e3;
    easting = Number(easting.toFixed(6));
    northing = Number(northing.toFixed(6));
    return new Mgrs(zone, band, e100k, n100k, easting, northing);
  }
}
exports.Utm = Utm_Mgrs;
class Latlon_Utm_Mgrs extends _utm.LatLon {
  toUtm(zoneOverride = undefined) {
    const utm = super.toUtm(zoneOverride);
    return new Utm_Mgrs(utm.zone, utm.hemisphere, utm.easting, utm.northing, utm.datum, utm.convergence, utm.scale);
  }
}
exports.LatLon = Latlon_Utm_Mgrs;