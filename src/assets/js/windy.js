/*  全局类，用于通过1公里风速网格模拟粒子的运动
    此类接收一个canvas元素和一组数据(1公里的GFS数据来自http://www.emc.ncep.noaa.gov/index.php?branch=GFS)
    并使用墨卡托投影（正向/反向）来正确映射风向矢量到“地图空间”。
    "start"方法接受当前地图范围的边界并启动整个网格化、插值和动画过程。
*/

var Windy = function (params) {

    var VELOCITY_SCALE = 0.011;   // 风速缩放比例（完全自定义的值）
    var INTENSITY_SCALE_STEP = 10;  // 粒子强度颜色的步进
    var MAX_WIND_INTENSITY = 40;  // 最大风速强度，用于粒子的最大强度（单位：m/s）
    var MAX_PARTICLE_AGE = 100;   // 粒子的最大寿命（帧数）
    var PARTICLE_LINE_WIDTH = 2; // 绘制粒子的线宽
    var PARTICLE_MULTIPLIER = 1 / 30;    // 粒子数量缩放值
    var PARTICLE_REDUCTION = 0.75;  // 移动设备的粒子数量减少比例
    var FRAME_RATE = 20;  // 每帧的毫秒数
    var BOUNDARY = 0.45;// 边界

    var NULL_WIND_VECTOR = [NaN, NaN, null];     // 表示无风的向量
    var TRANSPARENT_BLACK = [255, 0, 0, 0];  // 透明黑色，用于绘制透明度

    // 常数π乘2
    var τ = 2 * Math.PI;
    var H = Math.pow(10, -5.2);

    // 插值计算函数，用于类似风速的矢量（u, v, m）
    var bilinearInterpolateVector = function (x, y, g00, g10, g01, g11) {
        var rx = (1 - x);
        var ry = (1 - y);
        var a = rx * ry, b = x * ry, c = rx * y, d = x * y;
        var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
        var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
        return [u, v, Math.sqrt(u * u + v * v)];
    };

    // 创建风速构建器，将u方向和v方向的数据构建成风速信息
    var createWindBuilder = function (uComp, vComp) {
        var uData = uComp.data, vData = vComp.data;
        return {
            header: uComp.header,
            data: function (i) {
                return [uData[i], vData[i]];
            },
            interpolate: bilinearInterpolateVector
        }
    };

    // 构建数据生成器
    var createBuilder = function (data) {
        var uComp = null, vComp = null, scalar = null;

        data.forEach(function (record) {
            switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
                case "2,2":
                    uComp = record;
                    break;
                case "2,3":
                    vComp = record;
                    break;
                default:
                    scalar = record;
            }
        });

        return createWindBuilder(uComp, vComp);
    };

    // 构建网格，将风速数据处理为可用于计算的网格结构
    var buildGrid = function (data, callback) {
        var builder = createBuilder(data);

        var header = builder.header;
        var λ0 = header.lo1, φ0 = header.la1;  // 网格的起点（例如：0.0E, 90.0N）
        var Δλ = header.dx, Δφ = header.dy;    // 网格点之间的经纬度距离（例如：2.5度经度, 2.5度纬度）
        var ni = header.nx, nj = header.ny;    // 东西和南北的网格点数量（例如：144 x 73）
        var date = new Date(header.refTime);
        date.setHours(date.getHours() + header.forecastTime);

        // 假设扫描模式为0，表示经度从λ0增加，纬度从φ0减少。
        var grid = [], p = 0;
        var isContinuous = Math.floor(ni * Δλ) >= 360;
        for (var j = 0; j < nj; j++) {
            var row = [];
            for (var i = 0; i < ni; i++, p++) {
                row[i] = builder.data(p);
            }
            if (isContinuous) {
                row.push(row[0]);
            }
            grid[j] = row;
        }

        // 插值函数，通过经纬度找到风速信息
        function interpolate(λ, φ) {
            var i = floorMod(λ - λ0, 360) / Δλ;
            var j = (φ0 - φ) / Δφ;

            var fi = Math.floor(i), ci = fi + 1;
            var fj = Math.floor(j), cj = fj + 1;

            var row;
            if ((row = grid[fj])) {
                var g00 = row[fi];
                var g10 = row[ci];
                if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                    var g01 = row[fi];
                    var g11 = row[ci];
                    if (isValue(g01) && isValue(g11)) {
                        return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
                    }
                }
            }
            return null;
        }

        callback({
            date: date,
            interpolate: interpolate
        });
    };

    /**
     * 判断指定值是否有效
     */
    var isValue = function (x) {
        return x !== null && x !== undefined;
    }

    /**
     * 计算整除余数，用于一致的模运算
     */
    var floorMod = function (a, n) {
        return a - n * Math.floor(a / n);
    }

    /**
     * 将值x限制在给定范围内
     */
    var clamp = function (x, range) {
        return Math.max(range[0], Math.min(x, range[1]));
    }

    /**
     * 判断是否是移动设备
     */
    var isMobile = function () {
        return (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i).test(navigator.userAgent);
    }

    /**
     * 计算风向矢量因投影形状而产生的失真
     */
    var distort = function (projection, λ, φ, x, y, scale, wind, windy) {
        var u = wind[0] * scale;
        var v = wind[1] * scale;
        var d = distortion(projection, λ, φ, x, y, windy);

        wind[0] = d[0] * u + d[2] * v;
        wind[1] = d[1] * u + d[3] * v;
        return wind;
    };

    // 失真计算
    var distortion = function (projection, λ, φ, x, y, windy) {
        var τ = 2 * Math.PI;
        var H = Math.pow(10, -5.2);
        var hλ = λ < 0 ? H : -H;
        var hφ = φ < 0 ? H : -H;

        var pλ = project(φ, λ + hλ, windy);
        var pφ = project(φ + hφ, λ, windy);

        var k = Math.cos(φ / 360 * τ);
        return [
            (pλ[0] - x) / hλ / k,
            (pλ[1] - y) / hλ / k,
            (pφ[0] - x) / hφ,
            (pφ[1] - y) / hφ
        ];
    };

    // 创建风场
    var createField = function (columns, bounds, callback) {
        function field(x, y) {
            var column = columns[Math.round(x)];
            return column && column[Math.round(y)] || NULL_WIND_VECTOR;
        }

        // 释放columns数组
        field.release = function () {
            columns = [];
        };

        field.randomize = function (o) {
            var x, y;
            var safetyNet = 0;
            do {
                x = Math.round(Math.floor(Math.random() * bounds.width) + bounds.x);
                y = Math.round(Math.floor(Math.random() * bounds.height) + bounds.y)
            } while (field(x, y)[2] === null && safetyNet++ < 30);
            o.x = x;
            o.y = y;
            return o;
        };

        callback(bounds, field);
    };

    // 构建地图边界
    var buildBounds = function (bounds, width, height) {
        var upperLeft = bounds[0];
        var lowerRight = bounds[1];
        var x = Math.round(upperLeft[0]);
        var y = Math.max(Math.floor(upperLeft[1], 0), 0);
        var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
        var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
        return {x: x, y: y, xMax: width, yMax: yMax, width: width, height: height};
    };

    // 角度转弧度
    var deg2rad = function (deg) {
        return (deg / 180) * Math.PI;
    };

    // 弧度转角度
    var rad2deg = function (ang) {
        return ang / (Math.PI / 180.0);
    };

    // 经纬度转换为像素位置
    var invert = function (x, y, windy) {
        var mapLonDelta = windy.east - windy.west;
        var worldMapRadius = windy.width / rad2deg(mapLonDelta) * 360 / (2 * Math.PI);
        var mapOffsetY = (worldMapRadius / 2 * Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south))));
        var equatorY = windy.height + mapOffsetY;
        var a = (equatorY - y) / worldMapRadius;

        var lat = 180 / Math.PI * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
        var lon = rad2deg(windy.west) + x / windy.width * rad2deg(mapLonDelta);
        return [lon, lat];
    };

    // 墨卡托投影的y坐标
    var mercY = function (lat) {
        return Math.log(Math.tan(lat / 2 + Math.PI / 4));
    };

    // 投影转换
    var project = function (lat, lon, windy) {
        var ymin = mercY(windy.south);
        var ymax = mercY(windy.north);
        var xFactor = windy.width / (windy.east - windy.west);
        var yFactor = windy.height / (ymax - ymin);

        var y = mercY(deg2rad(lat));
        var x = (deg2rad(lon) - windy.west) * xFactor;
        y = (ymax - y) * yFactor;  // y向南
        return [x, y];
    };

    // 插值风场
    var interpolateField = function (grid, bounds, extent, callback) {
        var projection = {};
        var velocityScale = VELOCITY_SCALE;

        var columns = [];
        var x = bounds.x;

        function interpolateColumn(x) {
            var column = [];
            for (var y = bounds.y; y <= bounds.yMax; y += 2) {
                var coord = invert(x, y, extent);
                if (coord) {
                    var λ = coord[0], φ = coord[1];
                    if (isFinite(λ)) {
                        var wind = grid.interpolate(λ, φ);
                        if (wind) {
                            wind = distort(projection, λ, φ, x, y, velocityScale, wind, extent);
                            column[y + 1] = column[y] = wind;
                        }
                    }
                }
            }
            columns[x + 1] = columns[x] = column;
        }

        (function batchInterpolate() {
            var start = Date.now();
            while (x < bounds.width) {
                interpolateColumn(x);
                x += 2;
                if ((Date.now() - start) > 1000) {
                    setTimeout(batchInterpolate, 25);
                    return;
                }
            }
            createField(columns, bounds, callback);
        })();
    };

    // 动画函数，用于绘制粒子运动
    var animate = function (bounds, field) {
        function asColorStyle(r, g, b, a) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
        }

        function hexToR(h) {
            return parseInt((cutHex(h)).substring(0, 2), 16)
        }

        function hexToG(h) {
            return parseInt((cutHex(h)).substring(2, 4), 16)
        }

        function hexToB(h) {
            return parseInt((cutHex(h)).substring(4, 6), 16)
        }

        function cutHex(h) {
            return (h.charAt(0) == "#") ? h.substring(1, 7) : h
        }

        // 风速颜色梯度
        function windIntensityColorScale(step, maxWind) {
            var result = [
                "rgba(" + hexToR('#00ffff') + ", " + hexToG('#00ffff') + ", " + hexToB('#00ffff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#64f0ff') + ", " + hexToG('#64f0ff') + ", " + hexToB('#64f0ff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#87e1ff') + ", " + hexToG('#87e1ff') + ", " + hexToB('#87e1ff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#a0d0ff') + ", " + hexToG('#a0d0ff') + ", " + hexToB('#a0d0ff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#b5c0ff') + ", " + hexToG('#b5c0ff') + ", " + hexToB('#b5c0ff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#c6adff') + ", " + hexToG('#c6adff') + ", " + hexToB('#c6adff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#d49bff') + ", " + hexToG('#d49bff') + ", " + hexToB('#d49bff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#e185ff') + ", " + hexToG('#e185ff') + ", " + hexToB('#e185ff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#ec6dff') + ", " + hexToG('#ec6dff') + ", " + hexToB('#ec6dff') + ", " + 0.5 + ")",
                "rgba(" + hexToR('#ff1edb') + ", " + hexToG('#ff1edb') + ", " + hexToB('#ff1edb') + ", " + 0.5 + ")"
            ];
            result.indexFor = function (m) {
                return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1));
            };
            return result;
        }

        // 粒子的颜色和桶
        var colorStyles = windIntensityColorScale(INTENSITY_SCALE_STEP, MAX_WIND_INTENSITY);
        var buckets = colorStyles.map(function () {
            return [];
        });

        var particleCount = Math.round(bounds.width * bounds.height * PARTICLE_MULTIPLIER);
        if (isMobile()) {
            particleCount *= PARTICLE_REDUCTION;
        }

        var fadeFillStyle = "rgba(0, 0, 0, 0.97)";
        var particles = [];
        for (var i = 0; i < particleCount; i++) {
            particles.push(field.randomize({age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0}));
        }

        // 演变粒子位置
        function evolve() {
            buckets.forEach(function (bucket) {
                bucket.length = 0;
            });
            particles.forEach(function (particle) {
                if (particle.age > MAX_PARTICLE_AGE) {
                    field.randomize(particle).age = 0;
                }
                var x = particle.x;
                var y = particle.y;
                var v = field(x, y);
                var m = v[2];
                if (m === null) {
                    particle.age = MAX_PARTICLE_AGE;
                } else {
                    var xt = x + v[0];
                    var yt = y + v[1];
                    if (field(xt, yt)[2] !== null) {
                        particle.xt = xt;
                        particle.yt = yt;
                        buckets[colorStyles.indexFor(m)].push(particle);
                    } else {
                        particle.x = xt;
                        particle.y = yt;
                    }
                }
                particle.age += 1;
            });
        }

        var g = params.canvas.getContext("2d");
        g.lineWidth = PARTICLE_LINE_WIDTH;
        g.fillStyle = fadeFillStyle;

        // 绘制粒子轨迹
        function draw() {
            // 淡化现有的粒子轨迹
            var prev = g.globalCompositeOperation;
            g.globalCompositeOperation = "destination-in";
            g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            g.globalCompositeOperation = prev;

            // 绘制新的粒子轨迹
            buckets.forEach(function (bucket, i) {
                if (bucket.length > 0) {
                    g.beginPath();
                    g.strokeStyle = colorStyles[i];
                    bucket.forEach(function (particle) {
                        g.moveTo(particle.x, particle.y);
                        g.lineTo(particle.xt, particle.yt);
                        particle.x = particle.xt;
                        particle.y = particle.yt;
                    });
                    g.stroke();
                }
            });
        }

        // 动画帧循环
        (function frame() {
            try {
                windy.timer = setTimeout(function () {
                    requestAnimationFrame(frame);
                    evolve();
                    draw();
                }, 1000 / FRAME_RATE);
            } catch (e) {
                console.error(e);
            }
        })();
    }

    // 开始风场动画
    var start = function (bounds, width, height, extent) {
        var mapBounds = {
            south: deg2rad(extent[0][1]),
            north: deg2rad(extent[1][1]),
            east: deg2rad(extent[1][0]),
            west: deg2rad(extent[0][0]),
            width: width,
            height: height
        };

        stop();

        // 构建网格
        buildGrid(params.data, function (grid) {
            // 插值风场
            interpolateField(grid, buildBounds(bounds, width, height), mapBounds, function (bounds, field) {
                // 用随机点生成动画
                windy.field = field;
                animate(bounds, field);
            });
        });
    };

    // 停止风场动画
    var stop = function () {
        if (windy.field) windy.field.release();
        if (windy.timer) clearTimeout(windy.timer);
    };

    // 将风场对象返回
    var windy = {
        params: params,
        start: start,
        stop: stop
    };

    return windy;
}

// 使用requestAnimationFrame的兼容性shim
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 20);
        };
})();
