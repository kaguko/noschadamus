# 02. Đặc tả dữ liệu và nội dung

Mọi số liệu và câu chữ ở đây là **nguồn sự thật**. Triển khai chỉ chuyển nguyên văn vào `data/`.

## 1. Cấu trúc thư mục dữ liệu

```
data/
├── cards/
│   ├── major.json            # 22 lá Ẩn Chính
│   ├── minor-wands.json      # 14 lá
│   ├── minor-cups.json       # 14 lá
│   ├── minor-swords.json     # 14 lá
│   └── minor-pentacles.json  # 14 lá
├── spreads.json
└── text/
    └── axes.vi.json          # tagline, insight, invite, prompts theo trục
messages/
└── vi.json                   # toàn bộ chuỗi giao diện
scripts/
├── generate-minor-vectors.ts # sinh vector 56 lá phụ từ công thức mục 4
└── validate-cards.ts         # npm run cards:validate
```

### Schema một lá (JSON)

```json
{
  "id": "major-17",
  "arcana": "major",
  "suit": null,
  "rank": null,
  "number": 17,
  "name": { "vi": "Ngôi Sao", "en": "The Star" },
  "keywords": {
    "upright":  ["Hy vọng", "Chữa lành", "Cởi mở"],
    "reversed": ["Mất phương hướng", "Mệt mỏi", "Ngờ vực"]
  },
  "meaning": { "upright": "…", "reversed": "…" },
  "prompts": { "upright": ["…", "…"], "reversed": ["…", "…"] },
  "vector": { "energy": 0.40, "emotion": 0.80, "connection": 0.70, "grounding": 0.50, "mind": 0.55, "change": 0.55 }
}
```

Quy tắc `validate-cards.ts` (thất bại → exit 1):
- Tổng 78 lá, `id` duy nhất; id dạng `major-00…major-21` và `{suit}-{rank}` (rank: `ace`, `2`…`10`, `page`, `knight`, `queen`, `king`).
- Vector đủ 6 khóa, mỗi giá trị trong [0,1].
- `keywords`: đúng 3 chuỗi/hướng; `prompts`: đúng 2 chuỗi/hướng; mọi chuỗi không rỗng.
- `meaning` mỗi hướng dài **100-280 ký tự**, tối đa 3 câu.
- Mỗi `prompt` kết thúc bằng `?`, dài 20-120 ký tự.
- Không chứa từ trong danh sách cấm (mục 7).
- Với 56 lá phụ: vector phải khớp công thức mục 4 (sai số ≤ 0.0005).

## 2. Vector và từ khóa 22 lá Ẩn Chính

Cột vector theo đúng `AXIS_ORDER`: E=energy, Em=emotion, C=connection, G=grounding, M=mind, Ch=change.

