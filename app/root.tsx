/* eslint-disable filename-rules/match */
import type { MetaFunction, LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch } from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Card } from "flowbite-react";
import { getReasonPhrase } from "http-status-codes";

import { GlobalContext } from "./components/global-context.shared";
import { translateIntoHttpError } from "./http-error";
import styles from "./styles/app.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Hocus",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: "/devicon.min.css" },
    { rel: "stylesheet", href: "/font-awesome/css/all.min.css" },
    { rel: "stylesheet", href: styles },
    /* Must be the last entry to prevent a flash of unstyled content. Based on https://stackoverflow.com/a/43823506 */
    { rel: "stylesheet", href: "/unstyled-content.css" },
  ];
};

export const loader = async (args: LoaderArgs) => {
  return json({
    csrfToken: args.context.req.csrfToken(),
    gaUserId: args.context.user?.gaUserId,
    userEmail: args.context.oidcUser?.email,
  });
};

function App({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html className="dark h-full" lang="en">
      <head>
        {/* Prevents a flash of unstyled content. Based on https://stackoverflow.com/a/43823506 */}
        <style>{"html { display: none; }"}</style>
        <Meta />
        <Links />
      </head>
      <body className="h-full flex flex-col dark:bg-gray-800 dark:text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function Root() {
  const { gaUserId, csrfToken, userEmail } = useLoaderData<typeof loader>();
  return (
    <GlobalContext.Provider value={{ gaUserId, csrfToken, userEmail }}>
      <App>
        <Outlet />
      </App>
    </GlobalContext.Provider>
  );
}

function ErrorCard(props: { status: number; statusText: string }) {
  const originalStatusText = getReasonPhrase(props.status);
  const extraText = originalStatusText !== props.statusText ? originalStatusText : void 0;
  return (
    <App>
      <div className="h-full flex flex-col justify-center items-center">
        <Card className="min-h-[15rem] w-96 text-center">
          <div>
            <h1 className="text-4xl font-bold">{props.status}</h1>
            {extraText && <h2 className="text-xs text-gray-400 mt-2">{extraText}</h2>}
          </div>
          <p className="text-gray-300">{props.statusText}</p>
        </Card>
      </div>
    </App>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorCard status={caught.status} statusText={caught.statusText} />;
}

export function ErrorBoundary(args: { error: unknown }) {
  const httpError = translateIntoHttpError(args.error);
  return <ErrorCard status={httpError.status} statusText={httpError.statusText} />;
}
