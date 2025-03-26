var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var drawingId = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI); // Radio 1
        ctx.fill();  // También podrías usar stroke(), pero fill() pinta el círculo
    };

    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + drawingId, function (message) {
                var point = JSON.parse(message.body);
                addPointToCanvas(point);
            });
        });
    };

    return {
        init: function () {
            var canvas = document.getElementById("canvas");
            canvas.addEventListener('click', function (evt) {
                var pos = getMousePosition(evt);
                app.publishPoint(pos.x, pos.y);
            });
        },

        connect: function () {
            drawingId = document.getElementById("drawingId").value;
            if (drawingId) {
                connectAndSubscribe();
            } else {
                alert("Por favor, ingrese un ID de dibujo.");
            }
        },

        publishPoint: function (px, py) {
            if (drawingId) {
                var pt = new Point(px, py);
                console.info("Publicando punto en " + JSON.stringify(pt));
                addPointToCanvas(pt);
                stompClient.send("/topic/newpoint." + drawingId, {}, JSON.stringify(pt));
            } else {
                alert("Por favor, conéctese a un dibujo primero.");
            }
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };

})();