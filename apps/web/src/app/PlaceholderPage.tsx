import { Construction } from 'lucide-react';
import { EmptyState, PageHeader } from '@bta/shadcn';

/**
 * Trang giữ chỗ: thay bằng implementation thật theo screen ID (design/screens/wm/<ID>.md).
 */
export function PlaceholderPage({ id, title }: { id: string; title: string }) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={title} subtitle={`Màn hình ${id}`} />
      <div className="rounded-lg border border-border bg-surface">
        <EmptyState icon={<Construction strokeWidth={1.5} />} message={`Màn hình ${id} sẽ được triển khai`} description={`Spec: design/screens/wm/${id}.md · Mockup: design/mockups/${id}.html`} />
      </div>
    </div>
  );
}

export function placeholder(id: string, title: string) {
  return function Page() {
    return <PlaceholderPage id={id} title={title} />;
  };
}
