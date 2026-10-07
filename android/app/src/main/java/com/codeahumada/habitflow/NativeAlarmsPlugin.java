package com.codeahumada.habitflow;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

@CapacitorPlugin(name = "NativeAlarms")
public class NativeAlarmsPlugin extends Plugin {

    public static final String PREFS_NAME = "habitflow_alarms";
    public static final String KEY_ALARM_TIMES = "alarm_times"; // JSON Array of strings "HH:MM"
    public static final String KEY_ALARMS_ENABLED = "alarms_enabled";

    @PluginMethod
    public void scheduleAlarms(PluginCall call) {
        JSArray timesArray = call.getArray("times");
        boolean enabled = call.getBoolean("enabled", true);

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        try {
            prefs.edit()
                .putString(KEY_ALARM_TIMES, timesArray != null ? timesArray.toString() : "[]")
                .putBoolean(KEY_ALARMS_ENABLED, enabled)
                .apply();
        } catch (Exception e) {
            call.reject("Error saving to prefs", e);
            return;
        }

        if (enabled) {
            ReminderAlarmReceiver.scheduleNextAlarm(context);
        } else {
            ReminderAlarmReceiver.cancelAlarm(context);
        }

        call.resolve();
    }

    @PluginMethod
    public void checkPermissionsStatus(PluginCall call) {
        Context context = getContext();
        JSObject ret = new JSObject();

        boolean exactAlarmsGranted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            exactAlarmsGranted = alarmManager.canScheduleExactAlarms();
        }
        ret.put("exactAlarmsGranted", exactAlarmsGranted);

        boolean batteryOptimizationIgnored = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            android.os.PowerManager pm = (android.os.PowerManager) context.getSystemService(Context.POWER_SERVICE);
            batteryOptimizationIgnored = pm.isIgnoringBatteryOptimizations(context.getPackageName());
        }
        ret.put("batteryOptimizationIgnored", batteryOptimizationIgnored);

        call.resolve(ret);
    }

    @PluginMethod
    public void requestExactAlarms(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }
}
