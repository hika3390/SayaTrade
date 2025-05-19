import { prisma } from "@/app/lib/prisma";
import { CompanyList } from "@/app/components/company-list";

export default async function Home() {
  // 企業一覧とそれに関連するペア情報を取得
  const companiesData = await prisma.company.findMany({
    include: {
      pairs: true,
    },
  });

  // Prismaから取得したデータを適切な形式に変換
  const companies = companiesData.map(company => ({
    id: company.id,
    name: company.name,
    pairs: company.pairs.map(pair => ({
      id: pair.id,
      name: pair.name,
      link: pair.link || undefined, // nullの場合はundefinedに変換
      buyShares: pair.buyShares,
      sellShares: pair.sellShares,
      buyPrice: pair.buyPrice,
      sellPrice: pair.sellPrice,
      companyId: pair.companyId
    }))
  }));

  return (
    <div className="min-h-screen bg-background">
      <CompanyList initialCompanies={companies} />
    </div>
  );
}
