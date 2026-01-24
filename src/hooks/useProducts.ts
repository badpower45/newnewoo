import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product } from '../../types';

type ProductsResult = {
    data: Product[];
    page: number;
    total: number;
};

type UseProductsOptions = {
    branchId?: number;
    category?: string;
    page?: number;
    limit?: number;
    enabled?: boolean;
};

export function useProducts(options: UseProductsOptions = {}) {
    const {
        branchId = 1,
        category = '',
        page = 1,
        limit = 20,
        enabled = true
    } = options;

    return useQuery<ProductsResult>({
        queryKey: ['products', { branchId, category, page, limit }],
        queryFn: async () => {
            let response;
            if (category) {
                const offset = (page - 1) * limit;
                response = await api.products.getByCategory(category, branchId, limit, offset);
            } else {
                response = await api.products.getAllByBranch(branchId, { limit, page });
            }

            const data = Array.isArray((response as any)?.data)
                ? (response as any).data
                : (Array.isArray(response) ? response : []);
            const total = (response as any)?.pagination?.total ?? (response as any)?.total ?? data.length;
            const resolvedPage = (response as any)?.pagination?.page ?? (response as any)?.page ?? page;

            return {
                data,
                page: resolvedPage,
                total
            };
        },
        staleTime: 300000,
        enabled
    });
}
