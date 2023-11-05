// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use business_logic::{read_csv, get_compound_data, write_csv};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn get_csv_content(path: &str) -> String {
    let data = read_csv(path);
    serde_json::to_string(&data).unwrap()
}

#[tauri::command]
fn fetch_compound(inchi: &str) -> String {
    let data = get_compound_data(inchi);
    serde_json::to_string(&data).unwrap()
}


#[tauri::command]
fn write_data(path: &str, file: &str, data: &str){
    write_csv(path, file, data)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_csv_content, fetch_compound, write_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
