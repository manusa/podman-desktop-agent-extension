const fs = require('node:fs');
const extensionApi = require('@podman-desktop/api');
const indexPathSegments = ['dist', 'browser', 'index.html'];

const resourceLoader = extensionContext => async pathSegments => {
  const resourceUri = extensionApi.Uri.joinPath(
    extensionContext.extensionUri,
    ...pathSegments
  );
  return fs.promises.readFile(resourceUri.fsPath, 'utf8');
};

// URLs for assets need to be repladed so that they are accessible from the webview
// https://github.com/podman-desktop/extension-template-full/blob/06de9b03db36eed6fca5a7cc8c87ea56c329746c/packages/backend/src/extension.ts#L32
const uriFixer =
  ({extensionContext, webView}) =>
  resourceContent => {
    const urisToReplace = [
      ...(resourceContent.match(/src="([^"]+)"/g) ?? []).map(uri =>
        uri.slice(5, -1)
      ),
      ...(resourceContent.match(/href="([^"]+)"/g) ?? []).map(uri =>
        uri.slice(6, -1)
      )
    ];
    for (const uri of urisToReplace) {
      const fixedUri = webView.asWebviewUri(
        extensionApi.Uri.joinPath(
          extensionContext.extensionUri,
          'dist',
          'browser',
          uri
        )
      );
      resourceContent = resourceContent.replace(uri, fixedUri);
    }
    return resourceContent;
  };

export const activate = async extensionContext => {
  const wvp = extensionApi.window.createWebviewPanel(
    'podmanDesktopAgent',
    'Podman Desktop Agent'
  );
  extensionContext.subscriptions.push(wvp);
  const loadResource = resourceLoader(extensionContext);
  const fixResource = uriFixer({extensionContext, webView: wvp.webview});
  wvp.webview.html = fixResource(await loadResource(indexPathSegments));
};

export const deactivate = () => {
  console.log('Stopping Podman Desktop Agent extension');
};
