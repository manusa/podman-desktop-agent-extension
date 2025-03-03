const extensionApi = require('@podman-desktop/api');

export const activate = async extensionContext => {
  const wvp = extensionApi.window.createWebviewPanel(
    'podmanDesktopAgent',
    'Podman Desktop Agent',
    {}
  );
  extensionContext.subscriptions.push(wvp);
  wvp.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Podman Desktop Agent</title>
      </head>
      <body>
        <h1>Podman Desktop Agent</h1>
        <p>Greetings professor Falken</p>
      </body>
    </html>
  `;
};

export const deactivate = async extensionContext => {
  extensionContext.forEach(wvp => wvp.dispose());
};
