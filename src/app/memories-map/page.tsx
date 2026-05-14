import { redirect } from "next/navigation";
import { MemoryMap } from "@/components/memories/MemoryMap";
import { getCurrentCoupleId } from "@/lib/couple-session";

export default async function MemoriesMapPage() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) redirect("/auth");

  return <MemoryMap />;
}
