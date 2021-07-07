package com.ponycui.lizi;

import android.graphics.Bitmap;
import android.graphics.SurfaceTexture;
import android.opengl.GLES20;
import android.opengl.GLUtils;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.microedition.khronos.egl.EGL10;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.egl.EGLContext;
import javax.microedition.khronos.egl.EGLDisplay;
import javax.microedition.khronos.egl.EGLSurface;
import javax.microedition.khronos.opengles.GL;

import static android.opengl.EGL14.EGL_CONTEXT_CLIENT_VERSION;
import static android.opengl.EGL14.EGL_OPENGL_ES2_BIT;

public class GLRenderer {

    // GLs
    private int width = 0;
    private int height = 0;
    private double scale = 1.0;
    private int program = -1;
    private int lifeAttributeLocation = 0;
    private int positionAttributeLocation = 1;
    private int texCoordAttributeLocation = 2;
    private int speedAttributeLocation = 3;
    private int alphaAttributeLocation = 4;
    private int scaleAttributeLocation = 5;
    private int rotationAttributeLocation = 6;
    private int resolutionUniformLocation = -1;
    private int timeUniformLocation = -1;
    private int textureUniformLocation = -1;
    private Map<Integer, Integer> bufferIds = new HashMap();
    private List<Integer> activeTextures = new ArrayList();
    private Map<Integer, Integer> activeTexturesCache = new HashMap();

    // Particles
    boolean running = false;
    private final List<Emitter> emitters = new ArrayList();
    private Long startTime = System.currentTimeMillis();
    private long currentTime = 0;
    private long birthedTime = -1;
    private LayerModel layerModel = new LayerModel();

