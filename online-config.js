/* Flix Kick Up online: the one place for the server address (web build, GitHub Pages and the iOS app).
   ONLINE_SERVER_URL is the production server, e.g. 'wss://flix-kick-up-online.onrender.com/ws' (wss, ending in /ws).
   Empty: online play is hidden in the app and shows "not available" on the web; the rest of the game is unaffected.
   DEV_SERVER_URL is used when the page itself runs on localhost / 127.0.0.1 in a browser (not inside the app),
   or always when USE_DEV_SERVER is true (e.g. an iPhone build pointed at your Mac: 'ws://192.168.1.20:8080/ws').
   For a quick test any page also accepts ?online=<ws url>. */
window.FLIX_ONLINE_CONFIG = {
  ONLINE_SERVER_URL: 'wss://flix-kick-up-online.onrender.com/ws',
  DEV_SERVER_URL: 'ws://localhost:8080/ws',
  USE_DEV_SERVER: false
};
