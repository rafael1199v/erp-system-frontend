import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import companyService from "@/api/services/companyService";
import { SelectInv } from "@/components/select-inv";
import SimpleLayout from "@/layouts/simple";
import { useCompanyActions } from "@/store/companyStore";
import type { Company } from "@/types/company";
import type { SelectOption } from "@/types/options";
import { Button } from "@/ui/button";

// import { Title } from "@/ui/typography";

function CompanyPage() {
	const navigate = useNavigate();
	const { setSelectedCompanyCen, setSelectedCompanyName } = useCompanyActions();

	const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
	const [companies, setCompanies] = useState<Company[]>([]);

	useEffect(() => {
		const fetchCompanies = async () => {
			try {
				const companies = await companyService.getCompanies();
				console.log("Fetched companies:", companies.data);
				setCompanies(companies.data);
			} catch (error) {
				console.error("Error fetching companies:", error);
			}
		};

		fetchCompanies();
	}, []);

	return (
		<SimpleLayout>
			<div className="flex w-full flex-col h-full items-center justify-center p-4">
				<div className="flex flex-col gap-8 p-20 shadow-lg rounded-3xl">
					<h1 className="text-center text-5xl font-bold">Bienvenido</h1>

					<SelectInv
						options={companies.map((option) => {
							const selectOption: SelectOption = {
								key: option.companyCen,
								value: option.name,
							};

							return selectOption;
						})}
						label="Selecciona una compañia"
						onChange={(value) => {
							setSelectedCompany(value);
						}}
					/>
					<Button
						className="w-full cursor-pointer"
						onClick={() => {
							if (!selectedCompany) return;
							setSelectedCompanyCen(selectedCompany);
							setSelectedCompanyName(
								companies.find((company) => company.companyCen === selectedCompany)?.name || "Default",
							);
							navigate("/analysis");
						}}
						disabled={!selectedCompany}
					>
						Confirm
					</Button>
				</div>
			</div>
		</SimpleLayout>
	);
}

export default CompanyPage;
