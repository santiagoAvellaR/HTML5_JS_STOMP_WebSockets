package edu.eci.arsw.collabpaint.controller;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollabPaintController {

    @MessageMapping("/newpoint.{drawingId}")
    @SendTo("/topic/newpoint.{drawingId}")
    public Point handlePoint(Point point, @DestinationVariable String drawingId) {
        return point;
    }
}
