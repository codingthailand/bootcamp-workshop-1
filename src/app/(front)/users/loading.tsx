import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="flex items-center justify-center h-72">
      <Spinner className="size-16" />
    </main>
  );
}
