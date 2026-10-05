/**
 * Script de parche para @capacitor/local-notifications en Android
 * Code Ahumada • Director General Atlas
 * 
 * Permite que los botones de acción con 'foreground: false' ejecuten
 * PendingIntent.getBroadcast hacia un BroadcastReceiver en segundo plano
 * SIN abrir ni enfocar la aplicación de Android.
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..', 'node_modules', '@capacitor', 'local-notifications', 'android', 'src', 'main', 'kotlin', 'com', 'capacitorjs', 'plugins', 'localnotifications');

function patchNotificationAction() {
  const filePath = path.join(baseDir, 'NotificationAction.kt');
  if (!fs.existsSync(filePath)) {
    console.log('[PATCH] NotificationAction.kt no encontrado en node_modules (se omitirá si no se instaló).');
    return;
  }

  // Reemplazar clase con soporte de foreground
  const patchedContent = `package com.capacitorjs.plugins.localnotifications

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Logger
import org.json.JSONObject

/**
 * Action types that will be registered for the notifications.
 */
class NotificationAction {

    var id: String? = null
    var title: String? = null
    private var input: Boolean? = null
    private var foreground: Boolean? = true

    constructor()

    constructor(id: String?, title: String?, input: Boolean?) {
        this.id = id
        this.title = title
        this.input = input
        this.foreground = true
    }

    constructor(id: String?, title: String?, input: Boolean?, foreground: Boolean?) {
        this.id = id
        this.title = title
        this.input = input
        this.foreground = foreground != false
    }

    fun isInput(): Boolean = input == true
    fun isForeground(): Boolean = foreground != false

    fun setInput(input: Boolean?) {
        this.input = input
    }

    fun setForeground(foreground: Boolean?) {
        this.foreground = foreground
    }

    companion object {
        fun buildTypes(types: JSArray): Map<String, Array<NotificationAction>>? {
            val actionTypeMap = HashMap<String, Array<NotificationAction>>()
            try {
                val objects = types.toList<JSONObject>()
                for (obj in objects) {
                    val jsObject = JSObject.fromJSONObject(obj)
                    val actionGroupId = jsObject.getString("id") ?: return null
                    val actions = jsObject.getJSONArray("actions")
                    if (actions != null) {
                        val typesArray = Array(actions.length()) { i ->
                            val action = JSObject.fromJSONObject(actions.getJSONObject(i))
                            val isFg = action.getBool("foreground") ?: true
                            NotificationAction(
                                action.getString("id"),
                                action.getString("title"),
                                action.getBool("input"),
                                isFg
                            )
                        }
                        actionTypeMap[actionGroupId] = typesArray
                    }
                }
            } catch (e: Exception) {
                Logger.error(Logger.tags("LN"), "Error when building action types", e)
            }
            return actionTypeMap
        }
    }
}
`;

  fs.writeFileSync(filePath, patchedContent, 'utf8');
  console.log('✓ [PATCH] NotificationAction.kt parcheado exitosamente con soporte para foreground: false.');
}

function patchNotificationStorage() {
  const filePath = path.join(baseDir, 'NotificationStorage.kt');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  if (content.includes('foreground$i')) {
    console.log('[PATCH] NotificationStorage.kt ya está parcheado.');
    return;
  }

  // Parchear escritura
  content = content.replace(
    'editor.putBoolean("input$i", notificationActions[i].isInput())',
    'editor.putBoolean("input$i", notificationActions[i].isInput())\n                editor.putBoolean("foreground$i", notificationActions[i].isForeground())'
  );

  // Parchear lectura
  content = content.replace(
    'val input = storage.getBoolean("input$i", false)\n            NotificationAction(id, title, input)',
    'val input = storage.getBoolean("input$i", false)\n            val foreground = storage.getBoolean("foreground$i", true)\n            NotificationAction(id, title, input, foreground)'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ [PATCH] NotificationStorage.kt parcheado exitosamente para persistir foreground.');
}

function patchLocalNotificationManager() {
  const filePath = path.join(baseDir, 'LocalNotificationManager.kt');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  if (content.includes('NOTIFICATION_ACTION')) {
    console.log('[PATCH] LocalNotificationManager.kt ya está parcheado.');
    return;
  }

  const targetRegex = /for\s*\(\s*notificationAction\s+in\s+actionGroup\s*\)\s*\{[\s\S]*?mBuilder\.addAction\(actionBuilder\.build\(\)\)/;

  const replacement = `for (notificationAction in actionGroup) {
                val actionPendingIntent = if (!notificationAction.isForeground()) {
                    val broadcastIntent = Intent("com.codeahumada.habitflow.NOTIFICATION_ACTION").apply {
                        setPackage(context.packageName)
                        putExtra(NOTIFICATION_INTENT_KEY, id)
                        putExtra(ACTION_INTENT_KEY, notificationAction.id)
                        putExtra(NOTIFICATION_OBJ_INTENT_KEY, localNotification.source)
                    }
                    var bFlags = PendingIntent.FLAG_CANCEL_CURRENT
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        bFlags = bFlags or PendingIntent.FLAG_MUTABLE
                    }
                    PendingIntent.getBroadcast(
                        context,
                        id + (notificationAction.id?.hashCode() ?: 0),
                        broadcastIntent,
                        bFlags
                    )
                } else {
                    val actionIntent = buildIntent(localNotification, notificationAction.id)
                    PendingIntent.getActivity(
                        context,
                        id + (notificationAction.id?.hashCode() ?: 0),
                        actionIntent,
                        flags
                    )
                }
                val actionBuilder = NotificationCompat.Action.Builder(
                    R.drawable.ic_transparent,
                    notificationAction.title,
                    actionPendingIntent
                )
                if (notificationAction.isInput()) {
                    val remoteInput = RemoteInput.Builder(REMOTE_INPUT_KEY).setLabel(notificationAction.title).build()
                    actionBuilder.addRemoteInput(remoteInput)
                }
                mBuilder.addAction(actionBuilder.build())`;

  if (!targetRegex.test(content)) {
    console.warn('[PATCH] No se encontró el bloque regex en LocalNotificationManager.kt.');
    return;
  }

  content = content.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ [PATCH] LocalNotificationManager.kt parcheado exitosamente para despachar PendingIntent.getBroadcast sin abrir la app.');
}

function run() {
  try {
    patchNotificationAction();
    patchNotificationStorage();
    patchLocalNotificationManager();
    console.log('✨ [PATCH] Todos los parches de Local Notifications aplicados correctamente.');
  } catch (e) {
    console.error('Error aplicando parches:', e);
  }
}

if (require.main === module) {
  run();
}

module.exports = run;
