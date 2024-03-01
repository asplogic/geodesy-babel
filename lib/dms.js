"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
let dmsSeparator = '\u202f';
class Dms {
  static get separator() {
    return dmsSeparator;
  }
  static set separator(char) {
    dmsSeparator = char;
  }
  static parse(dms) {
    if (!isNaN(parseFloat(dms)) && isFinite(dms)) return Number(dms);
    const dmsParts = String(dms).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);
    if (dmsParts[dmsParts.length - 1] == '') dmsParts.splice(dmsParts.length - 1);
    if (dmsParts == '') return NaN;
    let deg = null;
    switch (dmsParts.length) {
      case 3:
        deg = dmsParts[0] / 1 + dmsParts[1] / 60 + dmsParts[2] / 3600;
        break;
      case 2:
        deg = dmsParts[0] / 1 + dmsParts[1] / 60;
        break;
      case 1:
        deg = dmsParts[0];
        break;
      default:
        return NaN;
    }
    if (/^-|[WS]$/i.test(dms.trim())) deg = -deg;
    return Number(deg);
  }
  static toDms(deg, format = 'd', dp = undefined) {
    if (isNaN(deg)) return null;
    if (typeof deg == 'string' && deg.trim() == '') return null;
    if (typeof deg == 'boolean') return null;
    if (deg == Infinity) return null;
    if (deg == null) return null;
    if (dp === undefined) {
      switch (format) {
        case 'd':
        case 'deg':
          dp = 4;
          break;
        case 'dm':
        case 'deg+min':
          dp = 2;
          break;
        case 'dms':
        case 'deg+min+sec':
          dp = 0;
          break;
        default:
          format = 'd';
          dp = 4;
          break;
      }
    }
    deg = Math.abs(deg);
    let dms = null,
      d = null,
      m = null,
      s = null;
    switch (format) {
      default:
      case 'd':
      case 'deg':
        d = deg.toFixed(dp);
        if (d < 100) d = '0' + d;
        if (d < 10) d = '0' + d;
        dms = d + '°';
        break;
      case 'dm':
      case 'deg+min':
        d = Math.floor(deg);
        m = (deg * 60 % 60).toFixed(dp);
        if (m == 60) {
          m = 0 .toFixed(dp);
          d++;
        }
        d = ('000' + d).slice(-3);
        if (m < 10) m = '0' + m;
        dms = d + '°' + Dms.separator + m + '′';
        break;
      case 'dms':
      case 'deg+min+sec':
        d = Math.floor(deg);
        m = Math.floor(deg * 3600 / 60) % 60;
        s = (deg * 3600 % 60).toFixed(dp);
        if (s == 60) {
          s = 0 .toFixed(dp);
          m++;
        }
        if (m == 60) {
          m = 0;
          d++;
        }
        d = ('000' + d).slice(-3);
        m = ('00' + m).slice(-2);
        if (s < 10) s = '0' + s;
        dms = d + '°' + Dms.separator + m + '′' + Dms.separator + s + '″';
        break;
    }
    return dms;
  }
  static toLat(deg, format, dp) {
    const lat = Dms.toDms(Dms.wrap90(deg), format, dp);
    return lat === null ? '–' : lat.slice(1) + Dms.separator + (deg < 0 ? 'S' : 'N');
  }
  static toLon(deg, format, dp) {
    const lon = Dms.toDms(Dms.wrap180(deg), format, dp);
    return lon === null ? '–' : lon + Dms.separator + (deg < 0 ? 'W' : 'E');
  }
  static toBrng(deg, format, dp) {
    const brng = Dms.toDms(Dms.wrap360(deg), format, dp);
    return brng === null ? '–' : brng.replace('360', '0');
  }
  static fromLocale(str) {
    const locale = 123456.789.toLocaleString();
    const separator = {
      thousands: locale.slice(3, 4),
      decimal: locale.slice(7, 8)
    };
    return str.replace(separator.thousands, '⁜').replace(separator.decimal, '.').replace('⁜', ',');
  }
  static toLocale(str) {
    const locale = 123456.789.toLocaleString();
    const separator = {
      thousands: locale.slice(3, 4),
      decimal: locale.slice(7, 8)
    };
    return str.replace(/,([0-9])/, '⁜$1').replace('.', separator.decimal).replace('⁜', separator.thousands);
  }
  static compassPoint(bearing, precision = 3) {
    if (![1, 2, 3].includes(Number(precision))) throw new RangeError(`invalid precision ‘${precision}’`);
    bearing = Dms.wrap360(bearing);
    const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const n = 4 * 2 ** (precision - 1);
    const cardinal = cardinals[Math.round(bearing * n / 360) % n * 16 / n];
    return cardinal;
  }
  static wrap90(degrees) {
    if (-90 <= degrees && degrees <= 90) return degrees;
    const x = degrees,
      a = 90,
      p = 360;
    return 4 * a / p * Math.abs(((x - p / 4) % p + p) % p - p / 2) - a;
  }
  static wrap180(degrees) {
    if (-180 <= degrees && degrees <= 180) return degrees;
    const x = degrees,
      a = 180,
      p = 360;
    return ((2 * a * x / p - p / 2) % p + p) % p - a;
  }
  static wrap360(degrees) {
    if (0 <= degrees && degrees < 360) return degrees;
    const x = degrees,
      a = 180,
      p = 360;
    return (2 * a * x / p % p + p) % p;
  }
}
Number.prototype.toRadians = function () {
  return this * Math.PI / 180;
};
Number.prototype.toDegrees = function () {
  return this * 180 / Math.PI;
};
var _default = exports.default = Dms;