import WidgetCard from '@src/react/features/agent-settings/components/WidgetCard';

export function SkeletonLoader({ title }: { title: string }) {
  return (
    <WidgetCard title={title}>
      <div className="bg-white p-4 ">
        <div className="flex-col animate-pulse gap-3">
          <div className="h-11 bg-gray-200 rounded-sm dark:bg-gray-700  w-sm"></div>
          <div className="mt-3 flex flex-col gap-1">
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/3"></div>
            <div className="h-1.5 bg-gray-200 rounded-full dark:bg-gray-700 w-1/2"></div>
            <div className="h-28 bg-gray-200 rounded-sm dark:bg-gray-700  w-full"></div>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-1/3"></div>
            <div className="h-1.5 bg-gray-200 rounded-full dark:bg-gray-700 w-1/2"></div>
            <div className="h-28 bg-gray-200 rounded-sm dark:bg-gray-700  w-full"></div>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
