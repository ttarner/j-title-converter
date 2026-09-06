package com.jtitle.converter;

import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@CapacitorPlugin(name = "ShareReceiver")
public class ShareReceiverPlugin extends Plugin {
    private static JSObject pendingShare = null;

    @Override
    public void load() {
        super.load();
        if (getActivity() != null && getActivity().getIntent() != null) {
            handleIntent(getActivity().getIntent(), false);
        }
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        if (intent != null) {
            handleIntent(intent, true);
        }
    }

    private void handleIntent(Intent intent, boolean emitEvent) {
        if (intent == null) return;
        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null) {
            JSObject data = new JSObject();
            data.put("action", action);

            if (type.startsWith("text/")) {
                String text = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (text == null) {
                    CharSequence cs = intent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT);
                    if (cs != null) {
                        text = cs.toString();
                    }
                }
                if (text != null) {
                    data.put("type", "text");
                    data.put("value", text);
                    String subject = intent.getStringExtra(Intent.EXTRA_SUBJECT);
                    if (subject != null) {
                        data.put("subject", subject);
                    }
                    pendingShare = data;
                    if (emitEvent) {
                        notifyListeners("shareReceived", data);
                    }
                }
            } else if (type.startsWith("image/")) {
                Uri imageUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                if (imageUri == null && intent.getClipData() != null && intent.getClipData().getItemCount() > 0) {
                    imageUri = intent.getClipData().getItemAt(0).getUri();
                }
                if (imageUri != null) {
                    try (InputStream is = getContext().getContentResolver().openInputStream(imageUri)) {
                        if (is != null) {
                            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                            int nRead;
                            byte[] dataBytes = new byte[16384];
                            while ((nRead = is.read(dataBytes, 0, dataBytes.length)) != -1) {
                                buffer.write(dataBytes, 0, nRead);
                            }
                            buffer.flush();
                            byte[] bytes = buffer.toByteArray();
                            String base64 = Base64.encodeToString(bytes, Base64.NO_WRAP);
                            data.put("type", "image");
                            data.put("value", "data:" + type + ";base64," + base64);
                            pendingShare = data;
                            if (emitEvent) {
                                notifyListeners("shareReceived", data);
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    @PluginMethod
    public void getPendingShare(PluginCall call) {
        JSObject ret = new JSObject();
        if (pendingShare != null) {
            ret.put("hasData", true);
            ret.put("data", pendingShare);
        } else {
            ret.put("hasData", false);
        }
        call.resolve(ret);
    }

    @PluginMethod
    public void clearPendingShare(PluginCall call) {
        pendingShare = null;
        JSObject ret = new JSObject();
        ret.put("cleared", true);
        call.resolve(ret);
    }
}

