"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const projectFormSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  checkInterval: z.coerce.number().min(1, {
    message: "Check interval must be at least 1 minute.",
  }),
  active: z.boolean().default(true),
  discordWebhookEnabled: z.boolean().default(false),
  discordWebhookUrl: z
    .string()
    .url({
      message: "Please enter a valid Discord webhook URL.",
    })
    .optional()
    .or(z.literal("")),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>
  onSubmit: (values: ProjectFormValues) => Promise<void>
  isEditing?: boolean
}

export function ProjectForm({ defaultValues, onSubmit, isEditing = false }: ProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      url: "",
      checkInterval: 5,
      active: true,
      discordWebhookEnabled: false,
      discordWebhookUrl: "",
      ...defaultValues,
    },
  })

  async function handleSubmit(values: ProjectFormValues) {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      toast({
        title: isEditing ? "Project updated" : "Project created",
        description: isEditing
          ? "Your project has been updated successfully."
          : "Your new project has been created and is now being monitored.",
      })
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error submitting project:", error)
      toast({
        title: "Error",
        description: "There was an error saving your project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Project" : "Create New Project"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update your monitoring project settings." : "Add a new website or API endpoint to monitor."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Website" {...field} />
                      </FormControl>
                      <FormDescription>A descriptive name for your monitoring project.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>The URL of the website or API endpoint to monitor.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check Interval (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormDescription>How often to check if the URL is up.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Monitoring</FormLabel>
                        <FormDescription>Enable or disable monitoring for this project.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4 pt-4">
                <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Project-specific notifications will override global notification settings.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="discordWebhookEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Discord Notifications</FormLabel>
                        <FormDescription>Send status change notifications to a Discord channel.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("discordWebhookEnabled") && (
                  <FormField
                    control={form.control}
                    name="discordWebhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discord Webhook URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://discord.com/api/webhooks/..." {...field} />
                        </FormControl>
                        <FormDescription>The Discord webhook URL to send notifications to.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>
            </Tabs>

            <CardFooter className="flex justify-between px-0">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
