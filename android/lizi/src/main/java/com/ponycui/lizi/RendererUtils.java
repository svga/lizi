package com.ponycui.lizi;

import java.util.Random;

public class RendererUtils {

    static Offset getPosition(Emitter emitter, _RotationAdjusting adjustRotation, double scale) {
        if (emitter.emitterShape == EmitterShape.point) {
            return new Offset(emitter.emitterPosition.x  * scale, emitter.emitterPosition.y * scale);
        } else if (emitter.emitterShape == EmitterShape.rectangle ||
                emitter.emitterShape == EmitterShape.cuboid) {
            if (emitter.emitterMode == EmitterMode.surface) {
                return new Offset(
                        ((emitter.emitterPosition.x - emitter.emitterSize.width / 2.0) +
                                new Random().nextDouble() * emitter.emitterSize.width) * scale,
                        ((emitter.emitterPosition.y - emitter.emitterSize.height / 2.0) +
                                new Random().nextDouble() * emitter.emitterSize.height) * scale
                );
            } else if (emitter.emitterMode == EmitterMode.points) {
                return new Offset(
                        ((emitter.emitterPosition.x - emitter.emitterSize.width / 2.0) +
                                Math.round(new Random().nextDouble()) * emitter.emitterSize.width) * scale,
                        ((emitter.emitterPosition.y - emitter.emitterSize.height / 2.0) +
                                Math.round(new Random().nextDouble()) * emitter.emitterSize.height) * scale
                );
            } else if (emitter.emitterMode == EmitterMode.outline) {
                if (new Random().nextBoolean()) {
                    double yValue = Math.round(new Random().nextDouble());
                    if (yValue < 0.01) {
                        adjustRotation.value = Math.PI * 1.5;
                    } else {
                        adjustRotation.value = Math.PI * -1.5;
                    }
                    return new Offset(
                            ((emitter.emitterPosition.x - emitter.emitterSize.width / 2.0) +
                                    new Random().nextDouble() * emitter.emitterSize.width) * scale,
                            ((emitter.emitterPosition.y - emitter.emitterSize.height / 2.0) +
                                    yValue * emitter.emitterSize.height) * scale
                    );
                } else {
                    double xValue = Math.round(new Random().nextDouble());
                    if (xValue < 0.01) {
                        adjustRotation.value = Math.PI * 1.0;
                    } else {
                        adjustRotation.value = 0.0;
                    }
                    return new Offset(
                            ((emitter.emitterPosition.x - emitter.emitterSize.width / 2.0) +
                                    xValue * emitter.emitterSize.width) * scale,
                            ((emitter.emitterPosition.y - emitter.emitterSize.height / 2.0) +
                                    new Random().nextDouble() * emitter.emitterSize.height) * scale
                    );
                }
            } else {
                return new Offset(
                        ((emitter.emitterPosition.x - emitter.emitterSize.width / 2.0) +
                                new Random().nextDouble() * emitter.emitterSize.width) * scale,
                        ((emitter.emitterPosition.y - emitter.emitterSize.height / 2.0) +
                                new Random().nextDouble() * emitter.emitterSize.height) * scale
                );
            }
        } else if (emitter.emitterShape == EmitterShape.circle ||
                emitter.emitterShape == EmitterShape.sphere) {
            if (emitter.emitterMode == EmitterMode.surface) {
                double t = Math.PI * 2 * new Random().nextDouble();
                double x =
                        (new Random().nextDouble() * emitter.emitterSize.width / 2.0) * Math.cos(t);
                double y =
                        (new Random().nextDouble() * emitter.emitterSize.height / 2.0) * Math.sin(t);
                return new Offset(
                        (emitter.emitterPosition.x + x) * scale,
                        (emitter.emitterPosition.y + y) * scale
                );
            } else if (emitter.emitterMode == EmitterMode.points) {
                return new Offset(emitter.emitterPosition.x  * scale, emitter.emitterPosition.y * scale);
            } else if (emitter.emitterMode == EmitterMode.outline) {
                double t = Math.PI * 2 * new Random().nextDouble();
                double x = (emitter.emitterSize.width / 2.0) * Math.cos(t);
                double y = (emitter.emitterSize.height / 2.0) * Math.sin(t);
                adjustRotation.value = t;
                return new Offset(
                        (emitter.emitterPosition.x + x) * scale,
                        (emitter.emitterPosition.y + y) * scale
                );
            } else {
                double t = Math.PI * 2 * new Random().nextDouble();
                double x =
                        (new Random().nextDouble() * emitter.emitterSize.width / 2.0) * Math.cos(t);
                double y =
                        (new Random().nextDouble() * emitter.emitterSize.height / 2.0) * Math.sin(t);
                return new Offset(
                        (emitter.emitterPosition.x + x) * scale,
                        (emitter.emitterPosition.y + y) * scale
                );
            }
        } else {
            return new Offset(emitter.emitterPosition.x  * scale, emitter.emitterPosition.y * scale);
        }
    }

}
