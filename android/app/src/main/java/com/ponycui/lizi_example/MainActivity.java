package com.ponycui.lizi_example;

import androidx.appcompat.app.AppCompatActivity;

import android.animation.ValueAnimator;
import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;

import com.ponycui.lizi.CanvasPlayer;
import com.ponycui.lizi.Cell;
import com.ponycui.lizi.Emitter;
import com.ponycui.lizi.EmitterMode;
import com.ponycui.lizi.EmitterShape;
import com.ponycui.lizi.GLPlayer;
import com.ponycui.lizi.Offset;
import com.ponycui.lizi.Size;

import java.io.IOException;
import java.io.InputStream;

public class MainActivity extends AppCompatActivity {

    CanvasPlayer view;
    GLPlayer view2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
//        view = new CanvasPlayer(this);
//        view.setBackgroundColor(Color.BLACK);
//        setupEmitter();
//        view.start();
//        setContentView(view);
        view2 = new GLPlayer(this);
        setupEmitter();
        view2.start();
        setContentView(view2);
    }

    void setupEmitter() {
        Emitter emitter = new Emitter();
        emitter.emitterPosition = new Offset(150, 200);
        emitter.emitterSize = new Size(150, 150);
        emitter.emitterShape = EmitterShape.circle;
        emitter.emitterMode = EmitterMode.outline;
        emitter.birthRate = 2;
        Cell cell = new Cell("123");
        cell.contents = getBitmapFromAsset(this, "icon_round.png");
        cell.birthRate = 100;
        cell.lifttime = 5;
        cell.lifttimeRange = 0.5;
        cell.velocity = 200;
        cell.velocityRange = 80;
        cell.alphaSpeed = -0.5;
        cell.alphaRange = 0.5;
        cell.acceleration = new Offset(88.0, 200.0);
        cell.scale = 0.5;
        cell.scaleSpeed = 0.6;
        cell.scaleRange = 2.0;
        cell.emissionLongitude = Math.PI * 1.5;
        cell.emissionRange = Math.PI * 0.1;
        cell.spin = Math.PI * 3;
        cell.spinRange = Math.PI;
        emitter.cells.add(cell);
        Cell cell2 = new Cell("123s");
        cell2.contents = getBitmapFromAsset(this, "logo.png");
        cell2.birthRate = 10;
        cell2.lifttime = 5;
        cell2.lifttimeRange = 0.5;
        cell2.velocity = 200;
        cell2.velocityRange = 80;
        cell2.alphaSpeed = -0.5;
        cell2.alphaRange = 0.5;
        cell2.acceleration = new Offset(88.0, 200.0);
        cell2.scale = 0.5;
        cell2.scaleSpeed = 0.6;
        cell2.scaleRange = 2.0;
        cell2.emissionLongitude = Math.PI * 1.5;
        cell2.emissionRange = Math.PI * 0.1;
        cell2.spin = Math.PI * 3;
        cell2.spinRange = Math.PI;
        emitter.cells.add(cell2);
        view2.addEmitter(emitter);
    }

    public static Bitmap getBitmapFromAsset(Context context, String filePath) {
        AssetManager assetManager = context.getAssets();
        InputStream is;
        Bitmap bitmap = null;
        try {
            is = assetManager.open(filePath);
            bitmap = BitmapFactory.decodeStream(is);
            is.close();
        } catch (IOException e) {
            // handle exception
        }
        return bitmap;
    }

}