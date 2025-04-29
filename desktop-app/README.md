# FinBox Receipt Scanner Desktop App

This desktop application allows you to quickly scan receipts and add transactions to your FinBox account without opening the website. After the initial authentication, you can use this app as a shortcut to scan receipts directly from your desktop.

## Features

- Scan receipts with AI directly from your desktop
- Automatically extract amount, date, description, and category
- One-click to add the transaction to your FinBox account
- Stays in your system tray for quick access
- Works offline (requires internet only for scanning and adding transactions)

## Setup Instructions

### 1. Install Dependencies

First, navigate to the desktop-app directory and install the required dependencies:

```bash
cd desktop-app
npm install
```

### 2. Add App Icons

Before building the app, you need to add the following icon files to the `assets` directory:

- `icon.png` - Main app icon (512x512px recommended)
- `icon.icns` - macOS app icon
- `icon.ico` - Windows app icon
- `tray-icon.png` - System tray icon (16x16px or 32x32px)
- `logo.png` - Logo displayed in the app (80x80px)

### 3. Run the App in Development Mode

To test the app before building:

```bash
npm start
```

### 4. Build the App

To build the app for your platform:

#### macOS:

```bash
npm run package-mac
```

#### Windows:

```bash
npm run package-win
```

#### Linux:

```bash
npm run package-linux
```

The built application will be available in the `dist` directory.

## How to Use

### First-time Setup

1. Start the FinBox web application (`npm run dev` in the main directory)
2. Launch the FinBox Receipt Scanner desktop app
3. Get your authentication token from the FinBox web app:
   - Log in to FinBox in your browser
   - Go to your account settings
   - Copy your authentication token
4. Paste the token in the desktop app and click "Authenticate"

### Scanning Receipts

1. Click "Select Receipt" to choose a receipt image from your computer
2. Click "Scan Receipt" to analyze the receipt with AI
3. Review the extracted information
4. Click "Add Transaction" to open the FinBox transaction form with pre-filled data
5. Complete and submit the transaction in your browser

### Quick Access

- The app stays in your system tray even when closed
- Click the tray icon to quickly open the scanner
- Right-click the tray icon for additional options

## Troubleshooting

- **Authentication Issues**: If you encounter authentication problems, try logging out and logging back in with a new token
- **Scanning Errors**: Make sure the receipt image is clear and well-lit
- **App Not Responding**: Restart the app and ensure the FinBox web server is running

## Security Notes

- Your authentication token is stored locally on your device
- The app only communicates with your local FinBox server
- No data is sent to third-party services (except for AI processing via your configured API)
