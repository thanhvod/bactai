# Bo sung chuc nang da chon

> Ngay chot: 2026-09-23
> Trang thai: Da chon bo sung vao requirement. Uu tien trien khai theo phase, khong bat buoc tat ca nam trong go-live dau tien.

## 1. Nguyen tac bo sung

Tat ca chuc nang trong tai lieu nay duoc chon vi giam rui ro van hanh that: tranh sai tien, tranh tranh cai voi khach/tai xe, giu du dau vet khi co sua doi, va giup operation/ketoan doi chieu nhanh.

Van giu tinh than chung cua BRD: he thong canh bao va ghi nhan ro rang, nhung khong khoa cung quy trinh van hanh neu operation co quyen va nhap ly do.

## 2. Chuc nang bo sung theo nhom nghiep vu

### 2.1. Ma tu dong

- He thong sinh ma tu dong cho order, trip, phieu thu, phieu chi, bang luong, bang ke cong no.
- Ma theo tung merchant, khong dung chung counter giua cac nha xe.
- Format co the cau hinh sau; mac dinh goi y:
  - Order: `DH-YYYYMM-0001`
  - Trip: `CX-YYYYMM-0001`
  - Phieu thu: `PT-YYYYMM-0001`
  - Phieu chi: `PC-YYYYMM-0001`
  - Bang luong: `BL-YYYYMM-0001`
  - Bang ke cong no: `CN-YYYYMM-0001`

### 2.2. Ghi chu noi bo, timeline va audit

- Order, trip, customer, driver, vehicle, supplier can co ghi chu noi bo.
- He thong co timeline hoat dong theo entity: ai tao, ai sua, ai doi trang thai, ai sua gia, ai them chi phi, ai phan bo tien, ai duyet/huy.
- `status_history` van dung cho doi trang thai; timeline/audit mo rong cho cac hanh dong nghiep vu quan trong khong phai status.

### 2.3. Dinh kem chung tu

- File/anh dinh kem khong chi dung cho POD.
- Cho phep gan chung tu vao order, trip, stop, expense, payment, customer, driver, vehicle, supplier.
- Loai chung tu du kien: POD, phieu xuat kho, hoa don, bien nhan boc xep, chung tu chi phi, anh su co, hop dong/thoa thuan, chung tu thanh toan.

### 2.4. Quyen sua du lieu nhay cam va bat buoc nhap ly do

Can co permission rieng va audit voi cac hanh dong nhay cam:

- Sua gia cuoc sau khi order da xac nhan.
- Sua/xoa chi phi.
- Sua/xoa phieu thu, phieu chi.
- Sua order da hoan thanh.
- Doi trang thai nguoc, vi du tu "Hoan thanh" ve "Dang thuc hien".
- Huy order/trip.
- Sua COD thuc thu.
- Sua bang luong sau khi tao.
- Duyet/huy duyet bang luong.

Nhung hanh dong tren nen bat buoc nhap ly do, luu nguoi thuc hien va thoi diem.

### 2.5. Canh bao COD tai xe dang giu

- Canh bao tai xe dang giu COD qua so tien cau hinh.
- Canh bao tai xe giu COD qua so ngay cau hinh.
- Man hinh danh sach COD chua nop theo tai xe, theo order/trip/stop.
- Day la warning noi bo, khong can push/email trong MVP.

### 2.6. Chot bang ke cong no

- Khi export PDF bang ke cong no khach hang, he thong luu thanh `debt_statement`.
- Bang ke can luu snapshot so lieu tai thoi diem chot/xuat de tranh file da gui khach bi lech khi du lieu goc thay doi sau do.
- Co lich su cac ban bang ke da tao, trang thai: nhap, da chot, da gui, da huy.

### 2.7. Tam ung chuyen

- Truoc chuyen, cong ty co the dua tien di duong cho tai xe.
- Sau chuyen, doi soat: da tam ung, chi phi tai xe da chi, so can hoan them, so tai xe can nop lai.
- Tam ung chuyen khac voi ung luong: ung luong tru vao bang luong; tam ung chuyen la dong tien phuc vu mot trip/order.

