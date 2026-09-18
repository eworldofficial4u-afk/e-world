import { serveSecuredStaffAsset } from "./_lib/staff-response.js";

export function onRequest(context) {
  const assetUrl = new URL(context.request.url);
  assetUrl.pathname = "/staff-panel-page.txt";

  return serveSecuredStaffAsset(context, {
    request: new Request(assetUrl, context.request),
  });
}
