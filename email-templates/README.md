# Email mời khách (invitation-guest)

Hai file này là template email mời khách đã làm lại. Backend gửi email (`PUT /invitations/:id/guests/:guestId/send-email` và `bulk-send-email`), nên cần lắp template vào backend.

- `invitation-guest.html`: bản HTML, bố cục bảng, CSS viết inline để chạy ổn trên Gmail, Outlook và điện thoại.
- `invitation-guest.txt`: bản chữ thuần, gửi kèm để tăng độ tin cậy (giảm nguy cơ vào thư rác).

## Biến cần thay

Dùng cùng kiểu `{TênBiến}` như form cài đặt thiệp.

| Biến | Lấy từ | Ghi chú |
|---|---|---|
| `{TiêuĐềThiệp}` | `settings.emailSubject` (hoặc tên thiệp) | Dùng làm tiêu đề email và tiêu đề trong thư |
| `{LờiNhắn}` | `settings.emailMessage` | Nếu trống, dùng câu mặc định |
| `{LờiXưngHô}` | `settings.salutationStyle` hoặc lời xưng theo nhóm | Ví dụ "Thân gửi" |
| `{TênKháchMời}` | `guest.name` | |
| `{TênChủTiệc}` | Tên chủ thiệp (tài khoản) | Dùng để khách nhận ra người mời |
| `{NgàyGiờ}` | `settings`/sự kiện, ví dụ "Chủ nhật, 14/12/2026 · 17:00" | Nếu chưa đặt, bỏ cả dòng |
| `{ĐịaĐiểm}`, `{ĐịaChỉ}` | Thông tin địa điểm của sự kiện | Nếu trống, bỏ dòng |
| `{LinkThiệp}` | `/events/view?id={slug}` (thêm `&guestId=` nếu muốn link cá nhân) | Link dùng domain của thương hiệu |

Lưu ý: nếu một biến trống, nên bỏ hẳn dòng đó thay vì để chữ `{…}` lộ ra cho khách.

## Gửi đúng cách

- Gửi dạng `multipart/alternative`: phần `text/plain` là `invitation-guest.txt`, phần `text/html` là `invitation-guest.html`.
- Đặt tên người gửi là tên thương hiệu, ví dụ `iCards <thiep@icards.com.vn>`, và `Reply-To` là email hỗ trợ.
- Dùng cùng domain cho email gửi đi và link trong thư (`icards.com.vn`). Không dùng link rút gọn (bit.ly…).

## Chống vào thư rác (cần làm ở server và DNS)

Các thay đổi trong template chỉ giúp một phần. Phần lớn lý do vào thư rác nằm ở cấu hình gửi:

1. **SPF, DKIM, DMARC** của domain gửi phải có và pass. Kiểm tra bằng "Show original" trong Gmail (xem `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`).
2. **Domain gửi nên khớp với domain thương hiệu** (`icards.com.vn`), không gửi từ domain trung gian.
3. **Gửi theo đợt nhỏ** với domain/IP mới, tăng dần. Gửi hàng loạt đột ngột là dấu hiệu spam.
4. **Chỉ gửi cho địa chỉ đã xác nhận**, và xoá địa chỉ bị trả về lỗi (bounce) hoặc khiếu nại.
5. **Kiểm tra trước khi gửi thật** bằng mail-tester.com hoặc gửi thử đến Gmail, Outlook, Yahoo.
6. Tránh viết hoa toàn bộ, dấu chấm than nhiều, và các từ kiểu "miễn phí!!!" trong tiêu đề.

## Xem trước

Mở `invitation-guest.html` trực tiếp trên trình duyệt, thay các biến bằng dữ liệu thử để xem bố cục.
