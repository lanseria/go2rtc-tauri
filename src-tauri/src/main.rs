#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod utils;
use crate::utils::resolve;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            resolve::resolve_setup(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
