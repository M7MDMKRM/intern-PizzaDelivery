import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "../services/adminService";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminService.getStats,
    refetchInterval: 30000,
  });
}

export function useAdminBranches() {
  return useQuery({
    queryKey: ["admin-branches"],
    queryFn: adminService.getBranches,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminService.createBranch(data),
    onSuccess: () => {
      toast.success("تم إضافة الفرع بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل إضافة الفرع");
    },
  });
}

export function useUpdateBranchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminService.updateBranchStatus(id, isActive),
    onSuccess: () => {
      toast.success("تم تحديث حالة الفرع بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "فشل تحديث حالة الفرع");
    },
  });
}
