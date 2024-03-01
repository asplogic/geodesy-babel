"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
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
exports.default = void 0;
var _latlonEllipsoidal = _interopRequireWildcard(require("./latlon-ellipsoidal.js"));
var _latlonEllipsoidalReferenceframeTxparams = _interopRequireDefault(require("./latlon-ellipsoidal-referenceframe-txparams.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const ellipsoids = {
  WGS84: {
    a: 6378137,
    b: 6356752.314245,
    f: 1 / 298.257223563
  },
  GRS80: {
    a: 6378137,
    b: 6356752.314140,
    f: 1 / 298.257222101
  }
};
const referenceFrames = {
  ITRF2014: {
    name: 'ITRF2014',
    epoch: 2010.0,
    ellipsoid: ellipsoids.GRS80
  },
  ITRF2008: {
    name: 'ITRF2008',
    epoch: 2005.0,
    ellipsoid: ellipsoids.GRS80
  },
  ITRF2005: {
    name: 'ITRF2005',
    epoch: 2000.0,
    ellipsoid: ellipsoids.GRS80
  },
  ITRF2000: {
    name: 'ITRF2000',
    epoch: 1997.0,
    ellipsoid: ellipsoids.GRS80
  },
  ITRF93: {
    name: 'ITRF93',
    epoch: 1988.0,
    ellipsoid: ellipsoids.GRS80
  },
  ITRF91: {
    name: 'ITRF91',
    epoch: 1988.0,
    ellipsoid: ellipsoids.GRS80
  },
  WGS84g1762: {
    name: 'WGS84g1762',
    epoch: 2005.0,
    ellipsoid: ellipsoids.WGS84
  },
  WGS84g1674: {
    name: 'WGS84g1674',
    epoch: 2005.0,
    ellipsoid: ellipsoids.WGS84
  },
  WGS84g1150: {
    name: 'WGS84g1150',
    epoch: 2001.0,
    ellipsoid: ellipsoids.WGS84
  },
  ETRF2000: {
    name: 'ETRF2000',
    epoch: 2005.0,
    ellipsoid: ellipsoids.GRS80
  },
  NAD83: {
    name: 'NAD83',
    epoch: 1997.0,
    ellipsoid: ellipsoids.GRS80
  },
  GDA94: {
    name: 'GDA94',
    epoch: 1994.0,
    ellipsoid: ellipsoids.GRS80
  }
};
Object.keys(ellipsoids).forEach(e => Object.freeze(ellipsoids[e]));
Object.keys(referenceFrames).forEach(trf => Object.freeze(referenceFrames[trf]));
Object.keys(_latlonEllipsoidalReferenceframeTxparams.default).forEach(tx => {
  Object.freeze(_latlonEllipsoidalReferenceframeTxparams.default[tx]);
  Object.freeze(_latlonEllipsoidalReferenceframeTxparams.default[tx].params);
  Object.freeze(_latlonEllipsoidalReferenceframeTxparams.default[tx].rates);
});
class LatLonEllipsoidal_ReferenceFrame extends _latlonEllipsoidal.default {
  constructor(lat, lon, height = 0, referenceFrame = referenceFrames.ITRF2014, epoch = undefined) {
    if (!referenceFrame || referenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');
    if (epoch != undefined && isNaN(Number(epoch))) throw new TypeError(`invalid epoch ’${epoch}’`);
    super(lat, lon, height);
    this._referenceFrame = referenceFrame;
    if (epoch) this._epoch = Number(epoch);
  }
  get referenceFrame() {
    return this._referenceFrame;
  }
  get epoch() {
    return this._epoch || this.referenceFrame.epoch;
  }
  static get ellipsoids() {
    return ellipsoids;
  }
  static get referenceFrames() {
    return referenceFrames;
  }
  static get transformParameters() {
    return _latlonEllipsoidalReferenceframeTxparams.default;
  }
  static parse(...args) {
    if (args.length == 0) throw new TypeError('invalid (empty) point');
    let referenceFrame = null,
      epoch = null;
    if (!isNaN(args[1]) && typeof args[2] == 'object') {
      [referenceFrame] = args.splice(2, 1);
      [epoch] = args.splice(2, 1);
    }
    if (!isNaN(args[2]) && typeof args[3] == 'object') {
      [referenceFrame] = args.splice(3, 1);
      [epoch] = args.splice(3, 1);
    }
    if (!referenceFrame || referenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');
    const point = super.parse(...args);
    point._referenceFrame = referenceFrame;
    if (epoch) point._epoch = Number(epoch);
    return point;
  }
  convertReferenceFrame(toReferenceFrame) {
    if (!toReferenceFrame || toReferenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');
    const oldCartesian = this.toCartesian();
    const newCartesian = oldCartesian.convertReferenceFrame(toReferenceFrame);
    const newLatLon = newCartesian.toLatLon();
    return newLatLon;
  }
  toCartesian() {
    const cartesian = super.toCartesian();
    const cartesianReferenceFrame = new Cartesian_ReferenceFrame(cartesian.x, cartesian.y, cartesian.z, this.referenceFrame, this.epoch);
    return cartesianReferenceFrame;
  }
  toString(format = 'd', dp = undefined, dpHeight = null, referenceFrame = false) {
    const ll = super.toString(format, dp, dpHeight);
    const epochFmt = {
      useGrouping: false,
      minimumFractionDigits: 1,
      maximumFractionDigits: 20
    };
    const epoch = this.referenceFrame && this.epoch != this.referenceFrame.epoch ? this.epoch.toLocaleString('en', epochFmt) : '';
    const trf = referenceFrame ? ` (${this.referenceFrame.name}${epoch ? '@' + epoch : ''})` : '';
    return ll + trf;
  }
}
exports.default = LatLonEllipsoidal_ReferenceFrame;
class Cartesian_ReferenceFrame extends _latlonEllipsoidal.Cartesian {
  constructor(x, y, z, referenceFrame = undefined, epoch = undefined) {
    if (referenceFrame != undefined && referenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');
    if (epoch != undefined && isNaN(Number(epoch))) throw new TypeError(`invalid epoch ’${epoch}’`);
    super(x, y, z);
    if (referenceFrame) this._referenceFrame = referenceFrame;
    if (epoch) this._epoch = epoch;
  }
  get referenceFrame() {
    return this._referenceFrame;
  }
  set referenceFrame(referenceFrame) {
    if (!referenceFrame || referenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');
    this._referenceFrame = referenceFrame;
  }
  get epoch() {
    return this._epoch ? this._epoch : this._referenceFrame ? this._referenceFrame.epoch : undefined;
  }
  set epoch(epoch) {
    if (isNaN(Number(epoch))) throw new TypeError(`invalid epoch ’${epoch}’`);
    if (this._epoch != this._referenceFrame.epoch) this._epoch = Number(epoch);
  }
  toLatLon() {
    if (!this.referenceFrame) throw new Error('cartesian reference frame not defined');
    const latLon = super.toLatLon(this.referenceFrame.ellipsoid);
    const point = new LatLonEllipsoidal_ReferenceFrame(latLon.lat, latLon.lon, latLon.height, this.referenceFrame, this.epoch);
    return point;
  }
  convertReferenceFrame(toReferenceFrame) {
    if (!toReferenceFrame || toReferenceFrame.epoch == undefined) throw new TypeError('unrecognised reference frame');
    if (!this.referenceFrame) throw new TypeError('cartesian coordinate has no reference frame');
    if (this.referenceFrame.name == toReferenceFrame.name) return this;
    const oldTrf = this.referenceFrame;
    const newTrf = toReferenceFrame;
    if (oldTrf.name.startsWith('ITRF') && newTrf.name.startsWith('WGS84')) return this;
    if (oldTrf.name.startsWith('WGS84') && newTrf.name.startsWith('ITRF')) return this;
    const oldC = this;
    let newC = null;
    const txFwd = _latlonEllipsoidalReferenceframeTxparams.default[oldTrf.name + '→' + newTrf.name];
    const txRev = _latlonEllipsoidalReferenceframeTxparams.default[newTrf.name + '→' + oldTrf.name];
    if (txFwd || txRev) {
      const tx = txFwd ? txFwd : reverseTransform(txRev);
      const t = this.epoch || this.referenceFrame.epoch;
      const t0 = tx.epoch;
      newC = oldC.applyTransform(tx.params, tx.rates, t - t0);
    } else {
      const txAvailFromOld = Object.keys(_latlonEllipsoidalReferenceframeTxparams.default).filter(tx => tx.split('→')[0] == oldTrf.name).map(tx => tx.split('→')[1]);
      const txAvailToNew = Object.keys(_latlonEllipsoidalReferenceframeTxparams.default).filter(tx => tx.split('→')[1] == newTrf.name).map(tx => tx.split('→')[0]);
      const txIntermediateFwd = txAvailFromOld.filter(tx => txAvailToNew.includes(tx))[0];
      const txAvailFromNew = Object.keys(_latlonEllipsoidalReferenceframeTxparams.default).filter(tx => tx.split('→')[0] == newTrf.name).map(tx => tx.split('→')[1]);
      const txAvailToOld = Object.keys(_latlonEllipsoidalReferenceframeTxparams.default).filter(tx => tx.split('→')[1] == oldTrf.name).map(tx => tx.split('→')[0]);
      const txIntermediateRev = txAvailFromNew.filter(tx => txAvailToOld.includes(tx))[0];
      const txFwd1 = _latlonEllipsoidalReferenceframeTxparams.default[oldTrf.name + '→' + txIntermediateFwd];
      const txFwd2 = _latlonEllipsoidalReferenceframeTxparams.default[txIntermediateFwd + '→' + newTrf.name];
      const txRev1 = _latlonEllipsoidalReferenceframeTxparams.default[newTrf.name + '→' + txIntermediateRev];
      const txRev2 = _latlonEllipsoidalReferenceframeTxparams.default[txIntermediateRev + '→' + oldTrf.name];
      const tx1 = txIntermediateFwd ? txFwd1 : reverseTransform(txRev2);
      const tx2 = txIntermediateFwd ? txFwd2 : reverseTransform(txRev1);
      const t = this.epoch || this.referenceFrame.epoch;
      newC = oldC.applyTransform(tx1.params, tx1.rates, t - tx1.epoch);
      newC = newC.applyTransform(tx2.params, tx2.rates, t - tx2.epoch);
    }
    newC.referenceFrame = toReferenceFrame;
    newC.epoch = oldC.epoch;
    return newC;
    function reverseTransform(tx) {
      return {
        epoch: tx.epoch,
        params: tx.params.map(p => -p),
        rates: tx.rates.map(r => -r)
      };
    }
  }
  applyTransform(params, rates, δt) {
    const x1 = this.x,
      y1 = this.y,
      z1 = this.z;
    const tx = params[0] / 1000;
    const ty = params[1] / 1000;
    const tz = params[2] / 1000;
    const s = params[3] / 1e9;
    const rx = (params[4] / 3600 / 1000).toRadians();
    const ry = (params[5] / 3600 / 1000).toRadians();
    const rz = (params[6] / 3600 / 1000).toRadians();
    const ṫx = rates[0] / 1000;
    const ṫy = rates[1] / 1000;
    const ṫz = rates[2] / 1000;
    const ṡ = rates[3] / 1e9;
    const ṙx = (rates[4] / 3600 / 1000).toRadians();
    const ṙy = (rates[5] / 3600 / 1000).toRadians();
    const ṙz = (rates[6] / 3600 / 1000).toRadians();
    const T = {
      x: tx + ṫx * δt,
      y: ty + ṫy * δt,
      z: tz + ṫz * δt
    };
    const R = {
      x: rx + ṙx * δt,
      y: ry + ṙy * δt,
      z: rz + ṙz * δt
    };
    const S = 1 + s + ṡ * δt;
    const x2 = T.x + x1 * S - y1 * R.z + z1 * R.y;
    const y2 = T.y + x1 * R.z + y1 * S - z1 * R.x;
    const z2 = T.z - x1 * R.y + y1 * R.x + z1 * S;
    return new Cartesian_ReferenceFrame(x2, y2, z2);
  }
  toString(dp = 0) {
    const {
      x,
      y,
      z
    } = this;
    const epochFmt = {
      useGrouping: false,
      minimumFractionDigits: 1,
      maximumFractionDigits: 20
    };
    const epoch = this.referenceFrame && this.epoch != this.referenceFrame.epoch ? this.epoch.toLocaleString('en', epochFmt) : '';
    const trf = this.referenceFrame ? `(${this.referenceFrame.name}${epoch ? '@' + epoch : ''})` : '';
    return `[${x.toFixed(dp)},${y.toFixed(dp)},${z.toFixed(dp)}]${trf}`;
  }
}
exports.Cartesian = Cartesian_ReferenceFrame;