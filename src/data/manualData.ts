import { ErrorDefinition, ManualSection, ModeThresholds } from '../types/manual';

export const MODE_DEFAULTS: Record<'TEP' | 'CA' | 'CAY' | 'CUSTOM', ModeThresholds> = {
  TEP: { lo: 120, hi: 170, flushMinutes: 1, flushSeconds: 0 },
  CA: { lo: 120, hi: 250, flushMinutes: 1, flushSeconds: 0 },
  CAY: { lo: 150, hi: 250, flushMinutes: 1, flushSeconds: 0 },
  CUSTOM: { lo: 150, hi: 300, flushMinutes: 1, flushSeconds: 0 },
};

export const PUMP_SPECIFICATIONS = [
  {
    type: 'SMALL',
    name: 'Bơm nhỏ (Tiêu chuẩn)',
    minCurrent: '40 mA',
    minCurrentDesc: 'Thấp hơn = báo bơm hỏng (111)',
    filterDirtyThreshold: '600 mA',
    filterDirtyDesc: 'Vượt = cảnh báo lõi lọc bẩn (FLt)',
    overcurrentLimit: '700 mA',
    overcurrentDesc: 'Vượt = dừng khẩn cấp (222)',
  },
  {
    type: 'LARGE',
    name: 'Bơm lớn (Công suất cao)',
    minCurrent: '80 mA',
    minCurrentDesc: 'Thấp hơn = báo bơm hỏng (111)',
    filterDirtyThreshold: '1200 mA',
    filterDirtyDesc: 'Vượt = cảnh báo lõi lọc bẩn (FLt)',
    overcurrentLimit: '1500 mA',
    overcurrentDesc: 'Vượt = dừng khẩn cấp (222)',
  },
];

export const DRAIN_VALVE_SPECIFICATIONS = {
  name: 'Van xả thải (Solenoid Valve)',
  operatingCurrent: '420 mA',
  operatingDesc: 'Dòng điện tiêu thụ khi van xả đang mở',
  minCurrent: '50 mA',
  minCurrentDesc: 'Mở van nhưng dòng < 50 mA = hỏng van / đứt dây (555)',
  overcurrentLimit: '800 mA',
  overcurrentDesc: 'Dòng > 800 mA = van kẹt dị vật / chập, ngắt khẩn (666)',
};

export const ERROR_CODES: ErrorDefinition[] = [
  {
    code: '222',
    displayCode: 'Err ↔ 222',
    ledState: 'ERR1 (nhấp nháy)',
    cause: 'Bơm quá dòng, máy đã dừng khẩn cấp để bảo vệ mạch và motor bơm.',
    solution: 'Kiểm tra bơm bị kẹt rác/dị vật, hoặc van ngoài ống lọc bị khóa. Sau khi làm sạch và mở van, chạm OK để chạy lại.',
    severity: 'critical',
  },
  {
    code: '666',
    displayCode: 'Err ↔ 666',
    ledState: 'ERR1 (nhấp nháy)',
    cause: 'Van xả quá dòng, máy đã dừng khẩn cấp.',
    solution: 'Kiểm tra van điện từ xả có bị kẹt rác, chập cuộn coil hoặc dây dính nước. Xử lý triệt để xong chạm OK để tiếp tục.',
    severity: 'critical',
  },
  {
    code: '111',
    displayCode: 'Err ↔ 111',
    ledState: 'ERR1 (nhấp nháy)',
    cause: 'Bơm chạy nhưng không có dòng điện: hỏng bơm, đứt dây hoặc lỏng giắc cắm.',
    solution: 'Kiểm tra lại giắc cắm bơm và dây dẫn. Đồng thời kiểm tra xem đã cấu hình đúng loại Bơm nhỏ / Bơm lớn trên trang web chưa.',
    severity: 'warning',
  },
  {
    code: '555',
    displayCode: 'Err ↔ 555',
    ledState: 'ERR1 (nhấp nháy)',
    cause: 'Van xả mở nhưng không phát hiện có dòng điện: hỏng van hoặc lỏng tiếp xúc dây.',
    solution: 'Kiểm tra dây cáp và cuộn van xả. Tự hết khi dòng điện van trở về giá trị bình thường trong vài giây.',
    severity: 'warning',
  },
  {
    code: 'FLt',
    displayCode: 'Err ↔ FLt',
    ledState: 'LỌC nhấp nháy + ERR2 nhấp nháy',
    cause: 'Lõi lọc màng UF bị nghẹt/bẩn, dòng điện bơm dâng cao vượt ngưỡng nhưng chưa tới mức kẹt máy.',
    solution: 'Máy vẫn tiếp tục lọc. Tiến hành tháo rửa súc ngược hoặc thay lõi lọc UF mới, sau đó chạm OK để xóa cảnh báo.',
    severity: 'warning',
  },
  {
    code: 'ERR2_ONLY',
    displayCode: 'Err ↔ Er2',
    ledState: 'ERR2 (nhấp nháy)',
    cause: 'Đồng hồ thời gian thực RTC bị mất giờ (hết pin nuôi) hoặc cảm biến dòng điện chưa cắm vào bo mạch.',
    solution: 'Kết nối máy với WiFi nhà để máy tự đồng bộ giờ chuẩn Internet, hoặc chỉnh giờ trên trang web http://192.168.4.1.',
    severity: 'warning',
  },
  {
    code: '---',
    displayCode: 'Err ↔ ---',
    ledState: 'ERR2 (nhấp nháy)',
    cause: 'Lỗi cảm biến TDS: chưa cắm giắc đầu dò TDS, đứt dây hoặc điện cực bị bám bẩn cách điện.',
    solution: 'Kiểm tra lại giắc cắm cảm biến TDS vào bo mạch, lau sạch 2 que titan bằng khăn mềm.',
    severity: 'warning',
  },
  {
    code: 'XAP',
    displayCode: 'XAP',
    ledState: 'LỌC + XẢ đồng thời sáng cố định',
    cause: 'Chế độ xả áp lực khí trong bình lọc: Bật đồng thời cả XẢ và LỌC để xả hơi và áp lực khí đọng tích tụ trong bình lọc an toàn.',
    solution: 'Tự động dừng sau một khoảng thời gian hoặc chạm nhẹ nút OK để dừng sớm.',
    severity: 'info',
  },
  {
    code: 'rES',
    displayCode: 'rES',
    ledState: 'Nhấp nháy toàn bộ đèn trong 3.5 giây',
    cause: 'Chế độ khôi phục cài đặt gốc (Reset Factory) kèm 5 tiếng bíp.',
    solution: 'Máy chạy hiển thị rES trong khoảng 3.5 giây rồi tự khởi động lại và trở về hoạt động đo TDS bình thường.',
    severity: 'info',
  },
];

