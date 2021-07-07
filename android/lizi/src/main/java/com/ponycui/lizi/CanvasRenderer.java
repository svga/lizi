package com.ponycui.lizi;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
import android.graphics.Paint;
import android.graphics.Rect;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class CanvasRenderer {

    private final List<Emitter> emitters = new ArrayList();
    private long currentTime = 0;
    private long birthedTime = -1;
    private final List<_Particle> allParticles = new ArrayList();
    private final Map<Long, List<Integer>> deathRange = new HashMap();

    void addEmitter(Emitter emitter) {
        emitters.add(emitter);
    }

    void removeEmitter(Emitter emitter) {
        emitters.remove(emitter);
    }

    void removeAllEmitters() {
        emitters.clear();
    }

    void onTick(long time) {
        currentTime = time;
        birth();
    }

    private void birth() {
        if (this.birthedTime < 0 || this.birthedTime + 1000 < this.currentTime) {
            for (int emitterIndex = 0; emitterIndex < this.emitters.size(); emitterIndex++) {
                Emitter emitter = emitters.get(emitterIndex);
                for (int cellIndex = 0; cellIndex < emitter.cells.size(); cellIndex++) {
                    Cell cell = emitter.cells.get(cellIndex);
                    int cellBirthRate = (int)(emitter.birthRate * cell.birthRate);
                    for (int index = 0; index < cellBirthRate; index++) {
                        _Particle particle = new _Particle();
                        particle.texture = cell.contents;
                        particle.size = cell.contents != null ? cell.contents.getWidth() : 0.0;
                        particle.delay = Math.random() * 1000;
                        particle.maxLife =
                                (cell.lifttime +
                                        -cell.lifttimeRange / 2.0 +
                                        Math.random() * cell.lifttimeRange) *
                                        1000;
                        _RotationAdjusting adjustRotation = new _RotationAdjusting();
                        particle.position = RendererUtils.getPosition(
                                emitter,
                                adjustRotation,
                                1.0
                        );
                        double emissionLongitude =
                                cell.emissionLongitude -
                                        cell.emissionRange / 2.0 +
                                        Math.random() * cell.emissionRange;

                        if (adjustRotation.value != 0.0) {
                            emissionLongitude += adjustRotation.value;
                        }
                        double theXPositionSpeed =
                                cell.velocity -
                                        cell.velocityRange / 2.0 +
                                        Math.random() * cell.velocityRange;
                        particle.velocity = new Offset(
                                theXPositionSpeed * Math.cos(emissionLongitude),
                                theXPositionSpeed * Math.sin(emissionLongitude)
                        );
                        particle.acceleration = cell.acceleration;
                        particle.scale =
                                cell.scale -
                                        cell.scaleRange / 2 +
                                        Math.random() * cell.scaleRange;
                        particle.scaleSpeed = cell.scaleSpeed;
                        particle.alpha =
                                1.0 - cell.alphaRange / 2.0 + Math.random() * cell.alphaRange;
                        particle.alphaSpeed = cell.alphaSpeed;
                        particle.rotation = 0.0;
                        particle.rotationSpeed =
                                cell.spin - cell.spinRange / 2 + Math.random() * cell.spinRange;
                        this.addParticle(particle);
                    }
                }
            }
            this.birthedTime = this.currentTime;
        }
    }

    void render(Canvas canvas) {
        for (int index = 0; index < this.allParticles.size(); index++) {
            _Particle element = this.allParticles.get(index);
            this.renderParticleItem(element, canvas);
        }
    }

    private void renderParticleItem(_Particle particle, Canvas canvas) {
        double currentTime = this.currentTime - particle.startLife;
        Bitmap texture = particle.texture;
            if (texture == null) return;
        double startTime = particle.startLife;
        double endTime = particle.startLife + particle.maxLife;
            if (particle.repeat) {
                double nTime = this.currentTime - startTime;
                double segTime = endTime - startTime;
                currentTime = nTime - Math.floor(nTime / segTime) * segTime;
            } else if (currentTime < 0.0 || currentTime > endTime) {
                return;
            }
        double currentScale = particle.scale + particle.scaleSpeed * (currentTime / 1000.0);
        Offset currentPosition = new Offset(
            particle.position.x +
                    particle.velocity.x * (currentTime / 1000.0) +
                    0.5 *
                            particle.acceleration.x *
                            (currentTime / 1000.0) *
                            (currentTime / 1000.0),
            particle.position.y +
                    particle.velocity.y * (currentTime / 1000.0) +
                    0.5 *
                            particle.acceleration.y *
                            (currentTime / 1000.0) *
                            (currentTime / 1000.0)
        );
        double currentRotation = particle.rotation + particle.rotationSpeed * (currentTime / 1000.0);
        double currentAlpha = particle.alpha + particle.alphaSpeed * (currentTime / 1000.0);
        canvas.save();
        Matrix matrix = new Matrix();
        matrix.postTranslate(
                -(float)(particle.texture.getWidth() / 2.0),
                -(float)(particle.texture.getHeight() / 2.0)
        );
        matrix.postScale((float)Math.abs(currentScale), (float)Math.abs(currentScale));
        matrix.postRotate((float)(currentRotation * 180.0 / Math.PI));
        matrix.postTranslate((float)currentPosition.x, (float)currentPosition.y);
        matrix.postTranslate(
                (float)(particle.texture.getWidth() / 2.0),
                (float)(particle.texture.getHeight() / 2.0)
        );
        canvas.concat(matrix);
        Paint paint = new Paint();
        paint.setAlpha((int)(Math.max(0.0, Math.min(1.0, currentAlpha)) * 255.0));
        canvas.drawBitmap(
                particle.texture,
                new Rect(0, 0, particle.texture.getWidth(), particle.texture.getHeight()),
                new Rect(0, 0, particle.texture.getWidth(), particle.texture.getHeight()),
                paint
        );
        canvas.restore();
    }

    private void addParticle(_Particle particle) {
        int index = this.allParticles.size();
        List<Long> removingKeys = new ArrayList();
        Iterator deathKeys = this.deathRange.keySet().iterator();
        while (deathKeys.hasNext()) {
            long deathKey = (long) deathKeys.next();
            if (deathKey < this.currentTime) {
                if (this.deathRange.get(deathKey).size() > 0) {
                    index = this.deathRange.get(deathKey).remove(0);
                    break;
                } else {
                    removingKeys.add(deathKey);
                }
            }
        }
        Iterator<Long> removingKeysIterator = removingKeys.iterator();
        while (removingKeysIterator.hasNext()) {
            this.deathRange.remove(removingKeysIterator.next());
        }
        particle.startLife = this.currentTime + particle.delay;
        if (particle.alphaSpeed < 0.0) {
            double alphaLife = (0.0 - particle.alpha / particle.alphaSpeed) * 1000;
            particle.maxLife = Math.min(particle.maxLife, alphaLife);
        }
        if (!particle.repeat) {
            long deathRangeIndex =
                    (long)(particle.startLife +
                            particle.maxLife -
                            ((particle.startLife + particle.maxLife) % 1000) +
                            1000);
            if (!this.deathRange.containsKey(deathRangeIndex)) {
                this.deathRange.put(deathRangeIndex, new ArrayList());
            }
            this.deathRange.get(deathRangeIndex).add(index);
        }
        if (index < this.allParticles.size()) {
            this.allParticles.set(index, particle);
        }
        else {
            this.allParticles.add(particle);
        }
    }

}
