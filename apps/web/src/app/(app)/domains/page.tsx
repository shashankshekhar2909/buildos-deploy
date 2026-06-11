import { DomainList } from "@/components/domains/DomainList";
import { AddDomainButton } from "@/components/domains/AddDomainButton";

export default function DomainsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Domains</h1>
          <p className="page-desc">Manage custom domains and SSL</p>
        </div>
        <AddDomainButton />
      </div>
      <DomainList />
    </div>
  );
}
