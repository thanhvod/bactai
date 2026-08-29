import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label,
} from '@bta/shadcn';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { signOut } from '../../lib/firebase';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      fullName
      role
      merchant { id name scheduleWarnHours }
    }
  }
`;

const REGISTER = gql`
  mutation RegisterMerchant($merchantName: String!, $phone: String) {
    registerMerchant(merchantName: $merchantName, phone: $phone) { id }
  }
`;

export interface Me {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'OPERATION' | 'ACCOUNTANT';
  merchant: { id: string; name: string; scheduleWarnHours: number };
}

const MeContext = createContext<Me | null>(null);
export const useMe = () => useContext(MeContext)!;

function RegisterMerchantScreen({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [register, { loading, error }] = useMutation(REGISTER, { onCompleted: onDone });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Đăng ký nhà xe</CardTitle>
          <CardDescription>
            Tài khoản Google của bạn chưa thuộc nhà xe nào. Tạo nhà xe mới để bắt đầu.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="mname">Tên nhà xe *</Label>
            <Input id="mname" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nhà xe Bắc Tài" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="mphone">Số điện thoại</Label>
            <Input id="mphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error.message}</p>}
          <Button disabled={!name.trim() || loading} onClick={() => register({ variables: { merchantName: name, phone: phone || null } })}>
            {loading ? 'Đang tạo…' : 'Tạo nhà xe'}
          </Button>
          <Button variant="ghost" onClick={() => signOut()}>Đăng xuất</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Sau khi đăng nhập Firebase: kiểm tra user thuộc merchant chưa; chưa → form đăng ký */
export function MerchantGate({ children }: { children: ReactNode }) {
  const { data, loading, error, refetch } = useQuery<{ me: Me | null }>(ME_QUERY);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Đang tải…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-muted-foreground">
        <p>Không kết nối được máy chủ: {error.message}</p>
        <Button variant="outline" onClick={() => refetch()}>Thử lại</Button>
        <Button variant="ghost" onClick={() => signOut()}>Đăng xuất</Button>
      </div>
    );
  }
  if (!data?.me) return <RegisterMerchantScreen onDone={() => refetch()} />;

  return <MeContext.Provider value={data.me}>{children}</MeContext.Provider>;
}
