"use strict";
/// <reference path="../node_modules/phina.js.d.ts/globalized/index.d.ts" />
class LerpHelper {
    static linear(a, b, t) {
        return a + (b - a) * t;
    }
}
class MathHelper {
    static max(a, b) {
        return a < b ? b : a;
    }
    static min(a, b) {
        return a < b ? a : b;
    }
    static wrap(v, min, max) {
        const length = max - min;
        const v2 = v - min;
        if (0 <= v2) {
            return min + (Math.floor(v2) % Math.floor(length));
        }
        return min + (length + (v2 % length)) % length;
    }
    static clamp(v, min, max) {
        if (v < min)
            return min;
        if (max < v)
            return max;
        return v;
    }
    static clamp01(v) {
        return MathHelper.clamp(v, 0.0, 1.0);
    }
    static tForLerp(a, b) {
        if (b <= 0)
            return 1;
        return a / b;
    }
    static tForLerpClapmed(a, b) {
        if (b <= 0)
            return 1;
        return MathHelper.clamp01(a / b);
    }
    static isLerpEnd(t) {
        return 1 <= t;
    }
    /** [ min, max ) */
    static isInRange(v, min, max) {
        return min <= v && v < max;
    }
    static progress01(t, length) {
        if (length <= 0)
            return 1.0;
        return MathHelper.clamp01(t / length);
    }
}
function assertEq(a, b) {
    if (a === b)
        return;
    throw "assert " + a + " vs " + b;
}
assertEq(0, MathHelper.wrap(3, 0, 3));
assertEq(2, MathHelper.wrap(2, 0, 3));
assertEq(1, MathHelper.wrap(1, 0, 3));
assertEq(2, MathHelper.wrap(-1, 0, 3));
assertEq(1, MathHelper.wrap(-2, 0, 3));
assertEq(0, MathHelper.wrap(-3, 0, 3));
assertEq(2, MathHelper.wrap(-4, 0, 3));
assertEq(1, MathHelper.wrap(-5, 0, 3));
assertEq(0, MathHelper.clamp(-1, 0, 10));
assertEq(10, MathHelper.clamp(11, 0, 10));
assertEq(1, MathHelper.progress01(2, 0));
assertEq(1, MathHelper.progress01(2, -10));
assertEq(0, MathHelper.progress01(0, 10));
assertEq(0.5, MathHelper.progress01(5, 10));
assertEq(1, MathHelper.progress01(10, 10));
assertEq(1, MathHelper.progress01(11, 10));
