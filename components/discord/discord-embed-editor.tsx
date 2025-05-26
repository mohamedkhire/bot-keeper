"use client"

import { useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { DiscordWebhookFormValues } from "./discord-webhook-config"

interface DiscordEmbedEditorProps {
  form: UseFormReturn<DiscordWebhookFormValues>
}

export function DiscordEmbedEditor({ form }: DiscordEmbedEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div className="space-y-4 border rounded-md p-4">
      <h3 className="text-lg font-medium mb-2">Embed Configuration</h3>

      <div className="grid gap-2">
        <Label htmlFor="embed_title">Embed Title</Label>
        <Input
          id="embed_title"
          placeholder="Status Update: {project_name}"
          {...form.register("embed_title")}
          className="bg-background"
        />
        <p className="text-xs text-muted-foreground">
          The title of the embed. You can use placeholders like {"{project_name}"}.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="embed_description">Embed Description</Label>
        <Textarea
          id="embed_description"
          placeholder="{status_emoji} **{project_name}** is now **{status}**"
          {...form.register("embed_description")}
          className="bg-background min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground">
          The description of the embed. You can use placeholders like {"{project_name}"}, {"{status}"}, and{" "}
          {"{status_emoji}"}.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="embed_color">Embed Color</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="embed_color"
            type="color"
            {...form.register("embed_color")}
            className="w-12 h-8 p-1 bg-background"
          />
          <Input
            value={form.watch("embed_color")}
            onChange={(e) => form.setValue("embed_color", e.target.value)}
            className="bg-background"
          />
        </div>
        <p className="text-xs text-muted-foreground">The color of the embed's left border</p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger>Advanced Embed Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="embed_thumbnail">Thumbnail URL</Label>
                <Input
                  id="embed_thumbnail"
                  placeholder="https://example.com/thumbnail.png"
                  {...form.register("embed_thumbnail")}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  URL to an image that will appear as a small thumbnail in the top right of the embed
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="embed_image">Image URL</Label>
                <Input
                  id="embed_image"
                  placeholder="https://example.com/image.png"
                  {...form.register("embed_image")}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  URL to an image that will appear as a large image in the embed
                </p>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">Author Configuration</h4>
                <div className="grid gap-2">
                  <Label htmlFor="embed_author_name">Author Name</Label>
                  <Input
                    id="embed_author_name"
                    placeholder="Bot Keeper"
                    {...form.register("embed_author_name")}
                    className="bg-background"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="embed_author_url">Author URL</Label>
                  <Input
                    id="embed_author_url"
                    placeholder="https://example.com"
                    {...form.register("embed_author_url")}
                    className="bg-background"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="embed_author_icon_url">Author Icon URL</Label>
                  <Input
                    id="embed_author_icon_url"
                    placeholder="https://example.com/icon.png"
                    {...form.register("embed_author_icon_url")}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="text-sm font-medium">Footer Configuration</h4>
                <div className="grid gap-2">
                  <Label htmlFor="embed_footer_text">Footer Text</Label>
                  <Input
                    id="embed_footer_text"
                    placeholder="Powered by Bot Keeper"
                    {...form.register("embed_footer_text")}
                    className="bg-background"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="embed_footer_icon_url">Footer Icon URL</Label>
                  <Input
                    id="embed_footer_icon_url"
                    placeholder="https://example.com/icon.png"
                    {...form.register("embed_footer_icon_url")}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
