package com.codeahumada.habitflow;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import androidx.core.app.NotificationCompat;

/**
 * Receptor de alarma cuando expiran los 10 minutos de posponer ("Posponer 10 Min").
 * Genera el recordatorio con los botones silenciosos sin abrir la app.
 * Code Ahumada • Director General Atlas
 */
public class SnoozeAlarmReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID = "habitflow_reminders_channel";
    public static final int SNOOZE_NOTIFICATION_ID = 88882;

    @Override
    public void onReceive(Context context, Intent intent) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        // Crear canal si aún no existe
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Recordatorios de Hidratación HabitFlow",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alarmas periódicas para tomar agua y mantener tu bienestar");
            channel.enableVibration(true);
            nm.createNotificationChannel(channel);
        }

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            flags |= PendingIntent.FLAG_MUTABLE;
        }

        // 1. Intent al tocar el cuerpo de la notificación (abre la app)
        Intent openAppIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (openAppIntent == null) {
            openAppIntent = new Intent(context, MainActivity.class);
        }
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentPendingIntent = PendingIntent.getActivity(context, 88883, openAppIntent, flags);

        // 2. Acción: Tomé el Agua (en segundo plano, NO abre la app)
        Intent drankIntent = new Intent(NotificationActionReceiver.ACTION_NOTIFICATION);
        drankIntent.setPackage(context.getPackageName());
        drankIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, SNOOZE_NOTIFICATION_ID);
        drankIntent.putExtra(NotificationActionReceiver.EXTRA_ACTION_ID, "drank_water");
        PendingIntent drankPendingIntent = PendingIntent.getBroadcast(context, 88884, drankIntent, flags);

        // 3. Acción: Posponer 10 Min (en segundo plano, NO abre la app)
        Intent snoozeAgainIntent = new Intent(NotificationActionReceiver.ACTION_NOTIFICATION);
        snoozeAgainIntent.setPackage(context.getPackageName());
        snoozeAgainIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, SNOOZE_NOTIFICATION_ID);
        snoozeAgainIntent.putExtra(NotificationActionReceiver.EXTRA_ACTION_ID, "snooze_10");
        PendingIntent snoozeAgainPendingIntent = PendingIntent.getBroadcast(context, 88885, snoozeAgainIntent, flags);

        // Icono pequeño
        int smallIconRes = context.getResources().getIdentifier("ic_notification_water", "drawable", context.getPackageName());
        if (smallIconRes == 0) {
            smallIconRes = context.getApplicationInfo().icon;
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(smallIconRes)
                .setColor(Color.parseColor("#0284c7"))
                .setContentTitle("💧 ¡Recordatorio pospuesto!")
                .setContentText("¡Ya pasaron 10 minutos! Tomá tu vaso de agua fresca para mantener tu hidratación.")
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(contentPendingIntent)
                .addAction(0, "💧 Tomé el Agua", drankPendingIntent)
                .addAction(0, "⏰ Posponer 10 Min", snoozeAgainPendingIntent);

        nm.notify(SNOOZE_NOTIFICATION_ID, builder.build());
    }
}