| id | Tên vi | Name en | E | Em | C | G | M | Ch | Từ khóa xuôi | Từ khóa ngược |
|---|---|---|---|---|---|---|---|---|---|---|
| major-00 | Chàng Khờ | The Fool | .75 | .55 | .45 | .15 | .25 | .90 | Khởi đầu · Tự do · Tin tưởng | Liều lĩnh · Do dự · Chưa sẵn sàng |
| major-01 | Nhà Ảo Thuật | The Magician | .90 | .40 | .45 | .55 | .85 | .70 | Chủ động · Khéo léo · Tập trung | Phân tán · Che giấu · Tự nghi ngờ |
| major-02 | Nữ Tư Tế | The High Priestess | .25 | .75 | .35 | .50 | .70 | .30 | Trực giác · Lặng lẽ · Bí ẩn | Phớt lờ trực giác · Giấu kín · Mơ hồ |
| major-03 | Hoàng Hậu | The Empress | .60 | .85 | .80 | .85 | .35 | .45 | Nuôi dưỡng · Dồi dào · Giác quan | Kiệt sức vì cho đi · Phụ thuộc · Trì trệ |
| major-04 | Hoàng Đế | The Emperor | .70 | .25 | .40 | .90 | .85 | .20 | Cấu trúc · Kỷ luật · Bảo vệ | Cứng nhắc · Kiểm soát · Thiếu kỷ luật |
| major-05 | Giáo Hoàng | The Hierophant | .40 | .45 | .75 | .80 | .70 | .15 | Truyền thống · Học hỏi · Thuộc về | Nổi loạn · Rập khuôn · Lối riêng |
| major-06 | Những Người Yêu Nhau | The Lovers | .60 | .85 | .95 | .40 | .50 | .55 | Lựa chọn · Hòa hợp · Giá trị | Bất hòa · Do dự · Lệch giá trị |
| major-07 | Cỗ Xe | The Chariot | .90 | .35 | .30 | .55 | .75 | .75 | Quyết tâm · Hướng tới · Tự chủ | Lạc hướng · Hấp tấp · Mất kiểm soát |
| major-08 | Sức Mạnh | Strength | .70 | .80 | .65 | .75 | .50 | .35 | Kiên nhẫn · Can đảm dịu · Tự tin nội tại | Tự ngờ vực · Cạn sức · Kìm nén |
| major-09 | Ẩn Sĩ | The Hermit | .20 | .45 | .15 | .65 | .85 | .30 | Tự soi · Tĩnh lặng · Tìm ý nghĩa | Cô lập · Né tránh · Rút lui quá lâu |
| major-10 | Bánh Xe Xoay Vần | Wheel of Fortune | .60 | .45 | .50 | .25 | .35 | .95 | Chu kỳ · Cơ hội · Chuyển mình | Cưỡng lại · Trì trệ · Thấy mất quyền |
| major-11 | Công Lý | Justice | .45 | .25 | .55 | .75 | .95 | .35 | Công bằng · Sự thật · Trách nhiệm | Thiên lệch · Né trách nhiệm · Thiếu minh bạch |
| major-12 | Người Treo Ngược | The Hanged Man | .15 | .55 | .35 | .30 | .70 | .65 | Đổi góc nhìn · Tạm dừng · Buông | Chần chừ · Hy sinh vô ích · Bế tắc |
| major-13 | Cái Chết | Death | .40 | .50 | .20 | .35 | .45 | 1.00 | Kết thúc · Chuyển hóa · Buông | Níu giữ · Chậm lại · Sợ mất |
| major-14 | Sự Tiết Chế | Temperance | .45 | .70 | .65 | .80 | .60 | .50 | Cân bằng · Hòa trộn · Kiên nhẫn | Mất cân bằng · Thái quá · Vội vàng |
| major-15 | Ác Quỷ | The Devil | .70 | .80 | .65 | .40 | .25 | .10 | Ràng buộc · Ham muốn · Thói quen | Giải thoát · Nhận ra xiềng xích · Bứt ra |
| major-16 | Tòa Tháp | The Tower | .95 | .70 | .20 | .05 | .35 | .95 | Đổ vỡ · Thức tỉnh · Giải phóng | Chống cự · Sửa chữa · Trì hoãn |
| major-17 | Ngôi Sao | The Star | .40 | .80 | .70 | .50 | .55 | .55 | Hy vọng · Chữa lành · Cởi mở | Mất phương hướng · Mệt mỏi · Ngờ vực |
| major-18 | Mặt Trăng | The Moon | .30 | .90 | .35 | .20 | .30 | .50 | Mơ hồ · Trực giác · Bóng tối trong lòng | Rõ dần · Nỗi sợ lộ diện · Thoát mê |
| major-19 | Mặt Trời | The Sun | .95 | .85 | .85 | .70 | .50 | .50 | Niềm vui · Rõ ràng · Sức sống | Vui bị che · Lạc quan quá mức · Chậm nắng |
| major-20 | Phán Xét | Judgement | .70 | .65 | .60 | .45 | .70 | .85 | Thức tỉnh · Nhìn lại · Tha thứ | Tự phán xét · Né nhìn lại · Do dự |
| major-21 | Thế Giới | The World | .70 | .70 | .75 | .90 | .65 | .55 | Trọn vẹn · Hoàn thành · Thuộc về | Dang dở · Chậm khép · Thiếu một mảnh |

