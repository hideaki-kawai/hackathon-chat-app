import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  ignoredRouteFiles: ["**/*.test.*"], // 無視するファイルパターンを設定
}) satisfies RouteConfig;
