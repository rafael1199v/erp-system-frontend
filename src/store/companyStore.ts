import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { StorageEnum } from "#/enum";

type CompanyStore = {
	selectedCompanyId: string | null;
    selectedCompanyName: string | null;
	selectedCompanyImage: string | null;

	actions: {
		setSelectedCompanyId: (companyId: string) => void;
        setSelectedCompanyName: (companyName: string) => void;
		setSelectedCompanyImage: (companyImage: string) => void;

		clearSelectedCompanyId: () => void;
        clearSelectedCompanyName: () => void;
		clearSelectedCompanyImage: () => void;

		clearCompanyData: () => void;
	};
};

const useCompanyStore = create<CompanyStore>()(
	persist(
		(set) => ({
			selectedCompanyId: null,
            selectedCompanyName: null,
			selectedCompanyImage: null,
			actions: {
				setSelectedCompanyId: (companyId) => {
					set({ selectedCompanyId: companyId });
				},
				clearSelectedCompanyId() {
					set({ selectedCompanyId: null });
				},

                setSelectedCompanyName: (companyName) => {
                    set({ selectedCompanyName: companyName });
                },
                clearSelectedCompanyName() {
                    set({ selectedCompanyName: null});
                },
				setSelectedCompanyImage(companyImage) {
					set({ selectedCompanyImage: companyImage});
				},
				clearSelectedCompanyImage() {
					set({ selectedCompanyImage: null});
				},

				clearCompanyData() {
					set({ selectedCompanyId: null, selectedCompanyName: null, selectedCompanyImage: null });
				}
			},
		}),
		{
			name: "companyStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				[StorageEnum.CompanyId]: state.selectedCompanyId,
                [StorageEnum.CompanyName]: state.selectedCompanyName,
				[StorageEnum.CompanyImage]: state.selectedCompanyImage
			}),
		},
	),
);

export const useSelectedCompanyId = () => useCompanyStore((state) => state.selectedCompanyId);
export const useSelectedCompanyName = () => useCompanyStore((state) => state.selectedCompanyName);
export const useSelectedCompanyImage = () => useCompanyStore((state) => state.selectedCompanyImage);

export const useCompanyActions = () => useCompanyStore((state) => state.actions);

export default useCompanyStore;
