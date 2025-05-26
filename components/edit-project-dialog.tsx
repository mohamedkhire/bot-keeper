"use client"

import type React from "react"

import { type FC, useState } from "react"
import Image from "next/image"
import { Check } from "lucide-react"

import { type IconType, ProjectIcon } from "@/components/project-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Project = {
  id: string
  name: string
  url: string
  description?: string
  iconType?: IconType
  iconUrl?: string
}

interface EditProjectDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updates: Partial<Project>) => void
}

export const EditProjectDialog: FC<EditProjectDialogProps> = ({ project, open, onOpenChange, onSave }) => {
  const [activeTab, setActiveTab] = useState("general")
  const [formData, setFormData] = useState({
    name: project.name,
    url: project.url,
    description: project.description || "",
    iconType: project.iconType || "globe",
    iconUrl: project.iconUrl || "",
  })

  const [iconOption, setIconOption] = useState<"predefined" | "custom">(
    project.iconType === "custom" ? "custom" : "predefined",
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Prepare the updates
    const updates: Partial<Project> = {
      name: formData.name,
      url: formData.url,
      description: formData.description,
    }

    // Add icon information based on the selected option
    if (iconOption === "custom" && formData.iconUrl) {
      updates.iconType = "custom"
      updates.iconUrl = formData.iconUrl
    } else {
      updates.iconType = formData.iconType as IconType
      updates.iconUrl = undefined
    }

    onSave(updates)
  }

  const iconTypes: IconType[] = ["file", "globe", "server", "code", "database", "bot", "zap", "activity"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details and settings.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="general" className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url">Project URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="bg-background"
                />
              </div>

              <div className="grid gap-2">
                <Label>Project Icon</Label>
                <RadioGroup
                  value={iconOption}
                  onValueChange={(value) => setIconOption(value as "predefined" | "custom")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="predefined" id="predefined" />
                    <Label htmlFor="predefined">Use predefined icon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Use custom icon URL</Label>
                  </div>
                </RadioGroup>
              </div>

              {iconOption === "predefined" ? (
                <div className="grid gap-2">
                  <Label>Select an icon</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconTypes.map((type) => (
                      <div
                        key={type}
                        className={`
                          p-2 border rounded-md cursor-pointer flex items-center justify-center
                          ${formData.iconType === type ? "border-primary bg-primary/10" : "border-border"}
                        `}
                        onClick={() => setFormData({ ...formData, iconType: type })}
                      >
                        <div className="relative">
                          <ProjectIcon type={type} size={32} />
                          {formData.iconType === type && (
                            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="iconUrl">Custom Icon URL</Label>
                  <Input
                    id="iconUrl"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    placeholder="https://example.com/icon.png"
                    className="bg-background"
                  />
                  {formData.iconUrl && (
                    <div className="mt-2 flex items-center">
                      <div className="mr-2">Preview:</div>
                      <div className="w-8 h-8 rounded-md overflow-hidden">
                        <Image
                          src={formData.iconUrl || "/placeholder.svg"}
                          alt="Icon preview"
                          width={32}
                          height={32}
                          className="object-cover"
                          onError={(e) => {
                            // Handle image load error
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23f87171' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'%3E%3C/path%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'%3E%3C/path%3E%3Cline x1='4' y1='4' x2='20' y2='20'%3E%3C/line%3E%3C/svg%3E"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
