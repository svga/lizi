package com.ponycui.lizi;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.SurfaceTexture;
import android.os.Build;
import android.util.AttributeSet;
import android.view.TextureView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import java.util.concurrent.atomic.AtomicBoolean;

public class GLPlayer extends TextureView implements TextureView.SurfaceTextureListener {

    private GLRenderer renderer;
    private GLRenderer.GLThread glThread;
    private Long startTime = System.currentTimeMillis();

    public GLPlayer(@NonNull Context context) {
        super(context);
        initView();
    }

    public GLPlayer(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public GLPlayer(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public GLPlayer(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    void initView() {
        setSurfaceTextureListener(this);
        renderer = new GLRenderer();
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
        renderer.running = true;
    }

    public void stop() {
        renderer.running = false;
    }

    @Override
    public void onSurfaceTextureAvailable(@NonNull SurfaceTexture surfaceTexture, int i, int i1) {
        renderer.resize(i, i1, getResources().getDisplayMetrics().density);
        glThread = new GLRenderer.GLThread(surfaceTexture, renderer, new AtomicBoolean(true));
        glThread.start();
    }

    @Override
    public void onSurfaceTextureSizeChanged(@NonNull SurfaceTexture surfaceTexture, int i, int i1) {
        renderer.resize(i, i1, getResources().getDisplayMetrics().density);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(@NonNull SurfaceTexture surfaceTexture) {
        glThread = null;
        return true;
    }

    @Override
    public void onSurfaceTextureUpdated(@NonNull SurfaceTexture surfaceTexture) {

    }
}
