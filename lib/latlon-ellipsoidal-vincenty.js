"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Dms", {
  enumerable: true,
  get: function () {
    return _latlonEllipsoidal.Dms;
  }
});
exports.default = void 0;

var _latlonEllipsoidal = _interopRequireWildcard(require("./latlon-ellipsoidal.js"));

const π = Math.PI;
const ε = Number.EPSILON;

class LatLonEllipsoidal_Vincenty extends _latlonEllipsoidal.default {
  distanceTo(point) {
    try {
      const dist = this.inverse(point).distance;
      return Number(dist.toFixed(3));
    } catch (e) {
      if (e instanceof EvalError) return NaN;
      throw e;
    }
  }

  initialBearingTo(point) {
    try {
      const brng = this.inverse(point).initialBearing;
      return Number(brng.toFixed(7));
    } catch (e) {
      if (e instanceof EvalError) return NaN;
      throw e;
    }
  }

  finalBearingTo(point) {
    try {
      const brng = this.inverse(point).finalBearing;
      return Number(brng.toFixed(7));
    } catch (e) {
      if (e instanceof EvalError) return NaN;
      throw e;
    }
  }

  destinationPoint(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).point;
  }

  finalBearingOn(distance, initialBearing) {
    const brng = this.direct(Number(distance), Number(initialBearing)).finalBearing;
    return Number(brng.toFixed(7));
  }

  direct(distance, initialBearing) {
    if (this.height != 0) throw new RangeError('point must be on the surface of the ellipsoid');
    const φ1 = this.lat.toRadians(),
          λ1 = this.lon.toRadians();
    const α1 = initialBearing.toRadians();
    const s = distance;
    const ellipsoid = this.datum ? this.datum.ellipsoid : _latlonEllipsoidal.default.ellipsoids.WGS84;
    const {
      a,
      b,
      f
    } = ellipsoid;
    const sinα1 = Math.sin(α1);
    const cosα1 = Math.cos(α1);
    const tanU1 = (1 - f) * Math.tan(φ1),
          cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
          sinU1 = tanU1 * cosU1;
    const σ1 = Math.atan2(tanU1, cosα1);
    const sinα = cosU1 * sinα1;
    const cosSqα = 1 - sinα * sinα;
    const uSq = cosSqα * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    let σ = s / (b * A),
        sinσ = null,
        cosσ = null,
        Δσ = null;
    let cos2σₘ = null;
    let σʹ = null,
        iterations = 0;

    do {
      cos2σₘ = Math.cos(2 * σ1 + σ);
      sinσ = Math.sin(σ);
      cosσ = Math.cos(σ);
      Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) - B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));
      σʹ = σ;
      σ = s / (b * A) + Δσ;
    } while (Math.abs(σ - σʹ) > 1e-12 && ++iterations < 100);

    if (iterations >= 100) throw new EvalError('Vincenty formula failed to converge');
    const x = sinU1 * sinσ - cosU1 * cosσ * cosα1;
    const φ2 = Math.atan2(sinU1 * cosσ + cosU1 * sinσ * cosα1, (1 - f) * Math.sqrt(sinα * sinα + x * x));
    const λ = Math.atan2(sinσ * sinα1, cosU1 * cosσ - sinU1 * sinσ * cosα1);
    const C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
    const L = λ - (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
    const λ2 = λ1 + L;
    const α2 = Math.atan2(sinα, -x);
    const destinationPoint = new LatLonEllipsoidal_Vincenty(φ2.toDegrees(), λ2.toDegrees(), 0, this.datum);
    return {
      point: destinationPoint,
      finalBearing: _latlonEllipsoidal.Dms.wrap360(α2.toDegrees()),
      iterations: iterations
    };
  }

  inverse(point) {
    if (!(point instanceof _latlonEllipsoidal.default)) throw new TypeError(`invalid point ‘${point}’`);
    if (this.height != 0 || point.height != 0) throw new RangeError('point must be on the surface of the ellipsoid');
    const p1 = this,
          p2 = point;
    const φ1 = p1.lat.toRadians(),
          λ1 = p1.lon.toRadians();
    const φ2 = p2.lat.toRadians(),
          λ2 = p2.lon.toRadians();
    const ellipsoid = this.datum ? this.datum.ellipsoid : _latlonEllipsoidal.default.ellipsoids.WGS84;
    const {
      a,
      b,
      f
    } = ellipsoid;
    const L = λ2 - λ1;
    const tanU1 = (1 - f) * Math.tan(φ1),
          cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1),
          sinU1 = tanU1 * cosU1;
    const tanU2 = (1 - f) * Math.tan(φ2),
          cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2),
          sinU2 = tanU2 * cosU2;
    const antipodal = Math.abs(L) > π / 2 || Math.abs(φ2 - φ1) > π / 2;
    let λ = L,
        sinλ = null,
        cosλ = null;
    let σ = antipodal ? π : 0,
        sinσ = 0,
        cosσ = antipodal ? -1 : 1,
        sinSqσ = null;
    let cos2σₘ = 1;
    let sinα = null,
        cosSqα = 1;
    let C = null;
    let λʹ = null,
        iterations = 0;

    do {
      sinλ = Math.sin(λ);
      cosλ = Math.cos(λ);
      sinSqσ = cosU2 * sinλ * (cosU2 * sinλ) + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) * (cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
      if (Math.abs(sinSqσ) < ε) break;
      sinσ = Math.sqrt(sinSqσ);
      cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
      σ = Math.atan2(sinσ, cosσ);
      sinα = cosU1 * cosU2 * sinλ / sinσ;
      cosSqα = 1 - sinα * sinα;
      cos2σₘ = cosSqα != 0 ? cosσ - 2 * sinU1 * sinU2 / cosSqα : 0;
      C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
      λʹ = λ;
      λ = L + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
      const iterationCheck = antipodal ? Math.abs(λ) - π : Math.abs(λ);
      if (iterationCheck > π) throw new EvalError('λ > π');
    } while (Math.abs(λ - λʹ) > 1e-12 && ++iterations < 1000);

    if (iterations >= 1000) throw new EvalError('Vincenty formula failed to converge');
    const uSq = cosSqα * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const Δσ = B * sinσ * (cos2σₘ + B / 4 * (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) - B / 6 * cos2σₘ * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σₘ * cos2σₘ)));
    const s = b * A * (σ - Δσ);
    const α1 = Math.abs(sinSqσ) < ε ? 0 : Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
    const α2 = Math.abs(sinSqσ) < ε ? π : Math.atan2(cosU1 * sinλ, -sinU1 * cosU2 + cosU1 * sinU2 * cosλ);
    return {
      distance: s,
      initialBearing: Math.abs(s) < ε ? NaN : _latlonEllipsoidal.Dms.wrap360(α1.toDegrees()),
      finalBearing: Math.abs(s) < ε ? NaN : _latlonEllipsoidal.Dms.wrap360(α2.toDegrees()),
      iterations: iterations
    };
  }

}

exports.default = LatLonEllipsoidal_Vincenty;