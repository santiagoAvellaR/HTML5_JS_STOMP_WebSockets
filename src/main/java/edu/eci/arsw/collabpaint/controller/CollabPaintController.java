package edu.eci.arsw.collabpaint.controller;


import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollabPaintController {

    @MessageMapping("/newpoint.{drawingId}/v1")
    @SendTo("/topic/newpoint.{drawingId}")
    public Point handlePoint(Point point, @DestinationVariable String drawingId) {
        System.out.println("Nuevo punto recibido en el servidor!: " + point);
        return point;
    }
}
