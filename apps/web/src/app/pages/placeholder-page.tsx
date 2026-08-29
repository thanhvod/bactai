/** Trang tạm cho các domain chưa xây (thứ tự xây theo docs/08-kien-truc.md mục 7). */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm">Đang xây dựng</p>
    </div>
  );
}
