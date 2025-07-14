import { Hono } from "hono";
import Index from "./pages";
import { TrackPage } from "./pages/track";

export async function mapUIRoutes(hono: Hono) {
  hono.get('/', (c) => {
    return c.html(<Index />);
  });
  hono.get('/track', (c) => {
    return c.html(<TrackPage />);
  });
}