Chép giá trị vector **nguyên văn** (ví dụ `.75` → `0.75`). Ba lá `major-00`, `major-16`, `major-17` là đầu vào của test vàng (file 01 mục 3.2).

## 3. Tên 56 lá phụ

| Bộ | vi | en |
|---|---|---|
| wands | Gậy | Wands |
| cups | Cốc | Cups |
| swords | Kiếm | Swords |
| pentacles | Tiền | Pentacles |

| rank | vi | en | `number` |
|---|---|---|---|
| ace | Át | Ace | 1 |
| 2…10 | Hai…Mười | 2…10 | 2…10 |
| page | Thị Đồng | Page | 11 |
| knight | Hiệp Sĩ | Knight | 12 |
| queen | Hoàng Hậu | Queen | 13 |
| king | Vua | King | 14 |

Tên: `"{rank.vi} {suit.vi}"` (vd. `Át Cốc`, `Hiệp Sĩ Kiếm`) và `"{rank.en} of {suit.en}"` (vd. `Ace of Cups`; với các lá cung đình `Page of Wands`).

## 4. Công thức vector 56 lá phụ

Vector cơ sở theo bộ (đúng thứ tự `AXIS_ORDER`):

| Bộ | energy | emotion | connection | grounding | mind | change |
|---|---|---|---|---|---|---|
| wands | .85 | .50 | .40 | .30 | .45 | .70 |
| cups | .40 | .85 | .75 | .45 | .30 | .40 |
| swords | .55 | .30 | .25 | .30 | .85 | .60 |
| pentacles | .40 | .40 | .55 | .85 | .50 | .20 |

Hệ số cường độ `k` theo rank:

| rank | ace | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | page/knight/queen/king |
|---|---|---|---|---|---|---|---|---|---|---|---|
| k | .30 | −.20 | .00 | −.10 | .40 | −.10 | .10 | .00 | .20 | .50 | .00 |

Độ lệch cộng thêm cho lá cung đình (chỉ trục liệt kê):

| rank | Offset |
|---|---|
| page | change +.15, mind +.05 |
| knight | energy +.20, change +.10 |
| queen | emotion +.15, connection +.10 |
| king | mind +.15, grounding +.10 |

Công thức: `v_i = clamp01( base_i + k * (base_i − 0.5) + offset_i )`, làm tròn **3 chữ số thập phân** (half-up), ghi vào JSON.

Ví dụ kiểm (bắt buộc có test):

| Lá | energy | emotion | connection | grounding | mind | change |
|---|---|---|---|---|---|---|
| `cups-ace` | .370 | .955 | .825 | .435 | .240 | .370 |
| `swords-5` | .570 | .220 | .150 | .220 | .990 | .640 |
| `pentacles-king` | .400 | .400 | .550 | .950 | .650 | .200 |

## 5. Văn bản mẫu đã chốt (5 lá)

Các lá dưới đây **đã viết xong**, chép nguyên văn. 73 lá còn lại phải viết mới theo cùng giọng, độ dài và quy tắc ở mục 7 và 10.

**major-00 · Chàng Khờ / The Fool**
- Xuôi: *Một khoảng trống mới đang mở ra trước mặt bạn. Lá bài này không hứa hẹn điều gì sẽ xảy ra; nó chỉ nhắc rằng bước đầu tiên thường nhẹ hơn ta tưởng.*
  - Prompts: `Nếu không sợ sai, bạn sẽ thử điều gì đầu tiên?` · `Điều gì bạn đang chờ được "sẵn sàng" mới bắt đầu?`
