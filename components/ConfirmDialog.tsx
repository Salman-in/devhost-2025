"use client";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";

type ConfirmDialogProps = {
  trigger: ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  cancelText?: string;
  onConfirm: () => void;
  className?: string;
  actionClassName?: string;
  cancelClassName?: string;
};

export default function ConfirmDialog({
  trigger,
  title,
  description,
  actionText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  className = "",
  actionClassName = "",
  cancelClassName = "",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <AlertDialogTrigger>{trigger}</AlertDialogTrigger>

      {/* Dialog */}
      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel className={cancelClassName}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={actionClassName}
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
