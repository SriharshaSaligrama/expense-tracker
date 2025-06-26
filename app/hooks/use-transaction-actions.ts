import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteTransaction() {
    const [deleteId, setDeleteId] = useState<Id<"transactions"> | null>(null);

    const deleteTransaction = useMutation(api.transactions.remove);

    const handleDelete = async () => {
        try {
            if (!deleteId) throw new Error("No transaction ID provided for deletion");
            await deleteTransaction({ id: deleteId });
            toast.success("Transaction deleted successfully");
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to delete transaction");
            console.log('Failed to delete transaction', { error })
        }
    };

    return {
        deleteId,
        setDeleteId,
        handleDelete
    };
}