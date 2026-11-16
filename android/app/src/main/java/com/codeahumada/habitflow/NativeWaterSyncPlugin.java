package com.codeahumada.habitflow;

import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Plugin de Capacitor para sincronizar de forma atómica el agua tomada
 * registrada desde las notificaciones de Android en segundo plano.
 * Code Ahumada • Director General Atlas
 */
@CapacitorPlugin(name = "NativeWaterSync")
public class NativeWaterSyncPlugin extends Plugin {

    public static final String PREFS_NAME = "habitflow_native_sync";
    public static final String KEY_PENDING_ML = "pending_water_ml";
    public static final String KEY_PENDING_COUNT = "pending_actions_count";
    public static final String KEY_LAST_TIMESTAMP = "last_drank_timestamp";
    public static final String KEY_PENDING_ENTRIES = "pending_water_entries";

    // Candado de sincronización atómica entre BroadcastReceiver y WebView
    public static final Object LOCK = new Object();

    public static NativeWaterSyncPlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    /**
     * Lee y limpia atómicamente todos los registros pendientes de agua en una sola operación.
     * Evita condiciones de carrera donde múltiples eventos de ciclo de vida leen el mismo valor.
     */
    @PluginMethod
    public void consumePendingWater(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            JSObject empty = new JSObject();
            empty.put("pendingMl", 0);
            empty.put("count", 0);
            empty.put("lastTimestamp", 0);
            empty.put("entries", new JSArray());
            call.resolve(empty);
            return;
        }
        int pendingMl = 0;
        int count = 0;
        long lastTime = 0;
        JSArray entriesArray = new JSArray();

        synchronized (LOCK) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            pendingMl = prefs.getInt(KEY_PENDING_ML, 0);
            count = prefs.getInt(KEY_PENDING_COUNT, 0);
            lastTime = prefs.getLong(KEY_LAST_TIMESTAMP, 0);
            String entriesJson = prefs.getString(KEY_PENDING_ENTRIES, "[]");

            try {
                JSONArray arr = new JSONArray(entriesJson);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject obj = arr.optJSONObject(i);
                    if (obj != null) {
                        JSObject jsEntry = new JSObject();
                        jsEntry.put("amount", obj.optInt("amount", 250));
                        jsEntry.put("timestamp", obj.optLong("timestamp", lastTime > 0 ? lastTime : System.currentTimeMillis()));
                        entriesArray.put(jsEntry);
                    }
                }
            } catch (Exception ignored) {}

            // Limpiar atómicamente de forma síncrona (.commit()) antes de liberar el candado
            if (pendingMl > 0 || count > 0 || entriesArray.length() > 0) {
                prefs.edit()
                        .putInt(KEY_PENDING_ML, 0)
                        .putInt(KEY_PENDING_COUNT, 0)
                        .putString(KEY_PENDING_ENTRIES, "[]")
                        .commit();
            }
        }

        JSObject ret = new JSObject();
        ret.put("pendingMl", pendingMl);
        ret.put("count", count);
        ret.put("lastTimestamp", lastTime);
        ret.put("entries", entriesArray);
        call.resolve(ret);
    }

    @PluginMethod
    public void getPendingWater(PluginCall call) {
        Context context = getContext();
        int pendingMl;
        int count;
        long lastTime;

        synchronized (LOCK) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            pendingMl = prefs.getInt(KEY_PENDING_ML, 0);
            count = prefs.getInt(KEY_PENDING_COUNT, 0);
            lastTime = prefs.getLong(KEY_LAST_TIMESTAMP, 0);
        }

        JSObject ret = new JSObject();
        ret.put("pendingMl", pendingMl);
        ret.put("count", count);
        ret.put("lastTimestamp", lastTime);
        call.resolve(ret);
    }

    @PluginMethod
    public void clearPendingWater(PluginCall call) {
        Context context = getContext();
        synchronized (LOCK) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                    .putInt(KEY_PENDING_ML, 0)
                    .putInt(KEY_PENDING_COUNT, 0)
                    .putString(KEY_PENDING_ENTRIES, "[]")
                    .commit();
        }

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
