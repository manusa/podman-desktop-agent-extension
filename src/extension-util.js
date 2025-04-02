const extensionApi = require('@podman-desktop/api');
const fs = require('node:fs');

export const resourceLoader = extensionContext => async pathSegments => {
  const resourceUri = extensionApi.Uri.joinPath(
    extensionContext.extensionUri,
    ...pathSegments
  );
  return fs.promises.readFile(resourceUri.fsPath, 'utf8');
};

// URLs for assets need to be replaced so that they are accessible from the webview
// https://github.com/podman-desktop/extension-template-full/blob/06de9b03db36eed6fca5a7cc8c87ea56c329746c/packages/backend/src/extension.ts#L32
export const uriFixer =
  ({extensionContext, basePathSegments, webView}) =>
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
          ...basePathSegments,
          uri
        )
      );
      resourceContent = resourceContent.replace(uri, fixedUri);
    }
    return resourceContent;
  };
