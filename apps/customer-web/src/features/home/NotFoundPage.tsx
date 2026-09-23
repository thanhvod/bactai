import { Link } from 'react-router';
import { Button, EmptyState } from '@bta/shadcn';

export default function NotFoundPage() {
  return (
    <EmptyState
      message="Không tìm thấy trang"
      description="Đường dẫn không tồn tại hoặc đã thay đổi."
      action={
        <Button asChild>
          <Link to="/">Về trang tìm nhà xe</Link>
        </Button>
      }
    />
  );
}
