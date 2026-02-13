"use client";
import {videos} from "@/db/schema"
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlayIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrashIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { videoUpdateSchema } from "@/db/schema";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { snakesCaseToTitle } from "@/lib/utils";
import Image from "next/image";
import { THUMBNAIL_FALLBACK_URL } from "@/modules/videos/constants";
import { Thumb } from "@radix-ui/react-scroll-area";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";


interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <FormSectionSuspence videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return <p>Loading...</p>;
};

const FormSectionSuspence = ({ videoId }: FormSectionProps) => {
  const router = useRouter();
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const utils = trpc.useUtils();
  const [thumbailModalOpen, setThumbnailModalOpen] = useState(false);

  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Video updated successfully");
    },
    onError: () => {
      toast.error("Failed to update video");
    },
  });

  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video removed successfully");
      router.push("/studio");
    },
    onError: () => {
      toast.error("Failed to remove video");
    },
  });

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Thumbnail restored successfully");
    },
    onError: () => {
      toast.error("Failed to restore thumbnail");
    },
  });
  
  const generateDescription = trpc.videos.generateDescription.useMutation({
  onSuccess: async () => {
    toast.success("Generating description in background...");

    // remember old updatedAt
    const before = video?.[0]?.updatedAt;

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      const fresh = await utils.studio.getOne.fetch({ id: videoId });

      const after = fresh?.[0]?.updatedAt;

      // stop when DB changed
      if (after && before && new Date(after).getTime() !== new Date(before).getTime()) {
        clearInterval(interval);

        await utils.studio.getOne.invalidate({ id: videoId });
        await utils.studio.getMany.invalidate();

        toast.success("Updated description from background!");
      }

      if (attempts > 20) clearInterval(interval);
    }, 3000);
  },
});

  const generateTitle = trpc.videos.generateTitle.useMutation({
  onSuccess: async () => {
    toast.success("Generating title in background...");

    // remember old updatedAt
    const before = video?.[0]?.updatedAt;

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      const fresh = await utils.studio.getOne.fetch({ id: videoId });

      const after = fresh?.[0]?.updatedAt;

      // stop when DB changed
      if (after && before && new Date(after).getTime() !== new Date(before).getTime()) {
        clearInterval(interval);

        await utils.studio.getOne.invalidate({ id: videoId });
        await utils.studio.getMany.invalidate();

        toast.success("Updated title from background!");
      }

      if (attempts > 20) clearInterval(interval);
    }, 3000);
  },
});

 const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
  onSuccess: async () => {
    toast.success("Generating thumbnail in background...");

    // remember old updatedAt
    const before = video?.[0]?.updatedAt;

    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      const fresh = await utils.studio.getOne.fetch({ id: videoId });

      const after = fresh?.[0]?.updatedAt;

      // stop when DB changed
      if (after && before && new Date(after).getTime() !== new Date(before).getTime()) {
        clearInterval(interval);

        await utils.studio.getOne.invalidate({ id: videoId });
        await utils.studio.getMany.invalidate();

        toast.success("Updated thumbnail from background!");
      }

      if (attempts > 20) clearInterval(interval);
    }, 3000);
  },
});



  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: {
      title: video[0]?.title || "",
      description: video[0]?.description || "",
      visibility: "private",
      categoryId: video[0]?.categoryId || "",
    },
  });

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate({
      id: videoId,
      ...data,
    });
  };

  const fullUrl = `${
    process.env.VERCEL_URL
      ? process.env.VERCEL_URL
      : "http://localhost:3000"
  }/videos/${video[0]?.id}`;

  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    toast.success("Video link copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
  <>
    <ThumbnailUploadModal
     open={thumbailModalOpen}
     onOpenChange={setThumbnailModalOpen}
     videoId={videoId}
    />

    <Form {...form}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Video details
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your video details
              </p>
            </div>

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon className="size-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: videoId })}
                    className="text-red-600 focus:text-red-600"
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete video
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT FORM */}
            <div className="lg:col-span-3 space-y-8">
              {/* TITLE */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Title
                        <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className="rounded-full size-6 [&_svg]:size-3"
                        onClick={()=> generateTitle.mutate({id : videoId})}
                        disabled={generateTitle.isPending  || !video[0].muxTrackId}
                        >
                          {generateTitle.isPending ?  <Loader2Icon className="animate-spin "/> : <SparklesIcon/>}
                            
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border border-input focus-visible:ring-1"
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPTION */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Discription
                        <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className="rounded-full size-6 [&_svg]:size-3"
                        onClick={()=> generateDescription.mutate({id : videoId})}
                        disabled={generateDescription.isPending || !video[0].muxTrackId}
                        >
                          {generateDescription.isPending ?  <Loader2Icon className="animate-spin "/> : <SparklesIcon/>}
                            
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={8}
                        className="resize-none bg-background border border-input focus-visible:ring-1"
                        placeholder="Add a description to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
              name="thumbnailUrl"
              control={form.control}
              render={()=>(
                <FormItem>
                   <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                       <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image
                        fill
                        alt="Thumbnail"
                        src={video[0]?.thumbnailUrl ?? THUMBNAIL_FALLBACK_URL}
                        className="object-cover"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                            size="icon"
                            type="button"
                            className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100
                            duration-200 size-7"
                            >
                              <MoreVerticalIcon className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                             <DropdownMenuContent align="start" side="right">
                              <DropdownMenuItem onClick={()=>setThumbnailModalOpen(true)}>
                                <ImagePlayIcon className="size-4 mr-1"/>
                                Chage
                              </DropdownMenuItem>
                              <DropdownMenuItem
                              onClick={()=>generateThumbnail.mutate({id: videoId})}
                              >
                                <SparklesIcon className="size-4 mr-1"/>
                                AI-generate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                              onClick={()=>restoreThumbnail.mutate({id:videoId})}
                              >
                                <RotateCcwIcon className="size-4 mr-1"/>
                                Restore
                              </DropdownMenuItem>
                              
                            </DropdownMenuContent> 
                        </DropdownMenu>
                       </div>
                    </FormControl>
                </FormItem>
              )}
              />
              {/* CATEGORY */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* RIGHT CARD */}
            <div className="lg:col-span-2">
              <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                {/* VIDEO */}
                <div className="relative aspect-video bg-black">
                  <VideoPlayer
                    playbackId={video[0]?.muxPlaybackId ?? undefined}
                    thumbnailUrl={video[0]?.thumbnailUrl ?? undefined}
                    status={video[0]?.muxStatus ?? undefined}
                  />

                  {video[0]?.muxStatus !== "ready" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <p className="text-white text-sm">Processing video…</p>
                    </div>
                  )}
                </div>

                {/* META */}
                <div className="p-4 flex flex-col gap-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Video link
                    </p>
                    <div className="flex items-center gap-x-2">
                      <Link href={`/videos/${video[0]?.id}`}>
                        <p className="text-sm text-blue-500 line-clamp-1">
                          {fullUrl}
                        </p>
                      </Link>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={isCopied}
                        onClick={onCopy}
                      >
                        {isCopied ? (
                          <CopyCheckIcon />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Video status
                    </p>
                    <p className="text-sm font-medium">
                      {snakesCaseToTitle(
                        video[0]?.muxStatus || "preparing"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Subtitles status
                    </p>
                    <p className="text-sm font-medium">
                      {snakesCaseToTitle(
                        video[0]?.muxTrackStatus || "preparing"
                      )}
                    </p>
                  </div>
                </div>

                {/* VISIBILITY */}
                <div className="border-t p-4">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectItem value="public">
                              <div className="flex items-center">
                                <Globe2Icon className="size-4 mr-2" />
                                Public
                              </div>
                            </SelectItem>

                            <SelectItem value="private">
                              <div className="flex items-center">
                                <LockIcon className="size-4 mr-2" />
                                Private
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Form>
  </>
  );
};
