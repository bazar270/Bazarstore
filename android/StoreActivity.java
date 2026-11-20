package app.bazar26.store;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.*;
import android.content.Intent;
import android.net.Uri;

public class StoreActivity extends Activity {
  private WebView store;
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    store = new WebView(this);
    store.getSettings().setJavaScriptEnabled(true);
    store.getSettings().setDomStorageEnabled(true);
    store.getSettings().setAllowFileAccess(false);
    store.getSettings().setAllowContentAccess(false);
    store.getSettings().setUserAgentString(store.getSettings().getUserAgentString()+" BazarAndroid/1");
    store.setWebViewClient(new WebViewClient(){
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri uri=request.getUrl();
        if ("https".equals(uri.getScheme()) && "bazar26.vercel.app".equals(uri.getHost())) return false;
        if ("https".equals(uri.getScheme()) || "tel".equals(uri.getScheme())) {
          try {startActivity(new Intent(Intent.ACTION_VIEW,uri));} catch(android.content.ActivityNotFoundException ignored) {}
        }
        return true;
      }
    });
    setContentView(store);
    if(state==null || store.restoreState(state)==null) store.loadUrl("https://bazar26.vercel.app/");
  }
  @Override public void onSaveInstanceState(Bundle state){super.onSaveInstanceState(state);store.saveState(state);}
  @Override public void onBackPressed(){if(store.canGoBack()) store.goBack();else super.onBackPressed();}
}