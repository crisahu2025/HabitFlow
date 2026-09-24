package com.codeahumada.habitflow;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {

    @PluginMethod
    public void installApk(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("URL no proporcionada");
            return;
        }

        Context context = getContext();

        // Verificar permiso de instalación de fuentes desconocidas en Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!context.getPackageManager().canRequestPackageInstalls()) {
                try {
                    Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    settingsIntent.setData(Uri.parse("package:" + context.getPackageName()));
                    settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(settingsIntent);
                } catch (Exception ignored) {}
            }
        }

        new Thread(() -> {
            HttpURLConnection connection = null;
            InputStream input = null;
            FileOutputStream output = null;

            try {
                URL url = new URL(apkUrl);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setInstanceFollowRedirects(true);
                connection.setConnectTimeout(15000);
                connection.setReadTimeout(30000);
                connection.connect();

                // Manejar redirecciones 301, 302, 307, 308 (GitHub Releases redirige a Azure/AWS blob)
                int responseCode = connection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                    responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                    responseCode == 307 || responseCode == 308) {
                    String newUrl = connection.getHeaderField("Location");
                    connection.disconnect();
                    url = new URL(newUrl);
                    connection = (HttpURLConnection) url.openConnection();
                    connection.setConnectTimeout(15000);
                    connection.setReadTimeout(30000);
                    connection.connect();
                }

                int fileLength = connection.getContentLength();
                input = connection.getInputStream();

                File cacheDir = context.getExternalCacheDir();
                if (cacheDir == null) {
                    cacheDir = context.getCacheDir();
                }
                File outputFile = new File(cacheDir, "HabitFlow_update.apk");
                if (outputFile.exists()) {
                    outputFile.delete();
                }

                output = new FileOutputStream(outputFile);
                byte[] data = new byte[16384];
                long total = 0;
                int count;
                int lastProgress = -1;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    if (fileLength > 0) {
                        int progress = (int) ((total * 100) / fileLength);
                        if (progress != lastProgress) {
                            lastProgress = progress;
                            JSObject ret = new JSObject();
                            ret.put("progress", progress);
                            ret.put("total", fileLength);
                            ret.put("downloaded", total);
                            notifyListeners("downloadProgress", ret);
                        }
                    }
                }

                output.flush();
                output.close();
                output = null;
                input.close();
                input = null;
                connection.disconnect();
                connection = null;

                // Notificar 100%
                JSObject doneObj = new JSObject();
                doneObj.put("progress", 100);
                notifyListeners("downloadProgress", doneObj);

                // Disparar Intent de instalación nativa de Android
                Uri apkUri = FileProvider.getUriForFile(
                    context,
                    context.getPackageName() + ".fileprovider",
                    outputFile
                );

                Intent installIntent = new Intent(Intent.ACTION_VIEW);
                installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(installIntent);

                JSObject res = new JSObject();
                res.put("status", "success");
                res.put("message", "Instalador iniciado");
                call.resolve(res);

            } catch (Exception e) {
                try {
                    if (output != null) output.close();
                    if (input != null) input.close();
                    if (connection != null) connection.disconnect();
                } catch (Exception ignored) {}

                call.reject("Error al descargar e instalar actualización: " + e.getMessage());
            }
        }).start();
    }
}