- Ngược: *Có thể bạn đang đứng sát mép một quyết định mà chưa kịp nhìn xuống chân. Đảo ngược không phải điềm gì xấu, chỉ là lời mời chậm lại một nhịp.*
  - Prompts: `Phần nào trong bạn muốn lao tới, và phần nào muốn dừng lại?` · `Một bước nhỏ nào giúp bạn nhìn rõ chân mình hơn?`

**major-13 · Cái Chết / Death**
- Xuôi: *Lá bài này hiếm khi nói về cái chết thật. Nó nói về một chương đang khép lại để chừa chỗ cho chương khác, và bạn được phép tiễn chương cũ thật tử tế.*
  - Prompts: `Điều gì đã làm xong nhiệm vụ của nó trong đời bạn?` · `Bạn muốn mang theo điều gì sang chương sau?`
- Ngược: *Có điều bạn biết đã đến lúc buông nhưng tay vẫn còn nắm. Không sao cả, buông cũng cần thời gian, và nắm thêm một chút không phải là yếu đuối.*
  - Prompts: `Bạn sợ mất điều gì nếu buông tay?` · `Phần nào của điều cũ vẫn đáng được giữ lại?`

**major-16 · Tòa Tháp / The Tower**
- Xuôi: *Một cấu trúc từng có vẻ chắc chắn đang lộ ra vết nứt. Sự rung chuyển này khó chịu, nhưng thường nó chỉ lấy đi những gì không còn đứng vững bằng sự thật.*
  - Prompts: `Điều gì trong đời bạn đã thôi chắc chắn từ lâu?` · `Nếu nó sụp xuống, điều gì vẫn còn lại với bạn?`
- Ngược: *Bạn có thể đang gồng giữ một thứ đã lung lay từ lâu. Đảo ngược gợi ý rằng thay đổi vẫn đang chờ, và cách bạn đón nó là phần bạn chọn được.*
  - Prompts: `Bạn đang tốn sức giữ điều gì cho khỏi nghiêng?` · `Bạn có thể tháo gỡ nó từng chút một không?`

**major-17 · Ngôi Sao / The Star**
- Xuôi: *Sau một quãng khó, có một khoảng lặng dịu để thở. Lá bài gợi ý rằng bạn được phép hy vọng mà không cần chứng minh điều gì với ai.*
  - Prompts: `Điều gì gần đây khiến bạn thấy nhẹ lòng, dù chỉ một chút?` · `Bạn muốn nuôi dưỡng niềm hy vọng nào?`
- Ngược: *Ánh sáng vẫn ở đó, chỉ là hôm nay bạn khó nhìn thấy nó. Đảo ngược nhắc bạn nghỉ ngơi trước khi cố tìm thêm lý do để tin.*
  - Prompts: `Bạn cần được nghỉ ở đâu trước khi đi tiếp?` · `Ai hoặc điều gì từng giúp bạn tin trở lại?`

**cups-ace · Át Cốc / Ace of Cups**
- Xuôi: *Một dòng cảm xúc mới đang đầy lên. Đó có thể là tình cảm, sự sáng tạo, hay chỉ là cảm giác được sống rõ hơn một chút.* Từ khóa: `Cảm xúc mới · Cởi mở · Lòng biết ơn`
  - Prompts: `Điều gì gần đây làm tim bạn mềm ra?` · `Bạn muốn dành chỗ cho cảm xúc nào đang đến?`
- Ngược: *Cảm xúc có thể đang bị cất vào ngăn kéo. Đảo ngược mời bạn mở ra từng chút một, theo tốc độ của riêng bạn.* Từ khóa: `Kìm nén · Cạn kiệt · Khép lòng`
  - Prompts: `Cảm xúc nào bạn chưa cho mình ngồi lại cùng?` · `Bạn cần điều gì để thấy đủ an toàn khi mở lòng?`

