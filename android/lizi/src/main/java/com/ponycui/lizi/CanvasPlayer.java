package com.ponycui.lizi;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Canvas;
import android.os.Build;
import android.util.AttributeSet;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

public class CanvasPlayer extends View {

    private CanvasRenderer renderer = new CanvasRenderer();
    private ValueAnimator valueAnimator;

    public CanvasPlayer(Context context) {
        super(context);
    }

    public CanvasPlayer(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public CanvasPlayer(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public CanvasPlayer(Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    public void addEmitter(Emitter emitter) {
        renderer.addEmitter(emitter);
    }

    public void removeEmitter(Emitter emitter) {
        renderer.removeEmitter(emitter);
    }

    public void removeAllEmitters() {
        renderer.removeAllEmitters();
    }

    public void start() {
        valueAnimator = ValueAnimator.ofInt(0, 1000);
        valueAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator valueAnimator) {
                long curTime = System.currentTimeMillis();
                renderer.onTick(curTime);
                invalidate();
            }
        });
        valueAnimator.setDuration(99999999);
        valueAnimator.start();
    }

    public void stop() {
        if (valueAnimator != null) {
            valueAnimator.cancel();
            valueAnimator.removeAllUpdateListeners();
            valueAnimator = null;
        }
    }

    @Override
    public void draw(Canvas canvas) {
        super.draw(canvas);
        canvas.save();
        canvas.scale(getResources().getDisplayMetrics().density, getResources().getDisplayMetrics().density);
        renderer.render(canvas);
        canvas.restore();
    }
}
