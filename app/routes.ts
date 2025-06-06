import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

/**
 * @returns ルート
 */
export default flatRoutes({
  ignoredRouteFiles: ["**/*.test.*"],
}) satisfies RouteConfig;
