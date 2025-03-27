package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class PolygonController {

    private final SimpMessagingTemplate messagingTemplate;

    private final Map<String, List<Point>> drawingPoints = new ConcurrentHashMap<>();

    public PolygonController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/newpoint.{drawingId}")
    public void handlePoint(@Payload Point point, @DestinationVariable String drawingId) {
        List<Point> points = drawingPoints.computeIfAbsent(drawingId, k -> Collections.synchronizedList(new ArrayList<>()));
        points.add(point);
        if (points.size() >= 3) {
            Polygon polygon = new Polygon(new ArrayList<>(points));
            messagingTemplate.convertAndSend("/topic/newpolygon." + drawingId, polygon);
            points.clear();
        }
        messagingTemplate.convertAndSend("/topic/newpoint." + drawingId, point);
    }
}
