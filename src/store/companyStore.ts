import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { StorageEnum } from "#/enum";

type CompanyStore = {
	selectedCompanyCen: string | null;
	selectedCompanyName: string | null;
	selectedCompanyImage: string | null;

	actions: {
		setSelectedCompanyCen: (companyCen: string) => void;
		setSelectedCompanyName: (companyName: string) => void;
		setSelectedCompanyImage: (companyImage: string) => void;

		clearSelectedCompanyCen: () => void;
		clearSelectedCompanyName: () => void;
		clearSelectedCompanyImage: () => void;

		clearCompanyData: () => void;
	};
};

const useCompanyStore = create<CompanyStore>()(
	persist(
		(set) => ({
			selectedCompanyCen: null,
			selectedCompanyName: null,
			selectedCompanyImage: null,
			actions: {
				setSelectedCompanyCen: (companyCen) => {
					set({ selectedCompanyCen: companyCen });
				},
				clearSelectedCompanyCen() {
					set({ selectedCompanyCen: null });
				},

				setSelectedCompanyName: (companyName) => {
					set({ selectedCompanyName: companyName });
				},
				clearSelectedCompanyName() {
					set({ selectedCompanyName: null });
				},
				setSelectedCompanyImage(companyImage) {
					set({ selectedCompanyImage: companyImage });
				},
				clearSelectedCompanyImage() {
					set({ selectedCompanyImage: null });
				},

				clearCompanyData() {
					set({ selectedCompanyCen: null, selectedCompanyName: null, selectedCompanyImage: null });
				},
			},
		}),
		{
			name: "companyStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				[StorageEnum.CompanyCen]: state.selectedCompanyCen,
				[StorageEnum.CompanyName]: state.selectedCompanyName,
				[StorageEnum.CompanyImage]: state.selectedCompanyImage,
			}),
		},
	),
);

export const useSelectedCompanyCen = () => useCompanyStore((state) => state.selectedCompanyCen);
export const useSelectedCompanyId = () => useCompanyStore((state) => state.selectedCompanyCen);
export const useSelectedCompanyName = () => useCompanyStore((state) => state.selectedCompanyName);
export const useSelectedCompanyImage = () => useCompanyStore((state) => state.selectedCompanyImage);

export const useCompanyActions = () => useCompanyStore((state) => state.actions);

export default useCompanyStore;
