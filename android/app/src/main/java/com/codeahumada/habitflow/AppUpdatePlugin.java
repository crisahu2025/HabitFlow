package com.codeahumada.habitflow;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
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
import java.util.List;

/**
 * AppUpdatePlugin - Motor nativo de actualización APK in-app para HabitFlow.
 * Code Ahumada • Director Cristian
 * 
 * Implementa descarga en background con reporte de progreso porcentual,
 * resolución segura de FileProvider y lanzamiento del instalador de Android
 * en el UI Thread con tolerancia total a excepciones y fallback automático a navegador.
 */
@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {

    /**
     * Fallback para abrir descarga directa en el navegador predeterminado del sistema
     */
    @PluginMethod
    public void openBrowserDownload(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("URL no proporcionada");
            return;
        }

        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(browserIntent);
            JSObject res = new JSObject();
            res.put("status", "success");
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Error al abrir navegador: " + e.getMessage());
        }
    }

    /**
     * Verifica si la app tiene permiso para solicitar instalación de paquetes
     */
    @PluginMethod
    public void canInstallPackages(PluginCall call) {
        JSObject res = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            res.put("canInstall", getContext().getPackageManager().canRequestPackageInstalls());
        } else {
            res.put("canInstall", true);
        }
        call.resolve(res);
    }

    /**
     * Abre los ajustes del sistema si el usuario necesita conceder permiso
     */
    @PluginMethod
    public void requestInstallPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                settingsIntent.setData(Uri.parse("package:" + getContext().getPackageName()));
                settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(settingsIntent);
                JSObject res = new JSObject();
                res.put("status", "opened");
                call.resolve(res);
                return;
            } catch (Exception e) {
                // Fallback sin URI de paquete
                try {
                    Intent fallbackIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(fallbackIntent);
                    JSObject res = new JSObject();
                    res.put("status", "opened");
                    call.resolve(res);
                    return;
                } catch (Exception ex) {
                    call.reject("No se pudo abrir configuración: " + ex.getMessage());
                    return;
                }
            }
        }
        JSObject res = new JSObject();
        res.put("status", "not_needed");
        call.resolve(res);
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("URL no proporcionada");
            return;
        }

        Context context = getContext();
        Activity activity = getActivity();

        new Thread(() -> {
            HttpURLConnection connection = null;
            InputStream input = null;
            FileOutputStream output = null;

            try {
                URL currentUrl = new URL(apkUrl);
                int redirectCount = 0;
                final int MAX_REDIRECTS = 6;

                // Seguir redirecciones de forma robusta (GitHub Releases -> S3 / CDN)
                while (redirectCount < MAX_REDIRECTS) {
                    connection = (HttpURLConnection) currentUrl.openConnection();
                    connection.setRequestMethod("GET");
                    connection.setRequestProperty("User-Agent", "Mozilla/5.0 HabitFlow-Android-App");
                    connection.setRequestProperty("Accept", "*/*");
                    connection.setConnectTimeout(20000);
                    connection.setReadTimeout(45000);
                    connection.setInstanceFollowRedirects(false);
                    connection.connect();

                    int responseCode = connection.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                        responseCode == HttpURLConnection.HTTP_MOVED_PERM ||
                        responseCode == HttpURLConnection.HTTP_SEE_OTHER ||
                        responseCode == 307 || responseCode == 308) {
                        
                        String newLocation = connection.getHeaderField("Location");
                        connection.disconnect();
                        if (newLocation == null || newLocation.isEmpty()) {
                            throw new Exception("Redirección HTTP sin URL de destino");
                        }
                        currentUrl = new URL(newLocation);
                        redirectCount++;
                    } else if (responseCode == HttpURLConnection.HTTP_OK) {
                        break;
                    } else {
                        throw new Exception("Servidor respondió con código HTTP: " + responseCode);
                    }
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

                // Asegurar permisos de lectura a nivel archivo
                outputFile.setReadable(true, false);

                // Notificar 100% de descarga completada
                JSObject doneObj = new JSObject();
                doneObj.put("progress", 100);
                notifyListeners("downloadProgress", doneObj);

                // Disparar Intent de instalación nativa en el UI Thread de Android de forma 100% segura
                final File finalApkFile = outputFile;
                if (activity != null) {
                    activity.runOnUiThread(() -> {
                        try {
                            Uri apkUri = FileProvider.getUriForFile(
                                context,
                                context.getPackageName() + ".fileprovider",
                                finalApkFile
                            );

                            Intent installIntent = new Intent(Intent.ACTION_VIEW);
                            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            installIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

                            // Conceder permisos de lectura a los gestores de instalación de paquetes
                            List<ResolveInfo> resInfoList = context.getPackageManager().queryIntentActivities(installIntent, PackageManager.MATCH_DEFAULT_ONLY);
                            for (ResolveInfo resolveInfo : resInfoList) {
                                String packageName = resolveInfo.activityInfo.packageName;
                                context.grantUriPermission(packageName, apkUri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            }

                            activity.startActivity(installIntent);

                            JSObject res = new JSObject();
                            res.put("status", "success");
                            res.put("message", "Instalador iniciado");
                            call.resolve(res);
                        } catch (Exception ex) {
                            // Fallback automático en caso de excepción: abrir navegador del sistema
                            try {
                                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                                browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                context.startActivity(browserIntent);
                            } catch (Exception ignored) {}

                            JSObject res = new JSObject();
                            res.put("status", "fallback_browser");
                            res.put("message", "Instalador no disponible directamente: " + ex.getMessage());
                            call.resolve(res);
                        }
                    });
                } else {
                    // Fallback si activity es nula
                    try {
                        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                        browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        context.startActivity(browserIntent);
                    } catch (Exception ignored) {}

                    JSObject res = new JSObject();
                    res.put("status", "fallback_browser");
                    call.resolve(res);
                }

            } catch (Exception e) {
                try {
                    if (output != null) output.close();
                    if (input != null) input.close();
                    if (connection != null) connection.disconnect();
                } catch (Exception ignored) {}

                // Fallback automático al navegador en caso de error
                try {
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                    browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(browserIntent);
                } catch (Exception ignored) {}

                call.reject("Error durante la descarga del instalador: " + e.getMessage());
            }
        }).start();
    }
}
