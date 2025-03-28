# XO Game - Run Instructions

## Option 1: Run the Static HTML Version (No Setup Required)

The simplest way to play the game is to open the `static-game.html` file directly in your browser. This version doesn't require any setup or installation, but it's limited to local play (no online functionality).

1. Double-click the `static-game.html` file to open it in your web browser
2. Play the game locally with a friend

## Option 2: Install Dependencies and Run with Node.js

If you have Node.js installed and want to run the full version:

1. Install Node.js from https://nodejs.org/ if you haven't already

2. Open a command prompt or terminal where you have administrative privileges 

3. Navigate to the project directory

4. Run the initialization script:
   ```
   node initConvex.js
   ```

5. Install dependencies:
   ```
   npm install
   ```
   
   If you encounter permission issues, you might need to run as administrator or use:
   ```
   npm install --no-bin-links
   ```

6. Start the server:
   ```
   node server.js
   ```

7. Open your browser and go to http://localhost:3000

## Troubleshooting

If you encounter the PowerShell security error:
```
File cannot be loaded because running scripts is disabled on this system
```

You can try these solutions:

1. Open PowerShell as Administrator and run:
   ```
   Set-ExecutionPolicy RemoteSigned
   ```

2. Or use Command Prompt (cmd.exe) instead of PowerShell

3. Alternatively, just use the static HTML version (Option 1)

## GitHub Upload

To upload to GitHub:

1. Create a new repository on GitHub
2. Follow the instructions provided by GitHub to push this code to your new repository
3. Make sure to include all files, especially the static HTML version for easy access 