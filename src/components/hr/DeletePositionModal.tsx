"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastMessages } from "@/lib/toastMessages";
import apiService from "@/lib/apiService";
import LoadingAnimation from "@/components/LoadingAnimation";

export type Position = { id: number; label: string };

export interface DeletePositionModalProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  positionToDelete: Position | null;
  onDeleted?: () => void | Promise<void>;
  /** Keeps the "Delete" button state in the table in sync. */
  onDeletingChange?: (isDeleting: boolean) => void;
}

export default function DeletePositionModal({
  open,
  onOpenChangeAction,
  positionToDelete,
  onDeleted,
  onDeletingChange,
}: DeletePositionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsDeleting(false);
      onDeletingChange?.(false);
    }
  }, [open, onDeletingChange]);

  const handleDelete = async () => {
    if (!positionToDelete) return;

    setIsDeleting(true);
    onDeletingChange?.(true);
    try {
      await apiService.deletePosition(positionToDelete.id);
      toastMessages.generic.success(
        "Position Deleted",
        `"${positionToDelete.label}" has been deleted.`
      );

      await onDeleted?.();
      onOpenChangeAction(false);
    } catch (error: any) {
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete position.";
      toastMessages.generic.error("Error", backendMsg);
    } finally {
      setIsDeleting(false);
      onDeletingChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChangeAction={onOpenChangeAction}>
      <DialogContent className="max-w-md w-[90vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-red-700 border border-red-100">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Delete Position
              </DialogTitle>
              <DialogDescription className="text-gray-700">
                {positionToDelete ? (
                  <>
                    This will permanently remove{" "}
                    <span className="font-semibold text-red-700">
                      {positionToDelete.label}
                    </span>{" "}
                    (ID: <span className="font-mono text-xs">{positionToDelete.id}</span>).
                    <span className="block mt-2 text-xs text-gray-500">
                      You cannot undo this action.
                    </span>
                  </>
                ) : (
                  <>Are you sure you want to delete this position?</>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isDeleting}
            className="px-6 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer px-6 hover:scale-110 transition-transform duration-200"
            onClick={handleDelete}
            disabled={isDeleting || !positionToDelete}
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2">
                <LoadingAnimation size="sm" variant="spinner" color="white" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