## 6. Trải bài (`data/spreads.json`)

```json
[
  {
    "id": "single",
    "name": { "vi": "Một lá" },
    "tagline": { "vi": "Điều cần lắng nghe hôm nay" },
    "positions": [
      { "index": 0, "key": "single", "label": { "vi": "Hôm nay" },
        "description": { "vi": "Một hướng nhìn dành cho khoảnh khắc này." }, "weight": 1.0 }
    ]
  },
  {
    "id": "three",
    "name": { "vi": "Ba lá" },
    "tagline": { "vi": "Quá khứ · Hiện tại · Hướng mở" },
    "positions": [
      { "index": 0, "key": "past", "label": { "vi": "Quá khứ" },
        "description": { "vi": "Điều đã góp phần đưa bạn đến đây." }, "weight": 0.8 },
      { "index": 1, "key": "present", "label": { "vi": "Hiện tại" },
        "description": { "vi": "Điều đang hiện diện rõ nhất lúc này." }, "weight": 1.2 },
      { "index": 2, "key": "opening", "label": { "vi": "Hướng mở" },
        "description": { "vi": "Một khả năng bạn có thể chọn khám phá, không phải điều chắc sẽ đến." }, "weight": 1.0 }
    ]
  }
]
```

## 7. Giọng văn và danh sách cấm

**Nguyên tắc giọng văn**
1. Xưng "bạn". Câu ngắn, ấm, không giáo điều; một câu không quá 28 từ.
2. Dùng động từ khả năng: *có thể, gợi ý, mời, nhắc*. Không khẳng định điều sẽ xảy ra.
3. Lá ngược **không** phải điềm xấu: luôn diễn đạt như "hướng vào trong", "lời mời chậm lại".
4. Câu hỏi suy ngẫm là câu hỏi mở, kết thúc bằng `?`, không phải câu có/không thuần, không ngầm phán xét.
5. Không đưa lời khuyên y tế, tài chính, pháp lý, tình cảm cụ thể ("hãy chia tay", "hãy đầu tư").

**Từ/cụm cấm trong `data/cards`, `data/text` và văn bản sinh ra** (không phân biệt hoa thường; kiểm bằng test R10 và `cards:validate`):

```
chắc chắn sẽ, nhất định sẽ, định mệnh, số phận, vận mệnh, tai họa, tai ương, điềm xấu,
điềm báo, xui xẻo, đen đủi, bạn phải, bạn bắt buộc, sẽ chết, bệnh tật, ung thư, ly hôn,
phá sản, nghiệp chướng, quả báo, lời nguyền, kiếp trước, kiếp sau, trừ tà, bị ám
```

Phạm vi kiểm: dữ liệu bài, bảng chữ theo trục, và mọi chuỗi do `composeInterpretation` sinh ra. **Không** áp cho chuỗi giao diện (ví dụ trang giới thiệu có thể nói "không đoán tương lai").

## 8. Bảng chữ theo trục (`data/text/axes.vi.json`)

**TAGLINE[dominant]** (dòng phụ dưới tiêu đề)

| Axis | Văn bản |
|---|---|
| energy | Bạn đang mang nhiều lửa. Điều còn lại là chọn nơi đặt nó. |
| emotion | Bạn đang cảm rất sâu, và đó cũng là một dạng trí tuệ. |
| connection | Bạn đang hướng về người khác, như thể có nhiều sợi chỉ đang kéo. |
| grounding | Bạn đang bám rễ. Vững để còn có thể lớn. |
| mind | Bạn đang nghĩ rất nhiều. Đầu bạn là một căn phòng sáng đèn. |
| change | Bạn đang đứng giữa cơn gió, mọi thứ chuyển động quanh bạn. |

**INSIGHT[dominant]**

