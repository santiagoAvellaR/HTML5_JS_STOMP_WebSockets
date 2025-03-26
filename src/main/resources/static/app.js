var app = (function () {
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var drawingId = null;
    var points = []; // Arreglo para almacenar puntos temporalmente

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI); // Radio 1
        ctx.fill(); // También podrías usar stroke(), pero fill() pinta el círculo
    };

    var drawPolygon = function (points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        if (points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y); // Moverse al primer punto
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y); // Dibujar línea hacia los siguientes puntos
            }
            ctx.closePath(); // Cerrar el polígono
            ctx.stroke(); // Dibujar el contorno
        }
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

            // Suscripción al tópico de puntos
            stompClient.subscribe('/topic/newpoint.' + drawingId, function (message) {
                var point = JSON.parse(message.body);
                addPointToCanvas(point);
            });

            // Suscripción al tópico de polígonos
            stompClient.subscribe('/topic/newpolygon.' + drawingId, function (message) {
                var polygon = JSON.parse(message.body);
                drawPolygon(polygon.points); // Dibujar el polígono recibido
            });
        });
    };

    return {
        init: function () {
            var canvas = document.getElementById("canvas");
            canvas.addEventListener('click', function (evt) {
                var pos = getMousePosition(evt);
                // Agregar punto al arreglo temporal y publicarlo
                points.push(new Point(pos.x, pos.y));
                app.publishPoint(pos.x, pos.y);

                // Si se han registrado al menos 3 puntos, enviar el polígono
                if (points.length >= 3) {
                    app.publishPolygon(points);
                    points = []; // Reiniciar los puntos después de publicar el polígono
                }
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

        publishPolygon: function (points) {
            if (drawingId) {
                console.info("Publicando polígono en " + JSON.stringify(points));
                stompClient.send("/topic/newpolygon." + drawingId, {}, JSON.stringify({ points: points }));
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