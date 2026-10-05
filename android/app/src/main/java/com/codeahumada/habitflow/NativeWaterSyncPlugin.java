package com.codeahumada.habitflow;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Plugin de Capacitor para sincronizar en caliente el agua tomada
 * registrada desde las notificaciones de Android en segundo plano.
 * Code Ahumada • Director General Atlas
 */
@CapacitorPlugin(name = "NativeWaterSync")
public class NativeWaterSyncPlugin extends Plugin {

    public static final String PREFS_NAME = "habitflow_native_sync";
    public static final String KEY_PENDING_ML = "pending_water_ml";
    public static final String KEY_PENDING_COUNT = "pending_actions_count";
    public static final String KEY_LAST_TIMESTAMP = "last_drank_timestamp";

    public static NativeWaterSyncPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @PluginMethod
    public void getPendingWater(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        int pendingMl = prefs.getInt(KEY_PENDING_ML, 0);
        int count = prefs.getInt(KEY_PENDING_COUNT, 0);
        long lastTime = prefs.getLong(KEY_LAST_TIMESTAMP, 0);

        JSObject ret = new JSObject();
        ret.put("pendingMl", pendingMl);
        ret.put("count", count);
        ret.put("lastTimestamp", lastTime);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearPendingWater(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
                .putInt(KEY_PENDING_ML, 0)
                .putInt(KEY_PENDING_COUNT, 0)
                .apply();

        JSObject ret = new JSObject();
        ret.put("cleared", true);
        call.resolve(ret);
    }

    public static void notifyWaterAdded(int amount) {
        if (instance != null) {
            JSObject data = new JSObject();
            data.put("amount", amount);
            data.put("timestamp", System.currentTimeMillis());
            instance.notifyListeners("onBackgroundWaterAdded", data);
        }
    }
}
