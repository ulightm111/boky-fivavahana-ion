package com.uli.bokyfivavahana2;

import android.graphics.Color;
import android.os.Build;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NavigationBar")
public class NavigationBarPlugin extends Plugin {
    @PluginMethod
    public void setColor(PluginCall call) {
        String color = call.getString("color");
        if (color == null) {
            call.reject("Color is required.");
            return;
        }

        final int parsedColor;
        try {
            parsedColor = Color.parseColor(color);
        } catch (IllegalArgumentException exception) {
            call.reject("Invalid color.");
            return;
        }

        getActivity().runOnUiThread(() -> {
            getActivity().getWindow().setNavigationBarColor(parsedColor);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                getActivity().getWindow().setNavigationBarContrastEnforced(false);
            }
            call.resolve();
        });
    }
}
