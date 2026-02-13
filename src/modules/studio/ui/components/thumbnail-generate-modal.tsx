import { z } from "zod";
import { ResponsiveModal } from "@/components/responsive-modal";
import { trpc } from "@/trpc/client";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  prompt: z.string().min(10),
});

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailGenerateModalProps) => {

  const utils = trpc.useUtils();

  /* -------- GET VIDEO (for updatedAt tracking) -------- */
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });

  /* -------- MUTATION -------- */
  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: async () => {
      toast.success("Generating thumbnail in background...");

      const before = video[0]?.updatedAt;

      let attempts = 0;

      const interval = setInterval(async () => {
        attempts++;

        const fresh = await utils.studio.getOne.fetch({ id: videoId });
        const after = fresh[0]?.updatedAt;

        if (after && before && new Date(after).getTime() !== new Date(before).getTime()) {
          clearInterval(interval);

          await utils.studio.getOne.invalidate({ id: videoId });
          await utils.studio.getMany.invalidate();

          toast.success("Thumbnail generated!");
          onOpenChange(false);
        }

        if (attempts > 20) clearInterval(interval);
      }, 3000);
    },
  });

  /* -------- FORM -------- */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate({
      id: videoId,
      prompt: values.prompt,
    });
  };

  return (
    <ResponsiveModal
      title="Generate AI Thumbnail"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="resize-none"
                    rows={5}
                    placeholder="Describe the thumbnail you want..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={generateThumbnail.isPending}>
              {generateThumbnail.isPending ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
