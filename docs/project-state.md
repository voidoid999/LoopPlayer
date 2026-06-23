LoopPlayer Project Snapshot

Overview

LoopPlayer is a browser-based A-B audio looping tool designed for music practice, language learning, transcription, and focused listening.

The application runs entirely in the browser using pure HTML, CSS, and JavaScript.

No frameworks, build tools, backend services, or external dependencies are used.

The application can be opened directly from index.html and is intended to be deployed via GitHub Pages.

⸻

Tech Stack

* HTML
* CSS
* JavaScript
* HTMLAudioElement API

⸻

Current Features

Audio Playback

* Load local audio files
* Supported formats:
    * MP3
    * WAV
    * M4A
    * FLAC
* Play button
* Pause button
* Spacebar play/pause shortcut
* Current playback time display
* Duration display
* Seek slider

Playback Speed

Playback speed buttons:

* 0.30x
* 0.35x
* 0.40x
* 0.45x
* 0.50x
* 0.55x
* 0.60x
* 0.65x
* 0.70x
* 0.75x
* 0.80x
* 0.85x
* 0.90x
* 0.95x
* 1.00x

Current speed button is visually highlighted.

Volume

* Volume slider
* 0–100% volume control
* Live volume percentage display

A-B Looping

* Set A button
* Set B button
* Clear Loop button
* A position display
* B position display
* Loop status display

Loop behavior:

* When playback reaches B:
    * Playback automatically jumps to A
* Looping only activates when:
    * A exists
    * B exists
    * B > A

Visual Loop Editing

Loop markers are displayed above the seek bar.

Features:

* A marker shown after setting A
* B marker shown after setting B
* Highlighted loop region between A and B

Interactive editing:

* Drag A marker
* Drag B marker
* Drag entire loop region
* Minimum loop length enforced
* Markers update in real time

Mobile Support

Responsive layout:

* Speed buttons switch to 3-column layout on small screens
* Touch-friendly controls
* Touch dragging support for loop markers

UI

* Single-page application
* Modern card-based layout
* Footer
* Favicon support
* Apple touch icon support

⸻

Current File Structure

LoopPlayer/

├── index.html

├── styles.css

├── app.js

├── favicon.png

├── apple-touch-icon.png

└── docs/

└── project-state.md

⸻

Deployment

Target platform:

GitHub Pages

Deployment method:

1. Push repository to GitHub
2. Enable Pages
3. Deploy from main branch
4. Use root folder

Expected URL:

https://USERNAME.github.io/LoopPlayer/

⸻

Known Limitations

Audio

* No waveform visualization
* No playlist support
* No multiple file queue

Looping

* Loop points are not persisted
* Loop points reset when a new file is loaded

Storage

* No localStorage support yet
* User preferences are not remembered

⸻

Possible Future Features

High Priority

* Draggable loop region improvements
* Keyboard shortcuts:
    * A = Set A
    * B = Set B
    * C = Clear Loop
* LocalStorage for:
    * Volume
    * Playback speed

Medium Priority

* Waveform visualization
* Zoomable timeline
* Loop length display
* Current file name display
* Dark mode

Low Priority

* Playlist support
* Multiple loop presets
* Export/import loop points
* Installable PWA
* Mobile app packaging

⸻

Recent Major Changes

* Added volume control
* Replaced speed dropdown with speed button grid
* Added Clear Loop button
* Added visual A/B markers
* Added loop region display
* Added draggable A marker
* Added draggable B marker
* Added draggable loop region
* Added Spacebar play/pause
* Added mobile responsive speed controls
* Added favicon support
* Prepared for GitHub Pages deployment

⸻

Current Status

Project status: Functional MVP

Ready for:

* Personal use
* GitHub Pages deployment
* Public testing

Next recommended milestone:

Version 1.0 release on GitHub Pages.