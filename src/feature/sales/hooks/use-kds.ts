import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import kdsApi from "../api/kdsApi";
import type { KdsTeam, KdsTeamItem } from "../types/kds";

export const useKds = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;

	const teamsQuery = useQuery({
		queryKey: ["sales-kds-teams", normalizedCompanyId],
		queryFn: async () => {
			const response = await kdsApi.getTeamsByCompany(normalizedCompanyId);
			return response.data;
		},
		enabled: normalizedCompanyId > 0,
	});

	const teams = teamsQuery.data ?? ([] as KdsTeam[]);

	const teamItemsQueries = useQueries({
		queries: teams.map((team) => ({
			queryKey: ["sales-kds-team-items", normalizedCompanyId, team.id],
			queryFn: async () => {
				const response = await kdsApi.getTeamItems(normalizedCompanyId, team.id);
				return response.data;
			},
			enabled: normalizedCompanyId > 0,
		})),
	});

	const itemsByTeamId = useMemo(() => {
		const mapped: Record<number, KdsTeamItem[]> = {};

		for (let i = 0; i < teams.length; i++) {
			mapped[teams[i].id] = teamItemsQueries[i]?.data ?? [];
		}

		return mapped;
	}, [teams, teamItemsQueries]);

	const isLoadingItemsByTeamId = useMemo(() => {
		const mapped: Record<number, boolean> = {};

		for (let i = 0; i < teams.length; i++) {
			mapped[teams[i].id] = teamItemsQueries[i]?.isLoading ?? false;
		}

		return mapped;
	}, [teams, teamItemsQueries]);

	const hasItemsErrorByTeamId = useMemo(() => {
		const mapped: Record<number, boolean> = {};

		for (let i = 0; i < teams.length; i++) {
			mapped[teams[i].id] = teamItemsQueries[i]?.isError ?? false;
		}

		return mapped;
	}, [teams, teamItemsQueries]);

	const refreshAll = async () => {
		await teamsQuery.refetch();
		await Promise.all(teamItemsQueries.map((query) => query.refetch()));
	};

	return {
		teams,
		itemsByTeamId,
		isLoadingTeams: teamsQuery.isLoading,
		hasTeamsError: teamsQuery.isError,
		isRefreshingAll: teamsQuery.isFetching || teamItemsQueries.some((query) => query.isFetching),
		isLoadingItemsByTeamId,
		hasItemsErrorByTeamId,
		refreshAll,
	};
};
