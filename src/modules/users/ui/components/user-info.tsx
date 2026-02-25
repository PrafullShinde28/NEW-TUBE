import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const userInfoVariants = cva("flex items-center gap-1", {
  variants: {
    size: {
      default: "[&_span]:text-xs",
      lg: "[&_span]:text-sm [&_span]:font-medium",
      sm: "[&_span]:text-xs",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
  name: string;
  className?: string;
}

export const UserInfo = ({
  name,
  className,
  size,
}: UserInfoProps) => {
  return (
    <div className={cn(userInfoVariants({ size }), className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-muted-foreground hover:text-foreground line-clamp-1 leading-tight cursor-pointer">
            {name}
          </span>
        </TooltipTrigger>

        <TooltipContent
          align="center"
          className="bg-black/80 text-white text-xs"
        >
          {name}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};