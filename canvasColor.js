(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();
var calcModule = (function() {
    var canvasData, ctx, origData, curX, curY, origX, origY, cWidth;
    var points = [];
    var allPoints = [];
    var x;
    var y;
    var n;
    var i = 0;
    var alpha = 255;
    function Point() {
        this.isSet = false;
        this.toSet = false;
        this.setColor = function(x, y, r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            this.isSet = true;
            setPixel(x, y, r, g, b, a);
        };
    }

    function getIndex(x, y) {
        if (!cWidth) {
            cWidth = canvasData.width;
        }
        return (x + y * cWidth) * 4;
    }
    function setPixel(x, y, r, g, b, a) {
        var idx = getIndex(x, y);
        canvasData.data[idx + 0] = r;
        canvasData.data[idx + 1] = g;
        canvasData.data[idx + 2] = b;
        canvasData.data[idx + 3] = a;
    }
    function mixColor(colorArray) {
        var rsum;
        var gsum;
        var bsum;
        var varianceR1, varianceR2, varianceG1, varianceG2, varianceB1, varianceB2;
        varianceR1 = varianceR2 = varianceG1 = varianceG2 = varianceB1 = varianceB2 = 10;
        rsum = gsum = bsum = 0;
        for (var i = 0; i < colorArray.length; i++) {
            rsum += colorArray[i][0];
            gsum += colorArray[i][1];
            bsum += colorArray[i][2];
        }

        var r = parseInt((rsum / colorArray.length + Math.random() * varianceR1 - Math.random() * varianceR2) % 256, 10);
        var g = parseInt((gsum / colorArray.length + Math.random() * varianceG1 - Math.random() * varianceG2) % 256, 10);
        var b = parseInt((bsum / colorArray.length + Math.random() * varianceB1 - Math.random() * varianceB2) % 256, 10);
        return {
            r: r,
            g: g,
            b: b,
            a: alpha
        };
    }
    function draw() {
        ctx.putImageData(canvasData, 0, 0);
    }

    function getNeighbors(x, y) {
        var has = [];
        if (Math.random() > 0.5) {
            if (x > 0) {
                if (allPoints[x - 1][y].isSet) {
                    has.push(2);
                }
            }
            if (x < allPoints.length - 1) {
                if (allPoints[x + 1][y].isSet) {
                    has.push(1);
                }
            }
            if (y > 0) {
                if (allPoints[x][y - 1].isSet) {
                    has.push(4);
                }
            }
            if (y < allPoints[x].length - 1) {
                if (allPoints[x][y + 1].isSet) {
                    has.push(3);
                }
            }
        }
        return has;
    }

    return {
        update: function() {
            var allSet = true;
            var pointsToSet = [];
            for (var x = 0; x < allPoints.length; x++) {
                for (var y = 0; y < allPoints[x].length; y++) {
                    if (!allPoints[x][y].isSet) {
                        allSet = false;
                        n = getNeighbors(x, y);
                        if (n.length > 0) {
                            allPoints[x][y].n = n;
                            allPoints[x][y].colorPool = [];
                            for (var index in n) {
                                switch (n[index]) {
                                    case 1:
                                        var np = allPoints[x + 1][y];
                                        allPoints[x][y].colorPool.push([np.r, np.g, np.b, np.a]);
                                        break;
                                    case 2:
                                        var np = allPoints[x - 1][y];
                                        allPoints[x][y].colorPool.push([np.r, np.g, np.b, np.a]);
                                        break;
                                    case 3:
                                        var np = allPoints[x][y + 1];
                                        allPoints[x][y].colorPool.push([np.r, np.g, np.b, np.a]);
                                        break;
                                    case 4:
                                        var np = allPoints[x][y - 1];
                                        allPoints[x][y].colorPool.push([np.r, np.g, np.b, np.a]);
                                        break;
                                }
                            }
                            pointsToSet.push([x, y]);
                        }
                    }
                }
            }

            for (var i = 0; i < pointsToSet.length; i++) {
                x = pointsToSet[i][0];
                y = pointsToSet[i][1];
                allPoints[x][y].isSet = true;
                var color = mixColor(allPoints[x][y].colorPool);
                allPoints[x][y].setColor(x, y, color.r, color.g, color.b, color.a);
            }
            if (calc) {
                draw();
                if (!allSet) {
                    requestAnimationFrame(calcModule.update);
                } else {
                    console.log('finished');
                }
            }
        },
        listener: function(event) {
            calc = !calc;
            alpha = 255;
            if (calc) {
                ctx = this.getContext('2d');
                canvasData = ctx.createImageData(this.width, this.height);
                allPoints = [];
                for (var x = 0; x < this.width; x++) {
                    allPoints[x] = [];
                    for (var y = 0; y < this.height; y++) {
                        allPoints[x][y] = new Point();
                    }
                }
                allPoints[event.offsetX][event.offsetY].isSet = true;
                allPoints[event.offsetX][event.offsetY].setColor(event.offsetX, event.offsetY, 128, 128, 128, alpha);
                requestAnimationFrame(calcModule.update);
            }
        }
    };
}());
document.getElementById('canvas').addEventListener('click', calcModule.listener);
var calc = false;