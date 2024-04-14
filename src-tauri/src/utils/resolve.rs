// use crate::{log_err, trace_err};
use tauri::{api::process::{Command,  CommandEvent}, App};


/// handle something when start app
pub fn resolve_setup(app: &mut App) {
    let _app_handle = app.handle();
    // 启动核心
    log::trace!("launch core");
    // `new_sidecar()` expects just the filename, NOT the whole path like in JavaScript
    let (mut rx, mut child) = Command::new_sidecar("go2rtc")
        .expect("failed to create `go2rtc` binary command")
        .spawn()
        .expect("Failed to spawn sidecar");

    tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(_line) = event {
                // window
                //     .emit("message", Some(format!("'{}'", line)))
                //     .expect("failed to emit event");
                // write to stdin
                child.write("message from Rust\n".as_bytes()).unwrap();
            }
        }
    });
}
