export const ROUTES = [
  {
    key: "members",
    title: "Members",
    match: (pathname) => pathname.startsWith("/projects/console/members"),
  },
  {
    key: "logs",
    title: "Audit Logs",
    match: (pathname) => pathname.startsWith("/projects/console/audit_logs"),
  },
  {
    key: "contacts",
    title: "Contacts",
    match: (pathname) => pathname.startsWith("/projects/console/contacts"),
  },
  {
    key: "importsPreview",
    title: "Imports Preview",

    match: (pathname) => pathname.startsWith("/projects/console/imports/preview"),
  },
  {
    key: "imports",
    title: "Imports",

    match: (pathname) => pathname.startsWith("/projects/console/imports"),
  },
  {
    key: "dashboard",
    title: "Dashboard",
    match: (pathname) =>
      pathname === "/projects/console/" ||
      pathname.startsWith("/projects/console/"),
  },
];


export function resolveRoute(pathname) {
  return ROUTES.find((route) => route.match(pathname)) ?? null;
}

export function getRouteKey(pathname) {
  return resolveRoute(pathname)?.key ?? null;
}

export function getRouteTitle(pathname) {
  return resolveRoute(pathname)?.title ?? "Dashboard";
}
