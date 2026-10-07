package com.codeahumada.habitflow;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

public class ReminderAlarmReceiver extends BroadcastReceiver {

    private static final String TAG = "ReminderAlarmReceiver";
    private static final int ALARM_ID = 8888;
    private static final String CHANNEL_ID = "habitflow_reminders_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Alarma recibida: " + intent.getAction());

        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction()) ||
            Intent.ACTION_TIME_CHANGED.equals(intent.getAction()) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(intent.getAction())) {
            
            scheduleNextAlarm(context);
            return;
        }

        // Action received from alarm trigger
        showNotification(context);
        
        // Schedule next one
        scheduleNextAlarm(context);
    }

    private void showNotification(Context context) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Recordatorios de Hidratación HabitFlow",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alarmas periódicas para tomar agua");
            nm.createNotificationChannel(channel);
        }

        Intent openIntent = new Intent(context, MainActivity.class);
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent openPi = PendingIntent.getActivity(context, 0, openIntent, piFlags);

        Intent drankIntent = new Intent(context, NotificationActionReceiver.class);
        drankIntent.putExtra(NotificationActionReceiver.EXTRA_ACTION_ID, "drank_water");
        drankIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, ALARM_ID);
        PendingIntent drankPi = PendingIntent.getBroadcast(context, 1, drankIntent, piFlags);

        Intent snoozeIntent = new Intent(context, NotificationActionReceiver.class);
        snoozeIntent.putExtra(NotificationActionReceiver.EXTRA_ACTION_ID, "snooze_10");
        snoozeIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, ALARM_ID);
        PendingIntent snoozePi = PendingIntent.getBroadcast(context, 2, snoozeIntent, piFlags);

        int iconId = context.getResources().getIdentifier("ic_notification_water", "drawable", context.getPackageName());
        if (iconId == 0) {
            iconId = context.getApplicationInfo().icon;
        }

        Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(iconId)
                .setContentTitle("💦 ¡Momento de hidratarte!")
                .setContentText("Tomá un vaso de agua fresca (250 ml) para mantener tu hidratación y energía.")
                .setContentIntent(openPi)
                .setAutoCancel(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            Notification.Action drankAction = new Notification.Action.Builder(
                    null, "💧 Tomé el Agua", drankPi).build();
            Notification.Action snoozeAction = new Notification.Action.Builder(
                    null, "💤 Posponer 10 Min", snoozePi).build();
            builder.addAction(drankAction);
            builder.addAction(snoozeAction);
        }

        nm.notify(ALARM_ID, builder.build());
    }

    public static void scheduleNextAlarm(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(NativeAlarmsPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        boolean enabled = prefs.getBoolean(NativeAlarmsPlugin.KEY_ALARMS_ENABLED, false);
        if (!enabled) {
            cancelAlarm(context);
            return;
        }

        String timesJson = prefs.getString(NativeAlarmsPlugin.KEY_ALARM_TIMES, "[]");
        List<String> times = new ArrayList<>();
        try {
            JSONArray arr = new JSONArray(timesJson);
            for (int i=0; i<arr.length(); i++) {
                times.add(arr.getString(i));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parseando times", e);
        }

        if (times.isEmpty()) {
            cancelAlarm(context);
            return;
        }

        Calendar now = Calendar.getInstance();
        int currentHour = now.get(Calendar.HOUR_OF_DAY);
        int currentMinute = now.get(Calendar.MINUTE);
        
        Integer nextHour = null;
        Integer nextMinute = null;
        boolean tomorrow = false;

        for (String t : times) {
            String[] parts = t.split(":");
            if (parts.length == 2) {
                int h = Integer.parseInt(parts[0]);
                int m = Integer.parseInt(parts[1]);
                if (h > currentHour || (h == currentHour && m > currentMinute)) {
                    nextHour = h;
                    nextMinute = m;
                    break;
                }
            }
        }

        if (nextHour == null) {
            String[] parts = times.get(0).split(":");
            nextHour = Integer.parseInt(parts[0]);
            nextMinute = Integer.parseInt(parts[1]);
            tomorrow = true;
        }

        Calendar nextAlarm = Calendar.getInstance();
        nextAlarm.set(Calendar.HOUR_OF_DAY, nextHour);
        nextAlarm.set(Calendar.MINUTE, nextMinute);
        nextAlarm.set(Calendar.SECOND, 0);
        nextAlarm.set(Calendar.MILLISECOND, 0);

        if (tomorrow) {
            nextAlarm.add(Calendar.DAY_OF_YEAR, 1);
        }

        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, ReminderAlarmReceiver.class);
        intent.setAction("com.codeahumada.habitflow.ALARM_TRIGGER");
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pi = PendingIntent.getBroadcast(context, ALARM_ID, intent, flags);

        boolean canExact = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            canExact = am.canScheduleExactAlarms();
        }

        if (canExact) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                AlarmManager.AlarmClockInfo info = new AlarmManager.AlarmClockInfo(nextAlarm.getTimeInMillis(), pi);
                am.setAlarmClock(info, pi);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                am.setExact(AlarmManager.RTC_WAKEUP, nextAlarm.getTimeInMillis(), pi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, nextAlarm.getTimeInMillis(), pi);
            }
        } else {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextAlarm.getTimeInMillis(), pi);
        }

        Log.d(TAG, "Próxima alarma programada para: " + nextAlarm.getTime().toString());
    }

    public static void cancelAlarm(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent intent = new Intent(context, ReminderAlarmReceiver.class);
        intent.setAction("com.codeahumada.habitflow.ALARM_TRIGGER");
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pi = PendingIntent.getBroadcast(context, ALARM_ID, intent, flags);
        am.cancel(pi);
    }
}
