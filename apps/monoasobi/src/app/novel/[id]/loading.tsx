export default function NovelLoading() {
  return (
    <div className="flex items-center justify-center flex-col gap-3 h-full">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
      />
      <span className="type-body text-muted-foreground font-medium">
        소설을 불러오는 중입니다.
      </span>
    </div>
  );
}
