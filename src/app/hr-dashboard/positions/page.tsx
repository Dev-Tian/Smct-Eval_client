"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { toastMessages } from "@/lib/toastMessages";
import apiService from "@/lib/apiService";
import AddPositionModal from "@/components/hr/AddPositionModal";
import DeletePositionModal, { Position } from "@/components/hr/DeletePositionModal";
import EvaluationsPagination from "@/components/paginationComponent";

export default function PositionsTab() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPositions = async () => {
    setLoading(true);
    try {
      const res = await apiService.getPositions();
      const normalized: Position[] = (res || []).map((p: any) => ({
        id: Number(p.value),
        label: String(p.label ?? ""),
      }));
      setPositions(normalized);
    } catch (error) {
      console.error("Error loading positions:", error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshPositions = async () => {
    setIsRefreshing(true);
    try {
      await loadPositions();
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPositions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return positions;
    return positions.filter((p) => p.label?.toLowerCase().includes(q) || String(p.id) === q);
  }, [positions, searchTerm]);

  const total = filteredPositions.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredPositions.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="relative overflow-y-auto pr-2 min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Positions</CardTitle>
            <CardDescription>Loading positions...</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative overflow-y-auto pr-2 min-h-[400px]">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center gap-4">
            <div className="w-1/2">
              <CardTitle>Positions</CardTitle>
              <CardDescription>Manage job positions</CardDescription>
              <div className="relative flex-1 mt-4">
                <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">🔎</span>
                <Input
                  placeholder="Search by position label"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 cursor-pointer hover:scale-110 transition-transform duration-200"
              >
                <Plus className="h-5 w-5" />
                Add Position
              </Button>
              <Button
                variant="outline"
                onClick={refreshPositions}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer hover:scale-110 transition-transform duration-200"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isRefreshing && (
            <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center pointer-events-none z-10">
              <div className="flex flex-col items-center gap-3 bg-white/95 px-8 py-6 rounded-lg shadow-lg">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          )}

          <div className="space-y-3">
            {paginated.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No positions found.</div>
            ) : (
              paginated.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border rounded-lg px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-gray-900">{p.label || "N/A"}</div>
                    <div className="text-xs text-gray-500">ID: {p.id}</div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setPositionToDelete(p);
                      setIsDeleteModalOpen(true);
                    }}
                    className="flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform duration-200"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <EvaluationsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              perPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </CardContent>
      </Card>

      <AddPositionModal
        open={isAddModalOpen}
        onOpenChangeAction={setIsAddModalOpen}
        onAdded={refreshPositions}
      />

      <DeletePositionModal
        open={isDeleteModalOpen}
        onOpenChangeAction={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setPositionToDelete(null);
        }}
        positionToDelete={positionToDelete}
        onDeleted={async () => {
          setPositionToDelete(null);
          await refreshPositions();
        }}
        onDeletingChange={setIsDeleting}
      />
    </div>
  );
}

