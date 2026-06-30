use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let win = app.get_webview_window("main").unwrap();
            // Disable back/forward swipe gestures so two-finger trackpad horizontal
            // swipes reach JavaScript as wheel events instead of being consumed as
            // navigation gestures by WKWebView.
            #[cfg(target_os = "macos")]
            win.with_webview(|wv| {
                use objc2::runtime::AnyObject;
                use objc2::msg_send;
                unsafe {
                    let ptr: *mut AnyObject = wv.inner() as *mut AnyObject;
                    let _: () = msg_send![&*ptr, setAllowsBackForwardNavigationGestures: false];
                }
            })
            .unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running JoyFlix");
}