### 2.8. Su co chuyen

- Trip/order co the ghi nhan su co rieng, khong chi la trang thai "Tam dung".
- Loai su co du kien: hu xe, tre gio, hang hu/hang thieu, khach doi diem, khong giao duoc hang, sai COD, phat sinh chi phi bat thuong.
- Moi su co co muc do, mo ta, anh/chung tu, nguoi phu trach xu ly, trang thai xu ly.

### 2.9. Thong bao noi bo

He thong co notification trong web/app cho cac su kien:

- Tai xe co chuyen moi.
- Order qua han thanh toan.
- COD tai xe chua nop.
- Bang luong cho duyet.
- Chuyen bi trung/gian cach qua gan lich xe/tai xe.
- Co su co moi can xu ly.

Phase dau chi can notification trong app/web, chua can email/push cho khach.

### 2.10. Import/export Excel

- Import danh sach khach hang.
- Import xe.
- Import tai xe.
- Export danh sach order.
- Export cong no.
- Export bang luong.
- Export COD tai xe dang giu.

Import can co buoc preview/validate truoc khi ghi vao he thong.

### 2.11. Mau in / chia se nhanh

Ngoai PDF bang ke cong no, can du phong cac mau:

- Phieu giao hang.
- Phieu dieu xe.
- Bang chi phi chuyen.
- Bang doi soat tai xe.
- Bang luong tai xe.

MVP co the export PDF/tai file; gui qua Zalo/email van do operation thuc hien ngoai he thong.

### 2.12. Han muc va dieu kien cong no khach hang

- Khach hang co han muc no tuy chon.
- Khach hang co so ngay cong no mac dinh tuy chon de goi y khi tao order.
- Canh bao khach vuot han muc no hoac co nhieu order qua han.
- Canh bao mem, operation van duoc tao order neu co quyen.

### 2.13. So dia chi va lien he thuong dung

- Khach hang co nhieu dia chi/kho/diem giao nhan thuong dung.
- Moi dia chi co nguoi lien he, so dien thoai, ghi chu boc/tra hang, toa do neu co.
- Khi tao order, operation co the chon nhanh tu so dia chi cua customer va van sua noi dung rieng cho order.

### 2.14. Thong tin thue xe ngoai toi thieu

Khi order/trip co thue xe ngoai, ngoai viec ghi expense gan order, nen luu toi thieu:

- Nha cung cap/chang/doi tac van tai.
- Bien so xe ngoai neu co.
- Ten va so dien thoai tai xe ngoai neu co.
- Gia thue, chi phi phat sinh, chung tu/POD neu co.
- Ghi chu lien he/xu ly.

## 3. Goi y uu tien trien khai

### Phase 0

- Ma tu dong.
- RBAC/permission cho hanh dong nhay cam.
- Audit/timeline nen tang.
- Danh muc loai chung tu, loai su co, loai notification.

### Phase 1A

- Ghi chu noi bo.
- Dinh kem chung tu cho order/trip/stop.
- So dia chi va lien he thuong dung cua customer.
- Thong tin thue xe ngoai toi thieu.
- Su co chuyen co ban.

### Phase 1B

- Notification tai xe co chuyen moi.
- Tai xe chup them anh/chung tu su co neu co.
- Tai xe nhap/sua COD co audit va ly do.

### Phase 1C

- Canh bao COD tai xe dang giu.
- Tam ung chuyen va doi soat voi chi phi thuc te.
- Han muc cong no khach hang.

### Phase 1D

- Chot bang ke cong no va luu snapshot.
- Import/export Excel.
- Mau in/chia se nhanh.
- Notification bang luong cho duyet, cong no qua han.

### Phase 1E

- Notification van hanh nang cao dua tren GPS/dashboard.
- Su co chuyen nang cao gan voi dashboard dieu phoi.

