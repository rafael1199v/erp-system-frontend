import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import kdsApi from "../api/kdsApi";
import { getOrderDetailStatusLabel } from "../enums/kds";
import type { UpdateOrderDetailStatusRequest } from "../types/order-detail";
import type { KdsTeam, KdsTeamItem } from "../types/kds";

export const useKds = (companyId: number | null) => {
	const normalizedCompanyId = companyId ?? -1;
	const queryClient = useQueryClient();

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

	const updateItemStatusMutation = useMutation({
		mutationFn: async (payload: UpdateOrderDetailStatusRequest) => {
			await kdsApi.updateRestaurantOrderDetailStatus(payload);
		},
		onMutate: async (payload) => {
			const previousItemsByTeamId: Record<number, KdsTeamItem[] | undefined> = {};

			for (let i = 0; i < teams.length; i++) {
				const teamId = teams[i].id;
				const queryKey = ["sales-kds-team-items", normalizedCompanyId, teamId] as const;

				await queryClient.cancelQueries({ queryKey });
				previousItemsByTeamId[teamId] = queryClient.getQueryData<KdsTeamItem[]>(queryKey);

				queryClient.setQueryData<KdsTeamItem[]>(queryKey, (previous = []) => {
					return previous.map((item) => {
						if (item.restaurantOrderDetailId !== payload.restaurantOrderDetailId) {
							return item;
						}

						return {
							...item,
							orderItemStatusId: payload.newStatusId,
							orderItemStatus: getOrderDetailStatusLabel(payload.newStatusId, item.orderItemStatus),
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
				const teamId = teams[i].id;
				const previous = context.previousItemsByTeamId[teamId];
				if (!previous) {
					continue;
				}

				queryClient.setQueryData(["sales-kds-team-items", normalizedCompanyId, teamId], previous);
			}
		},
		onSettled: async () => {
			await Promise.all(
				teams.map((team) =>
					queryClient.invalidateQueries({
						queryKey: ["sales-kds-team-items", normalizedCompanyId, team.id],
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
		updateItemStatus: async (payload: UpdateOrderDetailStatusRequest) => {
			await updateItemStatusMutation.mutateAsync(payload);
		},
	};
};
