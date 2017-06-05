const {app, BrowserWindow} = require('electron');

const APP_WIDTH = 550;
const APP_HEIGHT = 380;

let mainWindow;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
          x: 1970,
          y: 0,
          width: APP_WIDTH,
          height: APP_HEIGHT,
          frame:false,
          transparent: true
  });

  // mainWindow.setIgnoreMouseEvents(true);
  // mainWindow.setPosition(40,1440-APP_HEIGHT);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
