import { CompanyCard } from "@/app/components/company-card";
import { Company } from "@/app/types";

interface CompanyListGridProps {
  companies: Company[];
  onShowPairs: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (id: number) => void;
}

export function CompanyListGrid({ 
  companies, 
  onShowPairs, 
  onEdit, 
  onDelete 
}: CompanyListGridProps) {
  return (
    <div className="grid gap-4">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onShowPairs={onShowPairs}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
