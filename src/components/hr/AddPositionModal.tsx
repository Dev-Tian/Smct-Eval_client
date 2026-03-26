"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export interface AddPositionModalProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  /** Called after a position is added successfully (e.g. refresh list). */
  onAdded?: () => void | Promise<void>;
}

export default function AddPositionModal({
  open,
  onOpenChangeAction,
  onAdded,
}: AddPositionModalProps) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationDialogMessage, setValidationDialogMessage] = useState("");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successLabel, setSuccessLabel] = useState("");

  useEffect(() => {
    if (!open) {
      setLabel("");
      setError("");
    }
  }, [open]);

  const validate = () => {
    if (!label.trim()) {
      setError("Position label is required.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setValidationDialogMessage("Position label is required.");
      setIsValidationDialogOpen(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const trimmed = label.trim();
      // Ensure the loading state feels consistent for users.
      await Promise.all([
        apiService.addPosition(trimmed),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      setSuccessLabel(trimmed);
      setIsSuccessDialogOpen(true);
      await onAdded?.();
      onOpenChangeAction(false);
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
      const backendMsg =
        anyErr?.response?.data?.message ||
        anyErr?.response?.data?.error ||
        anyErr?.message ||
        "Failed to add position.";
      toastMessages.generic.error("Error", backendMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChangeAction={onOpenChangeAction}>
        <DialogContent className="max-w-md w-[90vw] sm:w-full px-6 py-6 relative">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add Position
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter the name of the job position you want to add to the list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="position_label"
              className="text-sm font-medium text-gray-700"
            >
              Position label <span className="text-red-600">*</span>
            </label>
            <Input
              id="position_label"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (error) setError("");
              }}
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitting) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="e.g. Branch Manager"
              className="mt-2"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-2">
              This will appear in the HR Positions list.
            </p>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        {isSubmitting && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center z-20 rounded-md">
            <div className="bg-white/95 border border-green-200 shadow-lg rounded-xl px-6 py-5 flex flex-col items-center gap-3">
              <LoadingAnimation
                size="lg"
                variant="spinner"
                color="green"
                showText={true}
                text="Adding position..."
              />
              <p className="text-xs text-gray-500 text-center">
                Please wait while we add the new position.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            disabled={isSubmitting}
            className="px-6 bg-red-600 hover:bg-red-700 text-white hover:text-white cursor-pointer hover:scale-110 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6 hover:scale-110 transition-all duration-200"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation error dialog (shown when user clicks Add with empty input) */}
      <Dialog
        open={isValidationDialogOpen}
        onOpenChangeAction={setIsValidationDialogOpen}
      >
        <DialogContent className="max-w-sm w-[90vw] px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">
              Can't add position
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              {validationDialogMessage || "Position label is required."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center mt-4">
            <img
              src="/no-data.gif"
              alt="Validation error"
              className="w-28 h-auto"
            />
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer px-6 hover:scale-110 transition-all duration-200"
              onClick={() => setIsValidationDialogOpen(false)}
              disabled={isSubmitting}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success dialog (shown when add succeeds) */}
      <Dialog open={isSuccessDialogOpen} onOpenChangeAction={setIsSuccessDialogOpen}>
        <DialogContent className="max-w-sm w-[90vw] px-6 py-6">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-green-50 text-green-700 border border-green-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Position Added
                </DialogTitle>
                <DialogDescription className="text-gray-700">
                  <span className="font-semibold text-green-700">
                    {successLabel}
                  </span>{" "}
                  has been added to the HR Positions list.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="border-t border-gray-200 pt-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white cursor-pointer px-6 hover:scale-110 transition-all duration-200"
              onClick={() => setIsSuccessDialogOpen(false)}
              disabled={isSubmitting}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
