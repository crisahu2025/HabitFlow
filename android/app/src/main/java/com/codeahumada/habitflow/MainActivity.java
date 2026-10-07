package com.codeahumada.habitflow;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppUpdatePlugin.class);
        registerPlugin(NativeWaterSyncPlugin.class);
        registerPlugin(NativeAlarmsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
