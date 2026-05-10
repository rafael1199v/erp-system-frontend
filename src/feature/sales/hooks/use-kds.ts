import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import kdsApi from "../api/kdsApi";
import type { KdsTeam, KdsTeamItem, UpdateKdsItemStatusRequest } from "../types/kds";
import { normalizeCen } from "../utils/cen";

type UpdateKdsItemStatusMutationPayload = UpdateKdsItemStatusRequest & {
	ticketItemCen: string;
};

export const useKds = (companyCen: string | null) => {
	const normalizedCompanyCen = normalizeCen(companyCen);
	const queryClient = useQueryClient();

	const teamsQuery = useQuery({
		queryKey: ["sales-kds-teams", normalizedCompanyCen],
		queryFn: async () => {
			const response = await kdsApi.getTeamsByCompany(normalizedCompanyCen ?? "");
			return response.data;
		},
		enabled: normalizedCompanyCen !== null,
	});

	const teams = teamsQuery.data ?? ([] as KdsTeam[]);

	const teamItemsQueries = useQueries({
		queries: teams.map((team) => ({
			queryKey: ["sales-kds-team-items", normalizedCompanyCen, team.teamCen],
			queryFn: async () => {
				const response = await kdsApi.getTeamItems(normalizedCompanyCen ?? "", team.teamCen);
				return response.data;
			},
			enabled: normalizedCompanyCen !== null,
		})),
	});

	const itemsByTeamId = useMemo(() => {
		const mapped: Record<string, KdsTeamItem[]> = {};

		for (let i = 0; i < teams.length; i++) {
			mapped[teams[i].teamCen] = teamItemsQueries[i]?.data ?? [];
		}

		return mapped;
	}, [teams, teamItemsQueries]);

	const isLoadingItemsByTeamId = useMemo(() => {
		const mapped: Record<string, boolean> = {};

		for (let i = 0; i < teams.length; i++) {
			mapped[teams[i].teamCen] = teamItemsQueries[i]?.isLoading ?? false;
		}

		return mapped;
	}, [teams, teamItemsQueries]);

	const hasItemsErrorByTeamId = useMemo(() => {
		const mapped: Record<string, boolean> = {};

		for (let i = 0; i < teams.length; i++) {
			mapped[teams[i].teamCen] = teamItemsQueries[i]?.isError ?? false;
		}

		return mapped;
	}, [teams, teamItemsQueries]);

	const updateItemStatusMutation = useMutation({
		mutationFn: async (payload: UpdateKdsItemStatusMutationPayload) => {
			await kdsApi.updateTicketItemStatus(normalizedCompanyCen ?? "", payload.ticketItemCen, {
				status: payload.status,
			});
		},
		onMutate: async (payload) => {
			const previousItemsByTeamId: Record<string, KdsTeamItem[] | undefined> = {};

			for (let i = 0; i < teams.length; i++) {
				const teamCen = teams[i].teamCen;
				const queryKey = ["sales-kds-team-items", normalizedCompanyCen, teamCen] as const;

				await queryClient.cancelQueries({ queryKey });
				previousItemsByTeamId[teamCen] = queryClient.getQueryData<KdsTeamItem[]>(queryKey);

				queryClient.setQueryData<KdsTeamItem[]>(queryKey, (previous = []) => {
					return previous.map((item) => {
						if (item.ticketItemCen !== payload.ticketItemCen) {
							return item;
						}

						return {
							...item,
							status: payload.status,
						};
					});
				});
			}

			return { previousItemsByTeamId };
		},
		onError: (_error, _payload, context) => {
			if (!context?.previousItemsByTeamId) {
				return;
			}

			for (let i = 0; i < teams.length; i++) {
				const teamCen = teams[i].teamCen;
				const previous = context.previousItemsByTeamId[teamCen];
				if (!previous) {
					continue;
				}

				queryClient.setQueryData(["sales-kds-team-items", normalizedCompanyCen, teamCen], previous);
			}
		},
		onSettled: async () => {
			await Promise.all(
				teams.map((team) =>
					queryClient.invalidateQueries({
						queryKey: ["sales-kds-team-items", normalizedCompanyCen, team.teamCen],
					}),
				),
			);
		},
	});

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
		isUpdatingItemStatus: updateItemStatusMutation.isPending,
		updateItemStatus: async (payload: UpdateKdsItemStatusMutationPayload) => {
			await updateItemStatusMutation.mutateAsync(payload);
		},
	};
};