export const SCHEDULE_FILTERS = [
  { code: '100', name: 'Lịch thủ công', desc: 'Chỉ lọc khi bạn chủ động bật nút LỌC' },
  { code: '101', name: 'Lịch ban ngày', desc: 'Lọc 8h – 12h và 14h – 17h (mặc định 20 phút/giờ)' },
  { code: '102', name: 'Lịch buổi tối & đêm', desc: 'Lọc 19h – 5h sáng hôm sau (mặc định 30 phút/giờ)' },
  { code: '103', name: 'Lịch đêm (Mặc định)', desc: 'Lọc 23h – 5h sáng (mặc định 30 phút mỗi giờ)' },
  { code: '104', name: 'Lịch cả ngày 24/7', desc: 'Lọc suốt 24 giờ (mặc định 10 phút mỗi giờ)' },
];

export const DAY_PATTERNS = [
  { code: 'C07', name: 'Mỗi ngày', desc: 'Chạy hàng ngày trong tuần' },
  { code: 'C24', name: 'Ngày chẵn', desc: 'Chỉ chạy vào các ngày dương lịch chẵn' },
  { code: 'C13', name: 'Ngày lẻ', desc: 'Chỉ chạy vào các ngày dương lịch lẻ' },
  { code: 'C03', name: '3 ngày 1 lần', desc: 'Chu kỳ cách nhau mỗi 3 ngày' },
  { code: 'Ctu', name: 'Theo thứ trong tuần', desc: 'Chỉ định chính xác các thứ 2, 3, 4, 5, 6, 7, CN qua trang web' },
];

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'sec-1',
    number: 1,
    title: 'Giới thiệu và an toàn',
    summary: 'Tổng quan năng lực máy lọc UF CITO, các lưu ý an toàn tối quan trọng cho bể thủy sinh.',
    highlights: [
      'Lọc nước tự động theo lịch hẹn giờ hoặc bật/tắt bằng tay linh hoạt.',
      'Đo liên tục chỉ số TDS (ppm) và nhiệt độ nước (°C).',
      'Tự xả nước thải khi TDS vượt ngưỡng theo 4 chế độ nuôi: Tép, Cá, Cây, Custom.',
      'Bảo vệ kép: báo lỗi kẹt bơm/van, tự ngắt dòng khẩn cấp khi quá dòng.',
    ],
    content: `CITO UF tự lọc nước bể theo lịch, đo TDS và nhiệt độ, và tự xả khi TDS vượt ngưỡng bạn đặt. Bạn điều khiển máy bằng các nút cảm ứng trên mặt máy hoặc bằng điện thoại qua WiFi.

Máy làm được gì:
• Lọc nước tự động theo lịch, hoặc bật/tắt bằng tay.
• Đo TDS (độ tổng chất rắn hòa tan, đơn vị ppm) và nhiệt độ nước.
• Tự xả khi TDS cao, theo 4 chế độ nuôi: Tép, Cá, Cây, Custom.
• Xả theo lịch: mỗi N ngày hoặc theo thứ trong tuần.
• Báo lỗi khi bơm hoặc van có vấn đề, tự dừng khi quá dòng.

Lưu ý an toàn:
• Không để nước bắn vào hộp điều khiển. Luôn lau khô tay trước khi chạm nút cảm ứng.
• Rút nguồn điện trước khi thay lõi lọc UF, tháo bơm hoặc tháo lắp van điện từ.
• Không để bơm chạy khi không có nước quá lâu (chế độ bơm khô drn chỉ dùng khi mồi nước/xả khí).
• Khi màn hình báo quá dòng (Err xen kẽ 222 hoặc 666), hãy tìm và xử lý nguyên nhân trước rồi mới bấm OK để chạy lại.
• Mỗi lần xả nước thải tự tắt sau tối đa 30 phút, nhưng vẫn nên kiểm tra mực nước bể sau khi xả.`,
  },
  {
    id: 'sec-2',
    number: 2,
    title: 'Bảng điều khiển và đèn báo',
    summary: 'Sơ đồ mặt máy 3 hàng nút cảm ứng, màn hình số 3 ký tự và ý nghĩa hệ thống đèn LED trạng thái.',
    highlights: [
      'Hàng 1: Nút LỌC, XẢ (nút có đèn) · Đèn cảnh báo ERR1, ERR2 (chỉ là đèn báo).',
      'Hàng 2: Nút chế độ TÉP, CÁ, CÂY, CUSTOM.',
      'Hàng 3: SETTING, ▲ UP, ▼ DOWN, OK (đèn sáng phản hồi khi chạm).',
      'Màn hình số 3 ký tự: Hiển thị TDS thực tế. Cảm biến nhiệt độ là tùy chọn (optional) — nếu không gắn thì chỉ hiển thị TDS và không báo lỗi, có gắn thì luân phiên hiển thị TDS (4s) và nhiệt độ (2s).',
    ],
    content: `Mặt máy gồm 3 hàng nút cảm ứng bao quanh màn hình số 3 ký tự. Màn hình mặc định hiển thị chỉ số TDS thực tế của nước bể (ví dụ: 156). Cảm biến nhiệt độ là tùy chọn (optional): nếu không gắn cảm biến nhiệt độ thì màn hình chỉ hiển thị số TDS và không hiển thị nhiệt độ (hoàn toàn không báo lỗi). Nếu có gắn cảm biến nhiệt độ, màn hình sẽ tự động luân phiên hiển thị TDS (trong 4 giây) và nhiệt độ (trong 2 giây).

Cấu trúc các hàng:
• Hàng 1: LỌC, XẢ (nút có đèn tích hợp) · ERR1, ERR2 (chỉ là đèn báo, không chạm được).
• Hàng 2: TÉP, CÁ, CÂY, CUSTOM (chọn chế độ nuôi chuyên dụng).
• Hàng 3: SETTING, ▲ UP, ▼ DOWN, OK (vào menu, chỉnh thông số, xác nhận).

Quy tắc đèn LED trắng & Phân biệt qua Hành động (Action):
Toàn bộ hệ thống đèn LED trên mặt máy được thiết kế đồng bộ bằng LED màu trắng. Thiết bị giúp người dùng phân biệt trạng thái và xử lý sự cố qua hành vi hoạt động:
• Đèn LỌC: Sáng cố định = Đang lọc nước. Nhấp nháy = Lõi lọc bẩn, cần rửa hoặc thay lõi (máy vẫn chạy).
• Đèn XẢ: Sáng cố định = Đang mở van xả nước thải.
• Đèn ERR1: Nhấp nháy = Sự cố bơm hoặc van (không có dòng điện, hoặc quá dòng ngắt khẩn).
• Đèn ERR2: Nhấp nháy = Cảnh báo lõi lọc bẩn, đồng hồ RTC lỗi/hết pin, hoặc cảm biến dòng chưa cắm.
• Đèn TÉP / CÁ / CÂY / CUSTOM: Sáng cố định = Chế độ nuôi tương ứng đang bật (mỗi thời điểm chỉ 1 đèn sáng).
• 4 đèn hàng 3 (SETTING, UP, DOWN, OK): Sáng khi chạm = Phản hồi tức thì khi máy nhận diện cú chạm.
• Logo CITO UF SYSTEM: Đèn trắng sáng thở nhẹ (breathe) khi máy đang lọc hoặc xả; nhấp nháy nhanh khi ở menu cài đặt; tắt khi ở chế độ Ban đêm.`,
  },
  {
    id: 'sec-3',
    number: 3,
    title: 'Bật máy lần đầu',
    summary: 'Quy trình tự khởi động, tự mồi nước và các bước cấu hình khuyên dùng ngay sau khi cấp điện.',
    highlights: [
      'Chỉ cần cắm điện là máy tự khởi động, không cần nhấn nút.',
      'Tuyệt đối không chạm tay vào mặt máy trong lúc khởi động để cảm ứng tự cân chỉnh điện dung.',
      'Máy có pin RTC nuôi giờ độc lập, mất điện vẫn lưu toàn bộ cài đặt.',
    ],
    content: `Cắm điện là máy tự khởi động, không cần bấm nút nào. Lưu ý không chạm nút trong lúc khởi động để cảm ứng tự hiệu chỉnh điện dung đúng.

Quy trình khởi động:
1. Màn hình hiện 888 khoảng nửa giây (tự kiểm tra đèn LED), toàn bộ đèn sáng lên, máy phát 3 tiếng bíp.
2. Máy kích hoạt bơm và mở van lọc để mồi nước vào đường ống. Màn hình hiện Prt là đang trong giai đoạn mồi nước.
3. Máy chạy lọc khoảng 20 giây để nước ngập đều cảm biến, đo TDS và nhiệt độ lần đầu, sau đó hiển thị số đo lên màn hình.
4. Máy tự động chạy theo lịch lọc mặc định: từ 23h đêm đến 5h sáng, mỗi giờ lọc 30 phút.

Nên làm ngay sau lần bật đầu tiên:
✓ Kết nối WiFi nhà để máy lấy giờ chuẩn Internet từ NTP server (mục 8).
✓ Chọn chế độ nuôi phù hợp với sinh cảnh bể của bạn (mục 5).
✓ Chọn đúng loại bơm đang lắp (Bơm nhỏ hoặc Bơm lớn) trên trang web (mục 8.3).
✓ Kiểm tra lại lịch lọc và lịch xả để phù hợp với nhịp sinh học của bể.

Ghi nhớ: Khi mất điện, máy giữ nguyên vẹn mọi cài đặt và giờ đồng hồ nhờ pin nuôi bên trong. Có điện trở lại là máy tự hoạt động tiếp bình thường.`,
  },
  {
    id: 'sec-4',
    number: 4,
    title: 'Cách chạm nút cảm ứng',
    summary: 'Cơ chế chống chạm nhầm thông minh: giữ 1 giây kèm thanh đếm - / -- / --- và bảng chức năng giữ nút.',
    highlights: [
      'Nút chức năng chính phải giữ 1 giây rồi thả mới có hiệu lực.',
      'Màn hình phản hồi trực quan: - (ngay khi chạm) → -- (sau 0.5s) → --- (kèm tiếng bíp sau 1s).',
      'OK, UP, DOWN phản hồi tức thì (chạm là ăn) để thao tác số mượt mà.',
    ],
    content: `Các nút chức năng chính trên mặt máy phải giữ 1 giây rồi thả mới ăn. Cơ chế này được thiết kế có chủ đích để bạn lướt tay ngang qua lau bụi không bao giờ bị bật nhầm. Chỉ cần đặt ngón tay nhẹ nhàng, không cần ấn mạnh.

Làm sao biết máy đã nhận lệnh?
Trong lúc ngón tay bạn đang giữ nút, màn hình sẽ hiển thị tiến trình:
1. Ký tự "-" xuất hiện ngay khi vừa chạm: máy đã nhận diện ngón tay, giữ tiếp.
2. Ký tự "--" sau 0.5 giây.
3. Ký tự "---" kèm một tiếng bíp ngắn sau đúng 1 giây: đủ thời gian rồi, thả tay ra là lệnh được thực thi.
*Lưu ý: Nếu thả tay trước khi có tiếng bíp thì máy tự hủy lệnh, không làm gì.

Bảng tra cứu thời gian giữ nút:
• LỌC: Giữ 1s rồi thả = Bật / tắt lọc bằng tay.
• XẢ: Giữ 1s rồi thả = Bật / tắt xả bằng tay.
• TÉP / CÁ / CÂY / CUSTOM: Giữ 1s rồi thả = Chọn hoặc tắt chế độ nuôi. Giữ 5s = Vào chỉnh ngưỡng TDS (Lo/Hi) và thời gian xả của chế độ đó.
• SETTING: Giữ 5s = Vào menu cài đặt lịch lọc / lịch xả (đèn nhỏ phía trên sáng báo đang nhận).
• OK: Chạm là ăn (Xác nhận, xóa cảnh báo). Giữ 5s (khi rảnh) = Xả áp lực khí trong bình lọc (XAP — bật đồng thời cả XẢ và LỌC để xả hơi bình lọc). Giữ 10s = Khôi phục cài đặt gốc (rES — chạy 3.5s rồi tự về hoạt động bình thường).
• ▲ UP / ▼ DOWN: Chạm là ăn = Tăng / giảm 1 đơn vị. Giữ lâu = Tăng / giảm số liên tục với tốc độ tăng dần.`,
  },
  {
    id: 'sec-5',
    number: 5,
    title: 'Chế độ nuôi và tự xả theo TDS',
    summary: 'Nguyên lý giám sát chất lượng nước tự động và 4 cấu hình tối ưu cho Tép, Cá, Cây, Custom.',
    highlights: [
      'Tự kích hoạt xả nước thải khi TDS vượt mức Hi của chế độ đã chọn.',
      'Sau khi xả xong, máy thông minh nghỉ 1 giờ để nước mới hòa tan đều rồi mới đo lại.',
      'Mức Lo là mốc mục tiêu tham khảo; máy dùng mức Hi để quyết định xả.',
    ],
    content: `Khi bật một chế độ nuôi, máy sẽ tự động xả nước đáy bể mỗi khi chỉ số TDS vượt quá ngưỡng Hi đã định. Giữ nút TÉP, CÁ, CÂY hoặc CUSTOM 1 giây rồi thả để chọn; thao tác lại trên chính nút đó để tắt. Mỗi thời điểm chỉ có 1 chế độ hoạt động, đèn chế độ đó sẽ sáng xanh.

Bảng ngưỡng mặc định của các chế độ:
• Tép: Lo = 120 ppm | Hi = 170 ppm | Thời gian xả mặc định = 1 phút.
• Cá: Lo = 120 ppm | Hi = 250 ppm | Thời gian xả mặc định = 1 phút.
• Cây: Lo = 150 ppm | Hi = 250 ppm | Thời gian xả mặc định = 1 phút.
• Custom: Lo = 150 ppm | Hi = 300 ppm | Thời gian xả mặc định = 1 phút.

Quy trình tự xả diễn ra như thế nào:
1. Máy định kỳ đo TDS (mặc định mỗi 1 tiếng).
2. Nếu TDS đo được lớn hơn ngưỡng Hi, máy lập tức kích hoạt mở van xả và bật bơm trong thời gian đã cài đặt.
3. Khi xả xong (hoặc nếu bạn can thiệp tắt xả giữa chừng), máy sẽ chờ 1 tiếng để nước bù mới kịp hòa tan đồng nhất vào bể trước khi xét lại TDS lần tiếp theo.

Thời gian xả cài theo đơn vị Phút + Giây (từ 5 giây đến tối đa 30 phút). Với hồ nhỏ, chỉ nên xả từ 30 đến 40 giây. Khi không bật chế độ nuôi nào, máy sẽ chuyển sang chạy xả theo lịch định kỳ (mục 7.3).`,
  },
  {
    id: 'sec-6',
    number: 6,
    title: 'Lọc và xả bằng tay',
    summary: 'Can thiệp nhanh khi cần hút cặn đáy, thay nước đột xuất hoặc xả áp lực khí bình lọc.',
    highlights: [
      'Bật tắt lọc và xả tức thì không cần chờ lịch.',
      'Cơ chế an toàn: Mọi lần xả tay đều tự động ngắt sau tối đa 30 phút, chống tràn nước khi lỡ quên.',
      'Chế độ xả áp lực khí XAP bật đồng thời cả XẢ và LỌC để xả hơi bình lọc an toàn.',
    ],
    content: `Bạn có thể bật hoặc tắt lọc và xả bất cứ khi nào theo ý muốn mà không cần chờ đến khung giờ lịch trình.

Thao tác vận hành bằng tay:
• Muốn lọc ngay / dừng lọc: Giữ nút LỌC 1 giây rồi thả. Máy lập tức bật bơm và mở van lọc (hoặc tắt đi nếu đang chạy). Lưu ý: Thao tác này sẽ tạm bỏ qua lịch lọc tự động cho tới khi bạn chọn lại lịch.
• Muốn xả ngay / dừng xả: Giữ nút XẢ 1 giây rồi thả. Bật bơm và mở van xả. Thao tác xả tay hoàn toàn độc lập và không làm ảnh hưởng đến lịch xả cố định.
• Xả áp lực khí trong bình lọc (XAP): Khi máy đang rảnh (không lọc, không xả), giữ nút OK trong 5 giây. Máy sẽ bật đồng thời cả van XẢ và van LỌC để xả sạch áp lực khí và bọt hơi tích tụ trong bình/trụ lọc an toàn, màn hình hiển thị chữ XAP. Tự động tắt sau 30 giây hoặc chạm nút OK để dừng sớm.

Lưu ý đặc biệt: Khi đang lọc mà máy tự động xả do TDS cao, cả van lọc và van xả sẽ cùng mở đồng thời. Sau khi tắt lọc ở lịch 100 (thủ công), nếu sau 30 giây không bật lại thì máy sẽ tự chuyển về lịch tiêu chuẩn 23h - 5h.`,
  },
  {
    id: 'sec-7',
    number: 7,
    title: 'Cài đặt bằng nút nhấn trên mặt máy',
    summary: 'Cây menu cài đặt trực tiếp qua phím vật lý: chỉnh ngưỡng TDS, lịch lọc (LOC), lịch xả (XA).',
    highlights: [
      'Dùng ▲ UP / ▼ DOWN để tăng giảm số, chạm OK để chuyển bước hoặc lưu.',
      'Tự động thoát: Nếu không bấm phím trong 10 giây, máy tự lưu các bước đã OK và quay về màn hình TDS.',
      'Quy ước hiển thị: Chữ P là Phút (P00-P30), chữ G là Giây (G00-G59).',
    ],
    content: `Mọi cài đặt cốt lõi đều thao tác trực tiếp trên mặt máy mà không bắt buộc phải có điện thoại.
Quy tắc chung: Dùng ▲ UP / ▼ DOWN để đổi số, chạm OK để sang bước tiếp theo. Nếu dừng bấm quá 10 giây, máy tự thoát ra màn hình chính và lưu lại những bước bạn đã bấm OK.

7.1 Cài ngưỡng TDS và thời gian xả của một chế độ nuôi:
Giữ nút chế độ tương ứng (TÉP, CÁ, CÂY hoặc CUSTOM) trong 5 giây, sau đó:
1. Chỉnh mức TDS Lo → Chạm OK.
2. Chỉnh mức TDS Hi (mức bắt đầu tự xả) → Chạm OK.
3. Màn hình hiện P05: Chỉnh số phút xả (0 - 30) → Chạm OK.
4. Màn hình hiện G30: Chỉnh số giây xả (0 - 59) → Chạm OK để lưu.
(Mẹo: Muốn đổi nhanh thời gian xả của chế độ đang bật mà không đổi TDS, giữ cùng lúc nút chế độ đó và OK trong 5 giây).

7.2 Cài đặt Lịch Lọc:
Giữ nút SETTING 5 giây → Màn hình hiện chữ "LOC" → Chạm OK:
1. Chọn kiểu lịch: 100 (thủ công), 101 (8h-12h & 14h-17h, 20p/h), 102 (19h-5h, 30p/h), 103 (mặc định 23h-5h, 30p/h), 104 (cả ngày, 10p/h) → Chạm OK.
2. Chọn chu kỳ ngày: C07 (mỗi ngày), C24 (ngày chẵn), C13 (ngày lẻ), C03 (3 ngày 1 lần), Ctu (theo thứ) → Chạm OK.
3. Chọn số phút lọc mỗi giờ (từ 1 đến 60 phút) → Chạm OK để lưu hoàn tất.

7.3 Cài đặt Lịch Xả (khi không bật chế độ nuôi):
Giữ SETTING 5 giây (hiện LOC) → Giữ SETTING thêm 5 giây nữa (màn hình chuyển sang "XA") → Chạm OK:
1. Chọn kiểu lịch: nd (mỗi N ngày) hoặc Ctu (theo thứ) → Chạm OK.
2. Chọn số lần xả mỗi ngày (từ 1 đến 8 lần) → Chạm OK (các lần xả tự chia đều khoảng cách trong ngày).
3. Chọn giờ bắt đầu (0 - 23) → Chạm OK.
4. Chọn phút bắt đầu (0 - 59) → Chạm OK.
5. Cài thời gian xả: P phút → OK → G giây → Chạm OK để lưu.`,
  },
  {
    id: 'sec-8',
    number: 8,
    title: 'Điều khiển qua điện thoại & Web UI',
    summary: 'Hướng dẫn phát WiFi riêng CITO UF SYSTEM, kết nối WiFi nhà, mDNS cito-uf.local và bảng 10 tính năng trên web.',
    highlights: [
      'Máy luôn phát điểm truy cập WiFi riêng: "CITO UF SYSTEM", mật khẩu: "citocito".',
      'Truy cập qua trình duyệt: http://192.168.4.1 (không cần cài ứng dụng).',
      'Hỗ trợ mDNS: thiết bị Apple và PC có thể truy cập bằng tên miền http://cito-uf.local.',
      'Trang web tự động cập nhật dữ liệu mỗi 2 giây không cần tải lại.',
    ],
    content: `Máy lọc CITO UF tích hợp sẵn Web Server nội bộ. Bạn có thể sử dụng bất kỳ điện thoại, máy tính bảng hay máy tính nào để điều khiển mà không cần cài đặt thêm app từ kho ứng dụng.

8.1 Kết nối WiFi nhà (nên thực hiện 1 lần):
1. Dùng điện thoại kết nối vào sóng WiFi "CITO UF SYSTEM" (Mật khẩu: citocito).
2. Mở trình duyệt web gõ địa chỉ: http://192.168.4.1.
3. Kéo xuống mục "WiFi", chọn tên mạng WiFi gia đình bạn, nhập mật khẩu và nhấn "Kết Nối".
4. Màn hình sẽ hiện địa chỉ IP mới trong mạng nhà (ví dụ http://192.168.1.55). Hãy lưu lại địa chỉ này.
5. Từ lúc này, điện thoại ở chung mạng WiFi nhà chỉ cần truy cập địa chỉ IP đó, hoặc gõ http://cito-uf.local (đối với iPhone, iPad, Mac, Windows).

8.2 Danh mục kiểm soát trên trang web (cập nhật real-time 2s):
• Trạng thái đầu trang: TDS, nhiệt độ, giờ thực, trạng thái lọc/xả, thông báo lỗi, dòng điện tiêu thụ (mA), thời gian đếm ngược lần chạy kế tiếp.
• Chế độ: Tắt / Tép / Cá / Cây / Custom.
• Cài đặt TDS: Tinh chỉnh Lo, Hi và thời gian xả chi tiết theo giây.
• Lọc: Lựa chọn lịch 100-104, chọn từng thứ trong tuần (Ctu).
• Bơm: Lựa chọn Bơm nhỏ / Bơm lớn và tinh chỉnh ngưỡng mA.
• Xả: Thiết lập chu kỳ N ngày, số lần trong ngày, giờ bắt đầu.
• Cảm biến: Chọn đo theo chu kỳ 1 giờ hay đo Real-time; nút bấm "Đo ngay".
• Điều khiển: Nút bật tắt Lọc, Xả; bật chế độ Ban đêm; tắt màn hình khi ngủ; chỉnh độ nhạy giữ nút (0.5s - 3s); nút RESET về mặc định.
• Hiệu ứng LED Logo: 8 hiệu ứng ánh sáng RGB và điều chỉnh tốc độ chuyển màu.
• WiFi & Giờ RTC: Cấu hình mạng WiFi và nút bấm 1 chạm đồng bộ giờ điện thoại vào máy lọc.`,
  },
  {
    id: 'sec-9',
    number: 9,
    title: 'Chế độ ngủ và Ban đêm',
    summary: 'Cơ chế tự động giảm chói mắt cho không gian nghỉ ngơi nhưng vẫn đảm bảo toàn bộ chu trình lọc chạy ngầm 100%.',
    highlights: [
      'Tự động vào trạng thái ngủ sau 2 phút nếu không có thao tác.',
      'Cú chạm đầu tiên khi máy đang ngủ chỉ đóng vai trò đánh thức, không gây kích hoạt nhầm tính năng.',
      'Chế độ Ban đêm (trên Web): tắt sạch 100% các đèn báo và logo, êm dịu tuyệt đối trong phòng ngủ.',
    ],
    content: `Sau 2 phút không có ai chạm vào bảng điều khiển, máy sẽ tự động chuyển sang chế độ ngủ để giảm độ sáng trong phòng.

Trạng thái hoạt động khi máy đang ngủ:
• Toàn bộ các quy trình ngầm vẫn hoạt động bình thường 100%: lọc nước theo lịch, tự xả nước bẩn khi TDS vượt ngưỡng, kiểm tra cảm biến dòng, giám sát an toàn.
• Máy sẽ không vào chế độ ngủ nếu đang trong quá trình bơm lọc, đang xả nước hoặc đang cảnh báo lỗi quá dòng.
• Các đèn báo trạng thái thiết yếu (LỌC, XẢ, đèn chế độ nuôi, đèn lỗi ERR) vẫn sáng đúng theo tình trạng thực tế của máy.
• Màn hình số và Logo: Có thể tùy biến trong mục "Màn hình khi ngủ" trên trang web (BẬT = tiếp tục hiện TDS và sáng logo; TẮT = tắt cả hai).

Cách đánh thức máy:
Chạm nhẹ vào bất kỳ nút nào trên mặt máy (không cần giữ 1 giây). Màn hình số và hệ thống đèn sẽ bừng sáng trở lại ngay lập tức. Cú chạm đánh thức đầu tiên hoàn toàn không kích hoạt lệnh của nút đó, do đó bạn hoàn toàn an tâm không sợ bấm nhầm. Muốn thao tác, chỉ cần thả tay ra rồi chạm lại lần thứ hai. Thao tác trên trang web điện thoại cũng lập tức đánh thức máy.

Chế độ Ban đêm (Night Mode):
Kích hoạt trên Web (Điều Khiển → Ban đêm): Máy sẽ tắt toàn bộ đèn LED báo hiệu và tắt đèn logo, phù hợp đặt trong phòng ngủ. Máy vẫn lọc nước và bảo vệ bể âm thầm.`,
  },
  {
    id: 'sec-10',
    number: 10,
    title: 'Bảng mã lỗi và cách xử lý',
    summary: 'Cẩm nang chẩn đoán mã lỗi Err 222, 666, 111, 555, FLt, Er2, --- và các chế độ XAP, rES.',
    highlights: [
      'Cơ chế hiển thị lỗi: Màn hình số LED trắng luôn hiển thị chữ "Err" xen kẽ với mã lỗi (chu kỳ 1 giây, ví dụ: Err ↔ 222).',
      'Mã 222 & 666: Lỗi quá dòng Bơm / Van xả, máy ngắt khẩn cấp để bảo vệ phần cứng, cần kiểm tra dị vật kẹt trước khi chạm OK.',
      'Mã 111 & 555: Bơm / Van kích hoạt nhưng không có dòng điện tiêu thụ (đứt dây, lỏng giắc), tự biến mất khi dòng điện ổn định.',
      'Mã FLt: Cảnh báo màng lọc UF bị bẩn, máy vẫn tiếp tục bơm lọc nhưng cần lên lịch súc rửa hoặc thay lõi sớm.',
      'Nhiệt độ là tùy chọn (optional): Không có cảm biến thì máy chỉ hiện số TDS, hoàn toàn không báo lỗi.',
      'Chế độ XAP: Xả áp lực khí trong bình lọc (bật đồng thời cả XẢ và LỌC để xả hơi bình lọc).',
      'Chế độ rES: Khôi phục cài đặt gốc, chạy 3.5s rồi tự động trở về hoạt động bình thường.',
    ],
    content: `Khi phát sinh sự cố, màn hình mặt máy luôn nhấp nháy luân phiên chữ "Err" xen kẽ với mã lỗi (chu kỳ 1 giây: "Err" ↔ Mã lỗi). Hệ thống đèn LED trắng tương ứng (ERR1, ERR2, LỌC) sẽ nhấp nháy để chỉ báo phân loại sự cố. Đồng thời, giao diện web điều khiển cũng hiển thị rõ thông tin lỗi ngay đầu trang.

Bảng tra cứu mã lỗi chuẩn của máy:
1. Err ↔ 222 (Đèn ERR1 nhấp nháy): Bơm quá dòng, máy đã ngắt điện khẩn cấp.
→ Nguyên nhân: Cánh bơm bị kẹt rác, ốc sên, rong rêu hoặc van nước ra vào bị khóa chặt.
→ Xử lý: Rút điện, tháo buồng bơm kiểm tra dị vật, mở thông các van. Sau khi khắc phục xong, chạm OK trên máy để chạy lại.

2. Err ↔ 666 (Đèn ERR1 nhấp nháy): Van xả quá dòng, ngắt khẩn cấp.
→ Nguyên nhân: Kẹt cát trong piston van xả hoặc chập cuộn coil van.
→ Xử lý: Kiểm tra cơ cấu van xả, vệ sinh hạt cặn. Xử lý xong chạm OK.

3. Err ↔ 111 (Đèn ERR1 nhấp nháy): Bơm được kích hoạt nhưng dòng điện = 0.
→ Nguyên nhân: Cháy motor bơm, đứt dây hoặc lỏng giắc cắm. Hoặc cấu hình nhầm loại Bơm lớn trên trang web.
→ Xử lý: Kiểm tra lại giắc cắm, dây dẫn và kiểm tra loại bơm đã chọn đúng chưa. Tự động xóa lỗi khi dòng điện phục hồi.

4. Err ↔ 555 (Đèn ERR1 nhấp nháy): Van xả được kích hoạt nhưng không có dòng điện.
→ Nguyên nhân: Đứt dây van hoặc hỏng cuộn coil van xả. Tự hết khi tiếp xúc dòng điện phục hồi trong vài giây.

5. Err ↔ FLt (Đèn LỌC nhấp nháy + ERR2 nhấp nháy): Lõi lọc UF bị bẩn, lưu lượng nghẽn.
→ Đặc điểm: Máy vẫn tiếp tục bơm lọc bình thường. Bạn tháo lõi UF súc ngược bằng nước sạch hoặc thay lõi mới, sau đó chạm OK để xóa cảnh báo.

6. Err ↔ Er2 (Chỉ đèn ERR2 nhấp nháy): Mất giờ RTC hoặc chưa cắm cảm biến dòng điện bo mạch.
→ Xử lý: Kết nối lại WiFi nhà để máy tự đồng bộ giờ chuẩn Internet qua NTP, hoặc vào trang web http://192.168.4.1 để cập nhật giờ.

7. Err ↔ --- (Đèn ERR2 nhấp nháy): Mất tín hiệu cảm biến TDS.
→ Nguyên nhân: Giắc cắm cảm biến TDS chưa cắm chặt hoặc điện cực titan bị bám màng cách điện. Cắm lại giắc và vệ sinh nhẹ điện cực.

* Lưu ý quan trọng về Cảm biến Nhiệt độ:
Cảm biến nhiệt độ là tùy chọn (optional). Nếu máy hoặc bể thủy sinh không lắp cảm biến nhiệt độ thì màn hình chỉ hiển thị số đo TDS và không hiển thị nhiệt độ (hoàn toàn không báo lỗi). Khi có gắn cảm biến nhiệt độ, màn hình sẽ tự động luân phiên hiển thị TDS (4 giây) và nhiệt độ nước (2 giây).

* Chế độ XAP — Xả áp lực khí trong bình lọc:
Khi kích hoạt (giữ nút OK trong 5 giây lúc máy rảnh), thiết bị sẽ bật đồng thời cả bơm/van XẢ và van LỌC để xả hơi và áp lực khí tích tụ trong bình/trụ lọc an toàn, màn hình hiển thị chữ XAP. Tự dừng sau 30 giây hoặc bấm OK để dừng sớm.

* Chế độ rES — Khôi phục cài đặt gốc:
Khi giữ nút OK trong 10 giây, máy phát 5 tiếng bíp và hiển thị chữ rES. Chế độ này sẽ chạy trong khoảng thời gian 3.5 giây, sau đó máy tự khởi động lại và trở về hoạt động đo TDS bình thường.`,
  },
  {
    id: 'sec-11',
    number: 11,
    title: 'Câu hỏi thường gặp (FAQ)',
    summary: 'Giải đáp nhanh các thắc mắc phổ biến nhất khi sử dụng máy lọc CITO UF trong thực tế.',
    highlights: [
      'Chạm nút không ăn: Cần giữ đủ 1 giây cho đến khi hiện --- và nghe tiếng bíp.',
      'TDS đứng yên 1 giờ: Hiện tượng bình thường vì mặc định máy đo định kỳ 1 giờ/lần.',
      'Máy tự bật lọc 20 giây rồi tắt: Máy chủ động mồi nước qua buồng đo để lấy chỉ số TDS chính xác.',
    ],
    content: `Dưới đây là tổng hợp những câu hỏi người dùng hay gặp nhất trong quá trình vận hành:

• Chạm nút mà máy không làm gì?
Trả lời: Hãy giữ ngón tay trên nút cho tới khi màn hình chuyển đủ từ "-" qua "--" tới "---" và phát ra tiếng bíp rồi mới nhấc tay ra. Nếu máy đang ở chế độ ngủ, cú chạm đầu tiên chỉ để đánh thức máy; bạn hãy thả tay ra rồi chạm lại lần thứ hai.

• Số TDS đứng yên cả tiếng không đổi?
Trả lời: Đây là trạng thái hoàn toàn bình thường. Mặc định cảm biến chỉ đo mỗi 1 tiếng 1 lần và ghim số đo đó lại để tiết kiệm điện và chống đo sai khi nước đứng yên. Muốn kiểm tra ngay, bạn bấm nút "Đo ngay" trên web, hoặc đổi chế độ sang "Real-time".

• Vì sao thỉnh thoảng máy tự bật lọc khoảng 20 giây rồi lại tự tắt?
Trả lời: Cảm biến TDS nằm sâu trong đường ống kín, nên máy cần nước lưu thông để quét được mẫu nước đại diện thực tế của bể. Tính năng này được bật sẵn ("Tự chạy lọc đo mỗi 1 tiếng"). Nếu không muốn, bạn có thể tắt đi trong giao diện web.

• Hồ nhỏ thì thời gian xả 1 phút là quá nhiều nước?
Trả lời: Bạn hoàn toàn có thể cài đặt thời gian xả theo từng giây, ví dụ 0 phút 30 giây hoặc 0 phút 40 giây (thực hiện theo mục 7.1 hoặc chỉnh trên Web → Cài Đặt TDS).

• Quên địa chỉ IP truy cập trang web?
Trả lời: Chỉ cần mở điện thoại kết nối vào WiFi riêng của máy: "CITO UF SYSTEM" (pass: citocito), rồi mở trình duyệt vào http://192.168.4.1. Trong mục WiFi của trang này sẽ hiển thị rõ IP hiện tại của máy trong mạng nhà bạn.

• Mất WiFi hoặc mất điện có ảnh hưởng gì không?
Trả lời: Hoàn toàn không sao! Máy trang bị pin CMOS lưu giữ giờ RTC và bộ nhớ EEPROM lưu giữ mọi thông số. Khi có điện lại máy sẽ tiếp tục chạy chuẩn xác theo lịch trình mà không bị mất dữ liệu.

• Lọc không chạy theo lịch nữa?
Trả lời: Có thể bạn đã vô tình bấm bật/tắt lọc bằng tay khiến máy tạm rời khỏi chu trình tự động. Hãy vào mục Lọc trên Web và bấm nút "Lưu", hoặc vào menu SETTING trên máy để kích hoạt lại lịch lọc.

• Cách khôi phục cài đặt gốc (Reset Factory):
Cách 1: Vào Web → Điều Khiển → Bấm nút "RESET".
Cách 2: Giữ nút OK trong 10 giây khi máy đang lọc hoặc đang xả cho đến khi màn hình nhấp nháy "rES" và kêu 5 tiếng bíp.`,
  },
  {
    id: 'sec-12',
    number: 12,
    title: 'Thông số kỹ thuật & Giá trị mặc định',
    summary: 'Bảng tra cứu thông số phần cứng, dải đo, giới hạn dung sai và cấu hình xuất xưởng gốc.',
    highlights: [
      'Bộ điều khiển 10 nút cảm ứng điện dung, màn hình số 3 ký tự, WiFi 2.4 GHz tích hợp.',
      'Dải đo TDS: 0 – 999 ppm, Nhiệt độ nước: -9 đến 99 °C.',
      'Thời gian xả nước an toàn: 5 giây đến tối đa 30 phút.',
    ],
    content: `Bảng thông số kỹ thuật phần cứng:
• Phương thức điều khiển: 10 nút cảm ứng điện dung, màn hình 3 LED 7 thanh, kết nối không dây WiFi 2.4 GHz.
• Điểm phát WiFi riêng (AP): Tên mạng "CITO UF SYSTEM" · Mật khẩu "citocito" · Cổng truy cập mặc định: http://192.168.4.1.
• Thang đo TDS: 0 – 999 ppm.
• Thang đo nhiệt độ: Trên màn hình mặt máy hiện từ -9 đến 99 °C (dạng 26C); trên giao diện web hiển thị chi tiết 1 chữ số thập phân.
• Đồng hồ thời gian thực (RTC): Có pin nuôi độc lập; tự động đồng bộ giờ chuẩn Internet khi có WiFi.
• Thời gian xả nước mỗi lần: Cho phép cài từ 5 giây đến 30 phút (tự động ngắt cứng sau tối đa 30 phút chống tràn bể).

Bảng giá trị cài đặt mặc định khi mới mua (hoặc sau khi bấm RESET):
• Chế độ nuôi: TẮT (Chạy theo lịch định kỳ).
• Lịch lọc: Kiểu 103 (Khung giờ 23h đêm – 5h sáng hôm sau, mỗi giờ lọc 30 phút, chạy mỗi ngày C07).
• Lịch xả: Mỗi 3 ngày xả 1 lần vào lúc 12h00 trưa, thời gian xả 1 phút.
• Phương thức đo TDS & Nhiệt độ: Mỗi 1 tiếng đo 1 lần; Tự chạy lọc để đo: BẬT.
• Cấu hình loại bơm: Bơm nhỏ (Dòng min 40mA / Cảnh báo lọc bẩn 600mA / Dừng khẩn cấp 700mA).
• Thời gian giữ nút cảm ứng: 1 giây.
• Chế độ tự ngủ màn hình: Tự kích hoạt sau 2 phút không có thao tác.
• Màn hình khi ngủ: BẬT (vẫn luân phiên hiện TDS & sáng logo).
• Chế độ Ban đêm (Night Mode): TẮT.
• Xả áp suất trong ống (XAP): Tự động ngắt sau 30 giây.
• Menu cài đặt mặt máy: Tự động lưu và thoát về màn hình đo sau 10 giây nếu không bấm.`,
  },
];
