import { DomainList } from "@/components/domains/DomainList";
import { AddDomainButton } from "@/components/domains/AddDomainButton";

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Domains</h2>
          <p className="text-muted-foreground">Manage custom domains</p>
        </div>
        <AddDomainButton />
      </div>
      <DomainList />
    </div>
  );
}
