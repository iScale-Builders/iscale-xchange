"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

import { RiPencilLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const EditProjectForm = dynamic(
  () => import("./edit-project-form").then((mod) => mod.EditProjectForm),
  {
    ssr: false,
    loading: () => <div className="text-muted-foreground py-8 text-center text-sm">Loading...</div>,
  },
)

interface EditButtonProps {
  projectId: string
  initialName: string
  initialWebsiteUrl: string
  initialLogoUrl: string
  initialProductImage: string | null
  initialCoverImage: string | null
  initialGalleryImages: string[] | null
  initialDescription: string
  initialCategories: { id: string; name: string }[]
  initialAvailability: string
  initialHidden: boolean
  isOwner: boolean
}

export function EditButton({
  projectId,
  initialName,
  initialWebsiteUrl,
  initialLogoUrl,
  initialProductImage,
  initialCoverImage,
  initialGalleryImages,
  initialDescription,
  initialCategories,
  initialAvailability,
  initialHidden,
  isOwner,
}: EditButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!isOwner) {
    return null
  }

  const handleUpdate = () => {
    // Fermer le dialogue et rafraîchir la page pour afficher les changements
    setIsDialogOpen(false)
    window.location.reload()
  }

  return (
    <>
      <Button variant="outline" size="sm" className="h-9" onClick={() => setIsDialogOpen(true)}>
        <RiPencilLine className="mr-1 h-4 w-4" />
        Edit Project Details
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Project Information</DialogTitle>
          </DialogHeader>

          <EditProjectForm
            projectId={projectId}
            initialName={initialName}
            initialWebsiteUrl={initialWebsiteUrl}
            initialLogoUrl={initialLogoUrl}
            initialProductImage={initialProductImage}
            initialCoverImage={initialCoverImage}
            initialGalleryImages={initialGalleryImages}
            initialDescription={initialDescription}
            initialCategories={initialCategories}
            initialAvailability={initialAvailability}
            initialHidden={initialHidden}
            onUpdate={handleUpdate}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
