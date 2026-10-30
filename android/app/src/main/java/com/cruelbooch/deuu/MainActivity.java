package com.cruelbooch.deuu;

import android.content.res.Resources;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyWebViewTweaks();
    }

    @Override
    public void onStart() {
        super.onStart();
        applyWebViewTweaks();
    }

    /** 关闭缩放，并把状态栏高度暴露给前端（用于沉浸式布局的内边距） */
    private void applyWebViewTweaks() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        WebSettings settings = webView.getSettings();
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new InsetsBridge(), "DeuuNative");
    }

    /** 供前端读取系统栏尺寸（单位：dp，等价于 CSS px） */
    public class InsetsBridge {
        @JavascriptInterface
        public float statusBarDp() {
            return dimensionDp("status_bar_height");
        }

        @JavascriptInterface
        public float navigationBarDp() {
            return dimensionDp("navigation_bar_height");
        }

        private float dimensionDp(String name) {
            Resources res = getResources();
            int id = res.getIdentifier(name, "dimen", "android");
            if (id <= 0) return 0f;
            float density = res.getDisplayMetrics().density;
            if (density <= 0f) return 0f;
            return res.getDimensionPixelSize(id) / density;
        }
    }
}