| Axis | Văn bản |
|---|---|
| energy | Năng lượng là trục nổi bật nhất, có thể bạn đang có nhiều thôi thúc hành động hơn bình thường. |
| emotion | Cảm xúc là trục nổi bật nhất, bạn có thể đang cảm nhận mọi thứ rõ và sâu hơn thường lệ. |
| connection | Kết nối là trục nổi bật nhất, các mối quan hệ có thể đang chiếm nhiều chỗ trong tâm trí bạn. |
| grounding | Nền tảng là trục nổi bật nhất, bạn có thể đang cần, hoặc đang có, một cảm giác ổn định. |
| mind | Lý trí là trục nổi bật nhất, bạn có thể đang phân tích, cân nhắc và đi tìm sự rõ ràng. |
| change | Thay đổi là trục nổi bật nhất, có điều gì đó đang dịch chuyển hoặc sắp dịch chuyển. |

**INVITE[quiet]**

| Axis | Văn bản |
|---|---|
| energy | Trục năng lượng khá thưa, có thể bạn đang tiết kiệm sức, và điều đó hoàn toàn hợp lý. |
| emotion | Trục cảm xúc khá thưa, có lẽ đã đến lúc tự hỏi mình thực sự đang cảm thấy gì. |
| connection | Trục kết nối khá thưa, bạn có thể đang cần không gian riêng, hoặc một cuộc trò chuyện chưa nói. |
| grounding | Trục nền tảng khá thưa, một thói quen nhỏ và đều có thể cho bạn thêm điểm tựa. |
| mind | Trục lý trí khá thưa, có lẽ bạn đang đi bằng cảm giác nhiều hơn bằng kế hoạch. |
| change | Trục thay đổi khá thưa, mọi thứ có thể đang yên, hoặc đang chờ bạn khơi lên. |

**DOMINANT_PROMPTS[axis]** (2 câu, chọn bởi `k1`)

| Axis | Câu 0 | Câu 1 |
|---|---|---|
| energy | Bạn muốn dồn sức vào điều gì trước, và điều gì có thể chờ? | Nếu năng lượng này là ngọn lửa, bạn muốn nó sưởi ấm hay thắp sáng điều gì? |
| emotion | Cảm xúc nào đang nói to nhất, và nó muốn bạn biết điều gì? | Bạn có một chỗ an toàn để cảm xúc này được ngồi xuống không? |
| connection | Bạn đang nghĩ đến ai nhiều nhất, và vì sao? | Điều gì bạn muốn nói với một người mà chưa nói? |
| grounding | Điều gì đang giữ bạn vững lúc này, và bạn muốn giữ nó thế nào? | Thói quen nhỏ nào đang nâng đỡ bạn mà bạn chưa ghi nhận? |
| mind | Câu hỏi nào đang chạy trong đầu bạn nhiều nhất? | Nếu viết suy nghĩ xuống giấy rồi gạch bớt, điều gì còn lại? |
| change | Điều gì đang dịch chuyển, và bạn đang chào đón hay chống lại nó? | Bạn cần buông điều gì để bước tiếp nhẹ hơn? |

**QUIET_PROMPTS[axis]** (2 câu, chọn bởi `k2`)

| Axis | Câu 0 | Câu 1 |
|---|---|---|
| energy | Bạn đang tiết kiệm sức cho điều gì? | Một việc nhỏ nào sẽ giúp bạn nạp lại sức hôm nay? |
| emotion | Nếu tự hỏi "mình đang cảm thấy gì", câu trả lời đầu tiên là gì? | Lần gần nhất bạn dành thời gian chỉ để cảm nhận là khi nào? |
| connection | Bạn đang cần ở một mình, hay đang chờ ai đó bắt chuyện? | Ai là người bạn thấy nhẹ nhõm khi ở gần? |
| grounding | Điều gì trong ngày của bạn có thể đều đặn hơn một chút? | Bạn đang thiếu điểm tựa nào: thời gian, nơi chốn, hay con người? |
| mind | Có quyết định nào bạn đang để cảm giác dẫn đường mà muốn kiểm tra lại không? | Nếu viết ra ba lựa chọn của mình, bạn thấy điều gì? |
| change | Điều gì bạn giữ nguyên vì quen, không phải vì đúng? | Thay đổi nhỏ nào bạn tò mò muốn thử? |

