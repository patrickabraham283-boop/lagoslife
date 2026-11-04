# Lagos Life Simulator

A browser-based 3D multiplayer city prototype built with Three.js, Node.js, Express and Socket.IO.

## Requirements
- Windows 10/11
- Node.js 18 or newer
- Internet connection (Three.js and Google Fonts load from CDNs)

## Run on Windows / XAMPP computer
This project does not run inside Apache/XAMPP. It uses a small Node.js server.

1. Install Node.js from https://nodejs.org/
2. Extract `lagos_life_simulator.zip`.
3. Open the extracted `lagos_life_simulator` folder.
4. Click the folder address bar, type `cmd`, and press Enter.
5. Run:

   npm install
   npm start

6. Open http://localhost:3000 in Chrome or Edge.

## Multiplayer
- Each browser tab/device connects to the same Socket.IO server.
- On the same Wi-Fi, find the host PC's local IPv4 address using `ipconfig`.
- Other devices open `http://HOST-IP:3000` (example: http://192.168.1.5:3000).
- Allow Node.js through Windows Firewall on private networks.
- For internet multiplayer, deploy the Node server to a public Node hosting service and use HTTPS. Do not expose your home PC without understanding router/firewall security.

## Controls
- W A S D / arrow keys: move
- Shift: run
- Space: jump
- Enter: focus street chat
- On touch screens: use the on-screen direction pad and RUN button

## Current playable features
- Procedural 3D city blocks, roads, pavements, palm trees and Lagos district labels
- Third-person player movement, running and jumping
- Multiplayer player presence and movement synchronization
- Live text chat
- Starting wallet display and player name

## Important scope note
This is a playable first version, not yet a complete GTA-scale life simulator. The city is a generated prototype and the money/jobs/vehicles/property systems are not implemented yet. The server currently keeps player state in memory; disconnecting/restarting clears it. The next development phase can add vehicles, jobs, shops, missions, persistent accounts and database saving.
