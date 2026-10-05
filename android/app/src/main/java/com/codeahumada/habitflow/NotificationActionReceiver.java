package com.codeahumada.habitflow;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.widget.Toast;

/**
 * Receptor de difusión (BroadcastReceiver) para acciones de notificaciones de HabitFlow.
 * Code Ahumada • Director General Atlas
 * 
 * Se ejecuta en segundo plano cuando el usuario pulsa:
 * - "💧 Tomé el Agua" (+250ml)
 * - "⏰ Posponer 10 Min"
 * 
 * CRUCIAL: Este componente NO es una Activity y NO invoca startActivity.
 * Por lo tanto, el usuario NUNCA es expulsado de su pantalla actual ni se le abre la app.
 */
public class NotificationActionReceiver extends BroadcastReceiver {

    private static final String TAG = "HabitFlowActionReceiver";
    public static final String ACTION_NOTIFICATION = "com.codeahumada.habitflow.NOTIFICATION_ACTION";
    public static final String EXTRA_NOTIFICATION_ID = "LocalNotificationManager.NOTIFICATION_INTENT_KEY";
    public static final String EXTRA_ACTION_ID = "LocalNotificationManager.ACTION_INTENT_KEY";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        int notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1);
        String actionId = intent.getStringExtra(EXTRA_ACTION_ID);

        Log.d(TAG, "Acción recibida en segundo plano: " + actionId + " (id: " + notificationId + ")");

        // 1. Cancelar y descartar la notificación de la barra de estado inmediatamente
        try {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && notificationId != -1) {
                nm.cancel(notificationId);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error al cancelar notificación: " + e.getMessage());
        }

        if (actionId == null) return;

        if ("drank_water".equals(actionId)) {
            handleDrankWater(context);
        } else if ("snooze_10".equals(actionId)) {
            handleSnooze(context);
        }
    }

    private void handleDrankWater(Context context) {
        // 1. Persistir +250ml en SharedPreferences nativo
        try {
            SharedPreferences prefs = context.getSharedPreferences(NativeWaterSyncPlugin.PREFS_NAME, Context.MODE_PRIVATE);
            int currentMl = prefs.getInt(NativeWaterSyncPlugin.KEY_PENDING_ML, 0);
            int currentCount = prefs.getInt(NativeWaterSyncPlugin.KEY_PENDING_COUNT, 0);

            prefs.edit()
                    .putInt(NativeWaterSyncPlugin.KEY_PENDING_ML, currentMl + 250)
                    .putInt(NativeWaterSyncPlugin.KEY_PENDING_COUNT, currentCount + 1)
                    .putLong(NativeWaterSyncPlugin.KEY_LAST_TIMESTAMP, System.currentTimeMillis())
                    .apply();

            Log.d(TAG, "Guardados +250ml en SharedPreferences. Total pendiente: " + (currentMl + 250) + "ml");
        } catch (Exception e) {
            Log.e(TAG, "Error guardando en SharedPreferences: " + e.getMessage());
        }

        // 2. Feedback háptico sutil (vibración corta)
        try {
            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(100);
                }
            }
        } catch (Exception ignored) {}

        // 3. Feedback visual instantáneo mediante Toast nativo de Android
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Toast.makeText(context.getApplicationContext(), "💧 ¡+250 ml de agua registrados!", Toast.LENGTH_SHORT).show();
            } catch (Exception ignored) {}
        });

        // 4. Si la app está abierta en primer plano, avisar al plugin para actualizar UI en vivo
        NativeWaterSyncPlugin.notifyWaterAdded(250);
    }

    private void handleSnooze(Context context) {
        // 1. Toast de aviso
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Toast.makeText(context.getApplicationContext(), "⏰ Recordatorio pospuesto 10 minutos", Toast.LENGTH_SHORT).show();
            } catch (Exception ignored) {}
        });

        // 2. Programar alarma exacta para dentro de 10 minutos
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                Intent snoozeIntent = new Intent(context, SnoozeAlarmReceiver.class);
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    flags |= PendingIntent.FLAG_MUTABLE;
                }
                PendingIntent pi = PendingIntent.getBroadcast(context, 77771, snoozeIntent, flags);
                long triggerAtMillis = System.currentTimeMillis() + (10 * 60 * 1000);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
                }
                Log.d(TAG, "Alarma de snooze programada para dentro de 10 minutos.");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error programando snooze: " + e.getMessage());
        }
    }
}