Câu mở đầu thêm cho trải một lá (`synthesis`): `Lá bài này gợi một hướng nhìn duy nhất cho hôm nay.`

## 9. Hướng dẫn biên soạn 73 lá còn lại

**Bộ chủ đề (hạt giống nội dung, không chép nguyên):**

| Bộ | Chủ đề |
|---|---|
| Gậy | hành động, đam mê, sáng tạo, tham vọng |
| Cốc | cảm xúc, quan hệ, trực giác, sự nuôi dưỡng |
| Kiếm | tư duy, giao tiếp, quyết định, xung đột |
| Tiền | công việc, vật chất, cơ thể, nền tảng, sự đều đặn |

| Rank | Chủ đề |
|---|---|
| Át | hạt giống, cơ hội mới |
| 2 | lựa chọn, cân bằng giữa hai điều |
| 3 | lớn lên, hợp tác bước đầu |
| 4 | ổn định, nghỉ ngơi, giữ chặt |
| 5 | xung đột, mất mát nhỏ, bất an |
| 6 | hòa giải, cho và nhận, chuyển tiếp |
| 7 | thử thách, đánh giá, phòng thủ |
| 8 | chuyển động, rèn luyện, tập trung |
| 9 | gần hoàn thiện, bền bỉ, đơn độc |
| 10 | trọn vẹn hoặc quá tải |
| Thị Đồng | tò mò, học hỏi, tin nhắn mới |
| Hiệp Sĩ | theo đuổi, hành động, cực đoan của bộ |
| Hoàng Hậu | làm chủ bên trong, nuôi dưỡng |
| Vua | làm chủ bên ngoài, dẫn dắt, trách nhiệm |

**Quy trình:** viết theo từng file JSON (`major.json` còn 17 lá, mỗi bộ phụ 14 lá, riêng `minor-cups.json` còn 13 vì `cups-ace` đã có). Sau mỗi file chạy `npm run cards:validate`.
Mỗi lá: 3 từ khóa/hướng (ngắn, ≤ 5 âm tiết mỗi từ khóa), `meaning` 2-3 câu (100-280 ký tự), 2 prompts/hướng. Văn bản phải **nguyên bản**, không chép từ sách hay trang khác.

## 10. Hình ảnh lá bài

- Nguồn chính: bản quét bộ Rider-Waite-Smith 1909 (họa sĩ Pamela Colman Smith) trên Wikimedia Commons, thuộc phạm vi công cộng tại Hoa Kỳ. `[MỞ]` Chủ dự án xác nhận pháp lý cho các khu vực khác trước khi ra mắt công khai.
- Xử lý: `public/cards/{id}.webp` 560×960, chất lượng 80 (≤ 60 KB/ảnh); `public/cards/og/{id}.jpg` 300×514 dùng cho ảnh chia sẻ.
- Ghi nguồn: `docs/ATTRIBUTIONS.md` và trang `/about`.
- **Phương án dự phòng** (khi thiếu ảnh hoặc ảnh lỗi): mặt bài chữ-số-biểu-tượng, vẽ bằng CSS/SVG theo mục "TarotCard" ở file 04.
- Mặt sau lá bài: SVG tự thiết kế, mô tả ở file 04 mục 8.

## 11. Chuỗi giao diện

Mọi chuỗi giao diện đặt trong `messages/vi.json`, khóa dạng `screen.element`. Văn bản cụ thể từng màn nằm ở file 05; khi triển khai, chép sang `vi.json` đúng nguyên văn, giữ các placeholder `{name}`.
