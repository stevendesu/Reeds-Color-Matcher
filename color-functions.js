// Converted from https://github.com/muak/ColorMine/blob/master/ColorMine/ColorSpaces/Conversions/LabConverter.cs

function pivotRgb(n)
{
    return (n > 0.04045 ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92) * 100.0;
}

function pivotXyz(n)
{
    return n > 0.008856 ? Math.pow(n, 1/3) : (903.3 * n + 16) / 116;
}

function rgbToLab(color)
{ 
    var white = {
        x: 95.047,
        y: 100.000,
        z: 108.883
    };

    var r = pivotRgb(color.r / 255.0);
    var g = pivotRgb(color.g / 255.0);
    var b = pivotRgb(color.b / 255.0);

    var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    var z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    x = pivotXyz(x / white.x);
    y = pivotXyz(y / white.y);
    z = pivotXyz(z / white.z);

    return {
        l: Math.max(0, 116 * y - 16),
        a: 500 * (x - y),
        b: 200 * (y - z)
    };
}

function labToRgb(color)
{
    var white = {
        x: 95.047,
        y: 100.000,
        z: 108.883
    };

    var y = (color.l + 16) / 116;
    var x = color.a / 500 + y;
    var z = y - color.b / 200;

    var x3 = x * x * x;
    var z3 = z * z * z;

    x = white.x * (x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787);
    y = white.y * (color.l > (903.3 * 0.008856) ? Math.pow(((color.l + 16) / 116), 3) : color.l / 903.3);
    z = white.z * (z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787);

    x = x / 100;
    y = y / 100;
    z = z / 100;

    var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    var g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    var b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    return {
        r: Math.min(255, Math.max(0, 255 * r)),
        g: Math.min(255, Math.max(0, 255 * g)),
        b: Math.min(255, Math.max(0, 255 * b))
    };
}

if (typeof module !== "undefined")
    module.exports = {
        rgbToLab: rgbToLab,
        labToRgb: labToRgb
    };