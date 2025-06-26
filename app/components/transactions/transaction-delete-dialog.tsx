import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Id } from "convex/_generated/dataModel";
import { Dispatch, SetStateAction } from "react";

export function TransactionDeleteDialog({
    deleteId,
    setDeleteId,
    handleDelete
}: {
    deleteId: Id<"transactions"> | null,
    setDeleteId: Dispatch<SetStateAction<Id<"transactions"> | null>>;
    handleDelete: () => Promise<void>
}) {
    return <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Are you sure to delete the transaction?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently remove this transaction data.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
                <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}