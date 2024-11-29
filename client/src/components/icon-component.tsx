import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type IconComponentProps = {
  icon: React.ReactNode;
  iconName: string;
  sidebarName?: string;
  setSidebarName?: (name: string) => void;
};

const IconComponent = ({
  icon: Icon,
  iconName,
  sidebarName = "",
  setSidebarName = () => {},
}: IconComponentProps) => {
  return (
    <div
      className={`flex cursor-default select-none items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-all duration-300 ${
        sidebarName === iconName ? "bg-slate-500" : ""
      }`}
      onClick={() => setSidebarName(iconName)}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{Icon}</TooltipTrigger>
          <TooltipContent>
            <p>{iconName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default IconComponent;
