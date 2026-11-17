import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/previas")({
  beforeLoad: () => {
    throw redirect({ to: "/free" });
  },
  component: () => null,
});
