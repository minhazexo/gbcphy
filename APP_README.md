# GBC Physics Android App

This directory contains the source code for the native Android application of the Department of Physics, Government Bangla College.

## Architecture

- **UI Framework**: Jetpack Compose (Material 3)
- **Language**: Kotlin
- **Navigation**: Jetpack Navigation Compose
- **Image Loading**: Coil
- **Hybrid Integration**: WebView (for Scientific Hub & Games)

## Features

- **Home**: Overview of department programs (B.Sc, M.Sc).
- **Teachers**: Native list of faculty members with contact info and photos.
- **Routine**: Quick viewer for the departmental class routine.
- **Scientific Hub**: Integrated access to interactive PhET simulations and physics tools via optimized WebView.

## How to Run

1. Open Android Studio.
2. Select **Open** and choose the `android/` folder within this repository.
3. Wait for Gradle sync to complete.
4. Run the `app` module on an Android Emulator or a physical device (API 24+).

## Project Structure

- `app/src/main/java/com/gbcphy/app/`
    - `MainActivity.kt`: Entry point.
    - `navigation/`: Navigation definitions and graph.
    - `ui/screens/`: Individual screen implementations (Home, Teachers, etc.).
    - `ui/theme/`: Material 3 theme configuration.

## Future Enhancements

- [ ] Native implementation of the AI Chat using Google AI SDK.
- [ ] Push notifications for departmental announcements.
- [ ] Offline caching for academic materials.
