import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

export function useDeleteTransaction() {
    const [deleteId, setDeleteId] = useState<Id<"transactions"> | null>(null);

    const deleteTransaction = useMutation(api.transactions.remove);

    const handleDelete = async () => {
        try {
            if (!deleteId) return;
            await deleteTransaction({ id: deleteId });
            setDeleteId(null);
        } catch (error) {
            console.log('Failed to delete transaction', { error })
        }
    };

    return {
        deleteId,
        setDeleteId,
        handleDelete
    };
}