    void resize(int width, int height, double scale) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        if (this.program >= 0 && this.resolutionUniformLocation >= 0) {
            GLES20.glUseProgram(this.program);
            GLES20.glUniform2f(this.resolutionUniformLocation, width, height);
        }
    }

    void initGL() {
        compileProgram();
    }

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
        currentTime = time - startTime;
        birth();
    }

    private void birth() {
        if (this.birthedTime < 0 || this.birthedTime + 1000 < this.currentTime) {
            for (int emitterIndex = 0; emitterIndex < this.emitters.size(); emitterIndex++) {
                Emitter emitter = emitters.get(emitterIndex);
                for (int cellIndex = 0; cellIndex < emitter.cells.size(); cellIndex++) {
                    Cell cell = emitter.cells.get(cellIndex);
                    if (cell.contents == null) continue;
                    int cellBirthRate = (int)(emitter.birthRate * cell.birthRate);
                    for (int index = 0; index < cellBirthRate; index++) {
                        _Particle particle = new _Particle();
                        particle.texture = cell.contents;
                        particle.textureId = this.activeTexturesCache.containsKey(cell.contents.hashCode()) ? this.activeTexturesCache.get(cell.contents.hashCode()) : this.createTexture(cell.contents);
                        particle.size = (cell.contents != null ? cell.contents.getWidth() : 0.0);
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
                                scale
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
                        layerModel.addParticle(particle, currentTime);
                    }
                }
            }
            this.birthedTime = this.currentTime;
        }
    }

    void drawFrame() {
        GLES20.glViewport(0, 0, width, height);
        GLES20.glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT);
        GLES20.glUseProgram(this.program);
        if (this.layerModel.dirtied) {
            bindFloatBuffer(layerModel.life, 3, this.lifeAttributeLocation);
            bindFloatBuffer(layerModel.position, 4, this.positionAttributeLocation);
            bindFloatBuffer(layerModel.texCoord, 2, this.texCoordAttributeLocation);
            bindFloatBuffer(layerModel.speed, 4, this.speedAttributeLocation);
            bindFloatBuffer(layerModel.alpha, 3, this.alphaAttributeLocation);
            bindFloatBuffer(layerModel.scale, 2, this.scaleAttributeLocation);
            bindFloatBuffer(layerModel.rotation, 2, this.rotationAttributeLocation);
            this.layerModel.dirtied = false;
            this.layerModel.dirtyIndexes.clear();
        }
        GLES20.glUniform1f(this.timeUniformLocation, this.currentTime);
        GLES20.glDisable(GLES20.GL_DEPTH_TEST);
        GLES20.glEnable(GLES20.GL_BLEND);
        GLES20.glBlendFunc(GLES20.GL_SRC_ALPHA, GLES20.GL_ONE_MINUS_SRC_ALPHA);
        GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, this.layerModel.allParticles.size() * 6);
    }

    void bindFloatBuffer(FloatBuffer data, int count, int location) {
        int[] bufferHandle = new int[1];
        boolean binded = false;
        if (this.bufferIds.containsKey(location)) {
            bufferHandle[0] = this.bufferIds.get(location);
            binded = true;
        }
        else {
            GLES20.glGenBuffers(bufferHandle.length, bufferHandle, 0);
            this.bufferIds.put(location, bufferHandle[0]);
        }
        int vboId = bufferHandle[0];
        GLES20.glBindBuffer(GLES20.GL_ARRAY_BUFFER, vboId);
        data.position(0);
        GLES20.glBufferData(GLES20.GL_ARRAY_BUFFER, data.limit(), data, GLES20.GL_DYNAMIC_DRAW);
        if (!binded) {
            GLES20.glEnableVertexAttribArray(location);
            GLES20.glVertexAttribPointer(location, count, GLES20.GL_FLOAT, false, 0, 0);
        }
    }

    int createTexture(Bitmap bitmap) {
        int textureIndex = this.activeTextures.size();
        int[] textureHandle = new int[1];
        GLES20.glGenTextures(textureHandle.length, textureHandle, 0);
        int textureId = textureHandle[0];
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0 + textureIndex);
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureId);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_NEAREST);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
        GLES20.glTexParameterf(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
        GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bitmap, 0);
        this.activeTextures.add(textureIndex);
        this.activeTexturesCache.put(bitmap.hashCode(), textureIndex);
        int[] intBuffer = new int[this.activeTextures.size()];
        for (int i = 0; i < this.activeTextures.size(); i++) {
            intBuffer[i] = this.activeTextures.get(i);
        }
        GLES20.glUseProgram(this.program);
        GLES20.glUniform1iv(this.textureUniformLocation, this.activeTextures.size(), intBuffer, 0);
        return textureIndex;
    }

    int loadShader(int shaderType, String shaderSource) {
        int shader;
        int[] compiled = new int[1];
        shader = GLES20.glCreateShader(shaderType);
        if (shader == 0)
            return 0;
        GLES20.glShaderSource(shader, shaderSource);
        GLES20.glCompileShader(shader);
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compiled, 0);
        if (compiled[0] == 0) {
            GLES20.glDeleteShader(shader);
            return 0;
        }
        return shader;
    }

    void compileProgram() {
        String vs = "attribute vec3 a_life;\n" +
                "attribute vec4 a_position;\n" +
                "attribute vec2 a_texCoord;\n" +
                "attribute vec4 a_speed;\n" +
                "attribute vec3 a_alpha;\n" +
                "attribute vec2 a_scale;\n" +
                "attribute vec2 a_rotation;\n" +
                "uniform vec2 u_resolution;\n" +
                "uniform float u_time;\n" +
                "varying float v_alpha;\n" +
                "varying float v_textureId;\n" +
                "varying vec2 v_texCoord;\n" +
                "void main() { \n" +
                "   float currentTime = u_time - a_life.x;\n" +
                "   if (a_life.z > 0.0) {\n" +
                "       float nTime = u_time - a_life.x;\n" +
                "       float segTime = a_life.y - a_life.x;\n" +
                "       currentTime = nTime - floor(nTime / segTime) * segTime;\n" +
                "   }\n" +
                "   else if (currentTime < 0.0 || currentTime > a_life.y) {\n" +
                "       gl_Position = vec4(0.0, 0.0, 0.0, 0.0);\n" +
                "       return;\n" +
                "   }\n" +
                "   vec2 currentScale = vec2(a_scale.x + a_scale.y * (currentTime / 1000.0), a_scale.x + a_scale.y * (currentTime / 1000.0));\n" +
                "   vec2 currentSpeed = a_speed.xy + a_speed.zw * (currentTime / 1000.0);\n" +
                "   float currentRotation = a_rotation.x + a_rotation.y * (currentTime / 1000.0);\n" +
                "   float currentAlpha = a_alpha.x + a_alpha.y * (currentTime / 1000.0);\n" +
                "   vec2 rotatedPosition = vec2(\n" +
                "      cos(currentRotation) * a_position.x - sin(currentRotation) * a_position.y,\n" +
                "      sin(currentRotation) * a_position.x + cos(currentRotation) * a_position.y);\n" +
                "   vec2 scaledPosition = rotatedPosition * currentScale;\n" +
                "   vec2 finalPositioned = scaledPosition + vec2(a_position.zw) + currentSpeed * (currentTime / 1000.0);\n" +
                "   vec2 zeroToOne = finalPositioned.xy / u_resolution; \n" +
                "   vec2 zeroToTwo = zeroToOne * 2.0; \n" +
                "   vec2 clipSpace = zeroToTwo - 1.0; \n"+
                "   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1); \n" +
                "   v_alpha = currentAlpha; \n" +
                "   v_textureId = a_alpha.z; \n" +
                "   v_texCoord = a_texCoord; \n" +
                "} \n";
        int vsShader = loadShader(GLES20.GL_VERTEX_SHADER, vs);
        String fs = "precision mediump float;\n" +
                "varying float v_alpha;\n" +
                "varying float v_textureId;\n" +
                "varying vec2 v_texCoord;\n" +
                "uniform sampler2D u_textures[16];\n" +
                "void main() {\n" +
                "  int textureId = int(v_textureId);\n" +
                "  if (textureId == 0) { gl_FragColor = texture2D(u_textures[0], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 1) { gl_FragColor = texture2D(u_textures[1], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 2) { gl_FragColor = texture2D(u_textures[2], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 3) { gl_FragColor = texture2D(u_textures[3], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 4) { gl_FragColor = texture2D(u_textures[4], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 5) { gl_FragColor = texture2D(u_textures[5], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 6) { gl_FragColor = texture2D(u_textures[6], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 7) { gl_FragColor = texture2D(u_textures[7], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 8) { gl_FragColor = texture2D(u_textures[8], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 9) { gl_FragColor = texture2D(u_textures[9], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 10) { gl_FragColor = texture2D(u_textures[10], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 11) { gl_FragColor = texture2D(u_textures[11], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 12) { gl_FragColor = texture2D(u_textures[12], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 13) { gl_FragColor = texture2D(u_textures[13], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 14) { gl_FragColor = texture2D(u_textures[14], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else if (textureId == 15) { gl_FragColor = texture2D(u_textures[15], v_texCoord) * vec4(1.0, 1.0, 1.0, v_alpha); }\n" +
                "  else { gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0); }\n" +
                "} \n";
        int fsShader = loadShader(GLES20.GL_FRAGMENT_SHADER, fs);
        int program = GLES20.glCreateProgram();
        if (program == 0) {
            return;
        }
        GLES20.glAttachShader(program, vsShader);
        GLES20.glAttachShader(program, fsShader);
        GLES20.glBindAttribLocation(program, this.lifeAttributeLocation, "a_life");
        GLES20.glBindAttribLocation(program, this.positionAttributeLocation, "a_position");
        GLES20.glBindAttribLocation(program, this.texCoordAttributeLocation, "a_texCoord");
        GLES20.glBindAttribLocation(program, this.speedAttributeLocation, "a_speed");
        GLES20.glBindAttribLocation(program, this.alphaAttributeLocation, "a_alpha");
        GLES20.glBindAttribLocation(program, this.scaleAttributeLocation, "a_scale");
        GLES20.glBindAttribLocation(program, this.rotationAttributeLocation, "a_rotation");
        GLES20.glLinkProgram(program);
        int[] linked = new int[1];
        GLES20.glGetProgramiv(program, GLES20.GL_LINK_STATUS, linked, 0);
        if (linked[0] == 0) {
            GLES20.glDeleteProgram(program);
            return  ;
        }
        GLES20.glUseProgram(program);
        this.resolutionUniformLocation = GLES20.glGetUniformLocation(program, "u_resolution");
        GLES20.glUniform2f(this.resolutionUniformLocation, width, height);
        this.timeUniformLocation = GLES20.glGetUniformLocation(program, "u_time");
        this.textureUniformLocation = GLES20.glGetUniformLocation(program, "u_textures");
        this.program = program;
    }

    static class GLThread extends Thread {

        private AtomicBoolean mShouldRender;
        private SurfaceTexture mSurfaceTexture;
        private GLRenderer mRenderer;

        private EGL10 mEgl;
        private EGLDisplay mEglDisplay = EGL10.EGL_NO_DISPLAY;
        private EGLContext mEglContext = EGL10.EGL_NO_CONTEXT;
        private EGLSurface mEglSurface = EGL10.EGL_NO_SURFACE;
        private GL mGL;

        public GLThread(SurfaceTexture surfaceTexture, GLRenderer renderer, AtomicBoolean shouldRender)
        {
            mSurfaceTexture = surfaceTexture;
            mRenderer = renderer;
            mShouldRender = shouldRender;
        }

        @Override
        public void run() {
            initGL();
            if (mRenderer != null && mRenderer.program < 0) {
                mRenderer.initGL();
            }
            while (mShouldRender != null && mShouldRender.get() != false) {
                int nextFrameTime = 16;
                if (mRenderer != null && mRenderer.running) {
                    long frameCost = System.currentTimeMillis();
                    mRenderer.onTick(System.currentTimeMillis());
                    mRenderer.drawFrame();
                    frameCost = System.currentTimeMillis() - frameCost;
                    if (frameCost > 12) {
                        System.out.println(frameCost);
                    }
                    nextFrameTime = 16 - Math.max(16, (int)frameCost);
                }
                mEgl.eglSwapBuffers(mEglDisplay, mEglSurface);
                try {
                    if (nextFrameTime > 0) {
                        sleep(nextFrameTime);
                    }
                } catch(InterruptedException e) { }
            }
            destroyGL();
        }

        private void initGL() {
            mEgl = (EGL10)EGLContext.getEGL();

            mEglDisplay = mEgl.eglGetDisplay(EGL10.EGL_DEFAULT_DISPLAY);
            if (mEglDisplay == EGL10.EGL_NO_DISPLAY) {
                throw new RuntimeException("eglGetdisplay failed : " +
                        GLUtils.getEGLErrorString(mEgl.eglGetError()));
            }

            int[] version = new int[2];
            if (!mEgl.eglInitialize(mEglDisplay, version)) {
                throw new RuntimeException("eglInitialize failed : " +
                        GLUtils.getEGLErrorString(mEgl.eglGetError()));
            }

            int[] configAttribs = {
                    EGL10.EGL_BUFFER_SIZE, 32,
                    EGL10.EGL_ALPHA_SIZE, 8,
                    EGL10.EGL_BLUE_SIZE, 8,
                    EGL10.EGL_GREEN_SIZE, 8,
                    EGL10.EGL_RED_SIZE, 8,
                    EGL10.EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
                    EGL10.EGL_SURFACE_TYPE, EGL10.EGL_WINDOW_BIT,
                    EGL10.EGL_NONE
            };

            int[] numConfigs = new int[1];
            EGLConfig[] configs = new EGLConfig[1];
            if (!mEgl.eglChooseConfig(mEglDisplay, configAttribs, configs, 1, numConfigs)) {
                throw new RuntimeException("eglChooseConfig failed : " +
                        GLUtils.getEGLErrorString(mEgl.eglGetError()));
            }

            int[] contextAttribs = {
                    EGL_CONTEXT_CLIENT_VERSION, 2,
                    EGL10.EGL_NONE
            };
            mEglContext = mEgl.eglCreateContext(mEglDisplay, configs[0], EGL10.EGL_NO_CONTEXT, contextAttribs);
            mEglSurface = mEgl.eglCreateWindowSurface(mEglDisplay, configs[0], mSurfaceTexture, null);
            if (mEglSurface == EGL10.EGL_NO_SURFACE || mEglContext == EGL10.EGL_NO_CONTEXT) {
                int error = mEgl.eglGetError();
                if (error == EGL10.EGL_BAD_NATIVE_WINDOW) {
                    throw new RuntimeException("eglCreateWindowSurface returned  EGL_BAD_NATIVE_WINDOW. " );
                }
                throw new RuntimeException("eglCreateWindowSurface failed : " +
                        GLUtils.getEGLErrorString(mEgl.eglGetError()));
            }

            if (!mEgl.eglMakeCurrent(mEglDisplay, mEglSurface, mEglSurface, mEglContext)) {
                throw new RuntimeException("eglMakeCurrent failed : " +
                        GLUtils.getEGLErrorString(mEgl.eglGetError()));
            }

            mGL = mEglContext.getGL();
        }

        private void destroyGL()
        {
            mEgl.eglDestroyContext(mEglDisplay, mEglContext);
            mEgl.eglDestroySurface(mEglDisplay, mEglSurface);
            mEglContext = EGL10.EGL_NO_CONTEXT;
            mEglSurface = EGL10.EGL_NO_SURFACE;
        }
    }

    static class LayerModel {
        private final List<_Particle> allParticles = new ArrayList();
        private FloatBuffer life = FloatBuffer.allocate(0);
        private FloatBuffer position = FloatBuffer.allocate(0);
        private FloatBuffer speed = FloatBuffer.allocate(0);
        private FloatBuffer alpha = FloatBuffer.allocate(0);
        private FloatBuffer scale = FloatBuffer.allocate(0);
        private FloatBuffer rotation = FloatBuffer.allocate(0);
        private FloatBuffer texCoord = FloatBuffer.allocate(0);
        private final Map<Long, List<Integer>> deathRange = new HashMap();
        boolean dirtied = true;
        final List<Integer> dirtyIndexes = new ArrayList();

        void addParticle(_Particle particle, long currentTime) {
            this.dirtied = true;
            boolean needPush = true;
            int index = this.allParticles.size();
            List<Long> removingKeys = new ArrayList();
            Iterator deathKeys = this.deathRange.keySet().iterator();
            while (deathKeys.hasNext()) {
                long deathKey = (long) deathKeys.next();
                if (deathKey < currentTime) {
                    if (this.deathRange.get(deathKey).size() > 0) {
                        index = this.deathRange.get(deathKey).remove(0);
                        this.dirtyIndexes.add(index);
                        needPush = false;
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
            if (needPush) {
                this.dirtyIndexes.clear();
            }
            particle.startLife = currentTime + particle.delay;
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
            if (needPush && this.life.limit() < this.allParticles.size() * 18 * 4) {
                FloatBuffer newLifeBuffer = FloatBuffer.allocate(Math.max(200, this.allParticles.size()) * 18 * 4 * 2);
                newLifeBuffer.put(this.life.array());
                newLifeBuffer.position(0);
                this.life = newLifeBuffer;
            }
            {
                this.life.position(index * 18);
                this.life.put((float)particle.startLife);
                this.life.put((float) (particle.startLife + particle.maxLife));
                this.life.put((particle.repeat ? 1f : 0f));
                this.life.put((float)particle.startLife);
                this.life.put((float) (particle.startLife + particle.maxLife));
                this.life.put((particle.repeat ? 1f : 0f));
                this.life.put((float)particle.startLife);
                this.life.put((float) (particle.startLife + particle.maxLife));
                this.life.put((particle.repeat ? 1f : 0f));
                this.life.put((float)particle.startLife);
                this.life.put((float) (particle.startLife + particle.maxLife));
                this.life.put((particle.repeat ? 1f : 0f));
                this.life.put((float)particle.startLife);
                this.life.put((float) (particle.startLife + particle.maxLife));
                this.life.put((particle.repeat ? 1f : 0f));
                this.life.put((float)particle.startLife);
                this.life.put((float) (particle.startLife + particle.maxLife));
                this.life.put((particle.repeat ? 1f : 0f));
            }
            if (needPush && this.position.limit() < this.allParticles.size() * 24 * 4) {
                FloatBuffer newPositionBuffer = FloatBuffer.allocate(Math.max(200, this.allParticles.size()) * 24 * 4 * 2);
                newPositionBuffer.put(this.position.array());
                newPositionBuffer.position(0);
                this.position = newPositionBuffer;
            }
            {
                this.position.position(index * 24);
                this.position.put((float) (-particle.size / 2.0));
                this.position.put((float) (-particle.size / 2.0));
                this.position.put((float) (particle.position.x));
                this.position.put((float) (particle.position.y));
                this.position.put((float) (particle.size / 2.0));
                this.position.put((float) (-particle.size / 2.0));
                this.position.put((float) (particle.position.x));
                this.position.put((float) (particle.position.y));
                this.position.put((float) (particle.size / 2.0));
                this.position.put((float) (particle.size / 2.0));
                this.position.put((float) (particle.position.x));
                this.position.put((float) (particle.position.y));
                this.position.put((float) (-particle.size / 2.0));
                this.position.put((float) (-particle.size / 2.0));
                this.position.put((float) (particle.position.x));
                this.position.put((float) (particle.position.y));
                this.position.put((float) (particle.size / 2.0));
                this.position.put((float) (particle.size / 2.0));
                this.position.put((float) (particle.position.x));
                this.position.put((float) (particle.position.y));
                this.position.put((float) (-particle.size / 2.0));
                this.position.put((float) (particle.size / 2.0));
                this.position.put((float) (particle.position.x));
                this.position.put((float) (particle.position.y));
            }
            if (needPush && this.texCoord.limit() < this.allParticles.size() * 12 * 4) {
                FloatBuffer newTexCoordBuffer = FloatBuffer.allocate(Math.max(200, this.allParticles.size()) * 12 * 4 * 2);
                newTexCoordBuffer.put(this.texCoord.array());
                newTexCoordBuffer.position(0);
                this.texCoord = newTexCoordBuffer;
            }
            {
                this.texCoord.position(index * 12);
                this.texCoord.put(0f);
                this.texCoord.put(0f);
                this.texCoord.put(1f);
                this.texCoord.put(0f);
                this.texCoord.put(1f);
                this.texCoord.put(1f);
                this.texCoord.put(0f);
                this.texCoord.put(0f);
                this.texCoord.put(1f);
                this.texCoord.put(1f);
                this.texCoord.put(0f);
                this.texCoord.put(1f);
            }
            if (needPush && this.speed.limit() < this.allParticles.size() * 24 * 4) {
                FloatBuffer newSpeedBuffer = FloatBuffer.allocate(Math.max(200, this.allParticles.size()) * 24 * 4 * 2);
                newSpeedBuffer.put(this.speed.array());
                newSpeedBuffer.position(0);
                this.speed = newSpeedBuffer;
            }
            {
                this.speed.position(index * 24);
                this.speed.put((float) (particle.velocity.x));
                this.speed.put((float) (particle.velocity.y));
                this.speed.put((float) (particle.acceleration.x));
                this.speed.put((float) (particle.acceleration.y));
                this.speed.put((float) (particle.velocity.x));
                this.speed.put((float) (particle.velocity.y));
                this.speed.put((float) (particle.acceleration.x));
                this.speed.put((float) (particle.acceleration.y));
                this.speed.put((float) (particle.velocity.x));
                this.speed.put((float) (particle.velocity.y));
                this.speed.put((float) (particle.acceleration.x));
                this.speed.put((float) (particle.acceleration.y));
                this.speed.put((float) (particle.velocity.x));
                this.speed.put((float) (particle.velocity.y));
                this.speed.put((float) (particle.acceleration.x));
                this.speed.put((float) (particle.acceleration.y));
                this.speed.put((float) (particle.velocity.x));
                this.speed.put((float) (particle.velocity.y));
                this.speed.put((float) (particle.acceleration.x));
                this.speed.put((float) (particle.acceleration.y));
                this.speed.put((float) (particle.velocity.x));
                this.speed.put((float) (particle.velocity.y));
                this.speed.put((float) (particle.acceleration.x));
                this.speed.put((float) (particle.acceleration.y));
            }
            if (needPush && this.alpha.limit() < this.allParticles.size() * 18 * 4) {
                FloatBuffer newAlphaBuffer = FloatBuffer.allocate(Math.max(200, this.allParticles.size()) * 18 * 4 * 2);
                newAlphaBuffer.put(this.alpha.array());
                newAlphaBuffer.position(0);
                this.alpha = newAlphaBuffer;
            }
            {
                this.alpha.position(index * 18);
                this.alpha.put((float) (particle.alpha));
                this.alpha.put((float) (particle.alphaSpeed));
                this.alpha.put((float) (particle.textureId) + 0.1f);
                this.alpha.put((float) (particle.alpha));
                this.alpha.put((float) (particle.alphaSpeed));
                this.alpha.put((float) (particle.textureId) + 0.1f);
                this.alpha.put((float) (particle.alpha));
                this.alpha.put((float) (particle.alphaSpeed));
                this.alpha.put((float) (particle.textureId) + 0.1f);
                this.alpha.put((float) (particle.alpha));
                this.alpha.put((float) (particle.alphaSpeed));
                this.alpha.put((float) (particle.textureId) + 0.1f);
                this.alpha.put((float) (particle.alpha));
                this.alpha.put((float) (particle.alphaSpeed));
                this.alpha.put((float) (particle.textureId) + 0.1f);
                this.alpha.put((float) (particle.alpha));
                this.alpha.put((float) (particle.alphaSpeed));
                this.alpha.put((float) (particle.textureId) + 0.1f);
            }
            if (needPush && this.scale.limit() < this.allParticles.size() * 12 * 4) {
                FloatBuffer newScaleBuffer = FloatBuffer.allocate(Math.max(200, this.allParticles.size()) * 12 * 4 * 2);
                newScaleBuffer.put(this.scale.array());
                newScaleBuffer.position(0);
                this.scale = newScaleBuffer;
            }
            {
                this.scale.position(index * 12);
                this.scale.put((float) (particle.scale));
                this.scale.put((float) (particle.scaleSpeed));
                this.scale.put((float) (particle.scale));
                this.scale.put((float) (particle.scaleSpeed));
                this.scale.put((float) (particle.scale));
                this.scale.put((float) (particle.scaleSpeed));
                this.scale.put((float) (particle.scale));
                this.scale.put((float) (particle.scaleSpeed));
                this.scale.put((float) (particle.scale));
                this.scale.put((float) (particle.scaleSpeed));
                this.scale.put((float) (particle.scale));
                this.scale.put((float) (particle.scaleSpeed));
            }
            if (needPush && this.rotation.limit() < this.allParticles.size() * 12 * 4) {
                FloatBuffer newRotationBuffer = FloatBuffer.allocate(Math.max(200, this.allParticles.size()) * 12 * 4 * 2);
                newRotationBuffer.put(this.rotation.array());
                newRotationBuffer.position(0);
                this.rotation = newRotationBuffer;
            }
            {
                this.rotation.position(index * 12);
                this.rotation.put((float) (particle.rotation));
                this.rotation.put((float) (particle.rotationSpeed));
                this.rotation.put((float) (particle.rotation));
                this.rotation.put((float) (particle.rotationSpeed));
                this.rotation.put((float) (particle.rotation));
                this.rotation.put((float) (particle.rotationSpeed));
                this.rotation.put((float) (particle.rotation));
                this.rotation.put((float) (particle.rotationSpeed));
                this.rotation.put((float) (particle.rotation));
                this.rotation.put((float) (particle.rotationSpeed));
                this.rotation.put((float) (particle.rotation));
                this.rotation.put((float) (particle.rotationSpeed));
            }
        }
    }

}
