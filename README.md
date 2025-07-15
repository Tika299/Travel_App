## Git và Github cho sysadmin

###Mục lục

[I. Mở đầu](#Modau)

[II. Ngôn ngữ Markdown](#ngonngumarkdown)
- [1. Thẻ tiêu đề](#thetieude)
- [2. Chèn link, chèn ảnh](#chenlinkchenanh)
- [3. Ký tự in đậm, in nghiêng](#kytuindaminnghieng)
- [4. Trích dẫn, bo chữ](#trichdanbochu)
- [5. Gạch đầu dòng](#gachdaudong)
- [6. Tạo bảng](#taobang)
- [Mẹo](#meo)
	
[III. Các thao tác với git và github](#cacthaotacvoigitvagithub)
- [0. Repo](#repo)
- [1. Cài đặt](#caidat)
<ul>
<li>		[1.1. Linux](#11linux)</li>
<li>		[1.2. Windows](#12windows)</li>
</ul>
- [2. Thao tác với Repo](#thaotacvoirepo)
<ul>
<li>[2.1. Trên Linux](#21trenlinux)</li>
<li>[2.1.1. Tạo mới](#211taomoi)</li>
<li>[2.1.2. Clone](#212clone)</li>
<li>[2.1.3. Add, commit, push](#213addcommitpush)</li>
<li>[2.1.4. Pull](#214pull)</li>
<li>[2.2. Trên Windows](#22trenwindows)</li>
<li>[2.2.1. Tạo một repo mới](#221taomotrepomoi)</li>
<li>[2.2.2. Clone](#222clone)</li>
<li>[2.2.3. Add, commit, push, pull ](#223)</li>
</ul>
- [3. Thao tác với tổ chức trong Github](#3)
- [4. Thao tác với nhánh (branch)](#4)
- [5. Issues](#5)
- [6. Git Tutorial](#6)	

[Tổng kết](#Tongket)

===========================

<a name="Modau"></a>
## I. Mở đầu

`Git` là một phần mềm dùng để quản lý phiên bản của mã nguồn tương tự như `SVN` nhưng có nhiều ưu điểm hơn, `Git` đang được sủ dụng rộng rãi hiện nay.
Tuy nhiên trong bài viết này, tôi sẽ nói về git một cách "cá nhân" hơn, mang tính chia sẻ những cái tôi hay làm và hướng tới những người là sysadmin. Mong nhận được ý kiến đóng góp của các bạn.

#### Một số khái niệm cần làm rõ

**`Git` và `Github` khác nhau như thế nào?**

Lấy ví dụ, bạn có một đoạn script dài 20 dòng, hôm sau bạn tối ưu nó đi, chỉ còn 15 dòng, một ngày khác bạn sửa ở script đó một vài chỗ. Git ghi lại những thời điểm thay đổi đó của bạn và source code của bạn tại thời điểm đó.

Github là một trang web, cho phép bạn lưu source code của mình lên đó. Sự kết hợp hoàn hảo giữa Git và Github mang lại một sự thuận tiện không hề nhỏ cho người dùng. Bạn có thể thay đổi đoạn code của mình mọi lúc mọi nơi mà không sợ bị ghi đè lên hay bị mất dữ liệu do hỏng hóc vì dữ liệu của bạn được lưu cả trên trang web Github và máy cá nhân. Bạn cũng có thể khôi phục được code của mình về một thời điểm bất kỳ nào đó.

Github có bản free và mất phí. Với Github free thì source code của bạn sẽ công khai, có nghĩa là ai cũng có thể xem code của bạn. Nó phù hợp với các phần mềm nguồn mở, và cũng có thể trở thành một blog cá nhân của chính các bạn như các trang blogspot, wordpress,...

Muốn có thể tạo một kho code bí mật của riêng mình thì bạn phải trả phí.

Đối với cá nhân tôi thì github free là quá đủ cho mục đích lưu trữ và chia sẻ thông tin.

**Cần phải làm gì để có thể sử dụng `Github`?**

- B1: Đăng ký một tài khoản tại [github](https://github.com) và đăng nhập

Tôi chắc chắn rằng một khi bạn đã đọc đến đây thì bạn đã biết thực hiện bước trên như thế nào :)

- B2: Học cách sử dụng ngôn ngữ `Markdown`

Bạn có thể bỏ qua bước này nếu bạn đã biết hoặc các bạn xác định không sử dụng nó để viết.

Theo cá nhân tôi thì các bạn nên viết bằng Markdown trong Github vì nó sẽ mang lại sự tường minh cho bài viết của bạn.

Bạn chỉ cần bỏ ra khoảng 2h là đã có thể sử dụng ngôn ngữ này như ý muốn.

- B3: Tạo một repo đầu tiên và gõ Hello world bằng Markdown

Sau đó tạo các repo tùy mục đích, clone nó về client và code.

Bước này tôi sẽ hướng dẫn chi tiết hơn ở phần sau.

<a name="ngonngumarkdown"></a>
## II. Ngôn ngữ Markdown

Ngôn ngữ này khá đơn giản, bạn có thể đọc tại [đây](http://daringfireball.net/projects/markdown/syntax) để biết cách sử dụng.

Nhưng với tôi, tôi không dùng hết từng ấy thứ cho nên tôi chỉ nhớ một số cái tôi hay dùng, cách tôi dùng như sau:

Tạo một file có tên bất kỳ với đuôi .md. Có thể dùng `notepad`, `notepad++`, `vi`, `nano`,... hay bất cứ thứ gì mà bạn muốn.

Một số phương pháp tôi hay sử dụng để viết:

<a name="thetieude"></a>
### 1. Thẻ tiêu đề

Markdown sử dụng kí tự # để bắt đầu cho các thẻ tiêu đề, có thể dùng từ 1 đến 6 ký tự # liên tiếp. Mức độ riêu đề giảm dần từ 1 đến 6

Tùy mục đích và ý thích bạn có thể sử dụng cách này để thể hiện các chỉ mục khác nhau.

Ví dụ:

```
#1.Tiêu đề cấp 1
```

#1.Tiêu đề cấp 1

```
##2.Tiêu đề cấp 2
```

##2.Tiêu đề cấp 2

```
######6.Tiêu đề cấp 6
```

######6.Tiêu đề cấp 6

<a name="chenlinkchenanh"></a>
### 2. Chèn link, chèn ảnh

Để chèn hyperlink bạn chỉ cần paste luôn linh đó vào file .md

```
https://github.com
```

https://github.com

Hoặc bạn cũng có thể sử dụng cú pháp sau để thu ngắn đường dẫn của link

```
[Github](https://github.com)
```

Kết quả là:

[Github](https://github.com)

Để chèn ảnh thì bạn hãy sử dụng cú pháp sau:

```
<img src="link_anh_cua_ban">
```

Tôi thường sử dụng công cụ [Lightshot](https://app.prntscr.com/en/index.html) để chụp ảnh màn hình và up hình đó lên trang http://i.imgur.com/ để lấy đường dẫn ảnh đưa vào Github

Hai công cụ này khá dễ sử dụng, bạn chỉ cần chụp màn hình bằng Lightshot ấn Ctrl + C để copy và Ctrl + V để paste vào trình duyệt tại trang web http://i.imgur.com/
