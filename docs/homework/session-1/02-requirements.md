# Session 1 · Step 2 — Convert_Requirement output

> **Simulated.** Produced by applying the course's `Convert_Requirement` prompt
> (role: Senior PM + BA) to [01-transcript.md](01-transcript.md). Only information
> present in the transcript is used. Anything unclear is tagged `[AMBIGUOUS]` and
> moved to section 11, per the prompt's rules.

## 0. บริบทการประชุม

- วันที่: 2026-09-15
- ผู้เข้าร่วม: Building Ops Director, Facility Manager, Head Technician (client); PM, UX Lead (Aeternix)
- วัตถุประสงค์หลัก: เข้าใจกระบวนการงานซ่อมปัจจุบันของทีม facility และปัญหา เพื่อกำหนด scope ระบบ work-order เฟสแรก

## 1. ปัญหา

- **Building Ops Director**: รายงานงานค้างให้ผู้บริหารไม่ได้ ต้องรวมจาก LINE และกระดาษ ใช้เวลา 2 วัน ตัวเลขไม่ตรง
- **Facility Manager**: รับแจ้งสามช่องทาง (โทร, LINE, ใบกระดาษ) พิมพ์ลง Excel เอง ตกหล่น ช่างรับงานใน LINE ไม่มีบันทึก
- **Head Technician**: B2–B3 ไม่มีสัญญาณ อัปเดตสถานะล่าช้าหลายชั่วโมง ใส่ถุงมือกดพลาด หน้าจอเล็ก พื้นที่มืด ไม่มีประวัติอุปกรณ์
- **Facility Manager**: พิสูจน์เวลารับงาน P1 ไม่ได้ ทั้งที่มีบทปรับกับ tenant
- **Building Ops Director**: รูปหลักฐานอยู่ในเครื่องส่วนตัวช่าง หาไม่เจอเมื่อประกันขอ
- **Head Technician**: tenant แจ้งซ้ำ เกิดใบงานซ้ำ

## 2. เป้าหมาย

- เป้าหมายทางธุรกิจ: พิสูจน์การปฏิบัติตาม SLA P1 กับ tenant รายใหญ่ได้ (หลีกเลี่ยงบทปรับ), มีหลักฐานสำหรับประกัน, รายงานผู้บริหารได้ทันที
- เป้าหมายของผลิตภัณฑ์: ช่องทางรับแจ้งเดียว, แจกงานและติดตามสถานะแบบ real-time เท่าที่สัญญาณเอื้อ, หลักฐานรูปผูกกับงานและเก็บในระบบกลาง, dashboard งานค้างและ P1

## 3. ผู้ใช้ / Personas

- **Facility Manager**: รับแจ้ง สร้างและแจกงาน ต้องการเห็นภาพรวมและรายงาน; ทำงานที่ counter/office บน desktop
- **Field Technician** (9 คน, มี outsource และชาวพม่า): รับงาน ทำงาน ถ่ายรูป ปิดงาน; อยู่ในพื้นที่ไม่มีสัญญาณ ใส่ถุงมือ แสงน้อย อ่านไทยได้บ้าง อ่านอังกฤษไม่ค่อยได้
- **Building Ops Director**: ดูรายงานและ dashboard; ต้องการตอบผู้บริหาร
- **Tenant** (ทางอ้อม): แจ้งซ่อม ปัจจุบันผ่านโทร/LINE/กระดาษ

## 4. Use Cases / Jobs To Be Done

- UC-001: ในฐานะ Facility Manager ฉันต้องการบันทึกการแจ้งซ่อมจากทุกช่องทางไว้ที่เดียว เพื่อให้ไม่มีงานตกหล่น
- UC-002: ในฐานะ Facility Manager ฉันต้องการแจกงานให้ช่างในผลัด เพื่อให้ช่างรู้งานของตนโดยไม่ต้องผ่าน LINE
- UC-003: ในฐานะ Field Technician ฉันต้องการอัปเดตสถานะและถ่ายรูปได้แม้ไม่มีสัญญาณ เพื่อให้สถานะตรงกับเวลาที่ทำจริง
- UC-004: ในฐานะ Field Technician ฉันต้องการปิดงานพร้อมรูปหลักฐานที่ผูกกับงาน เพื่อให้หาหลักฐานได้ภายหลัง
- UC-005: ในฐานะ Facility Manager ฉันต้องการเห็นเวลารับงานและครบกำหนด SLA ของ P1 เพื่อพิสูจน์กับ tenant
- UC-006: ในฐานะ Building Ops Director ฉันต้องการ dashboard งานค้างและ P1 เพื่อรายงานผู้บริหารได้ทันที
- UC-007: ในฐานะ Field Technician ฉันต้องการเห็นประวัติการซ่อมของอุปกรณ์ เพื่อไม่ต้องจำเอง
- UC-008: ในฐานะ Facility Manager ฉันต้องการรวมใบงานที่แจ้งซ้ำ เพื่อไม่ให้ช่างทำงานซ้ำซ้อน

## 5. Functional Requirements (Raw)

- FR-R-001: บันทึก work order จากการแจ้งทางโทร, LINE, และกระดาษ ลงระบบเดียว
- FR-R-002: กำหนด priority (อย่างน้อย P1, P2, P3) ให้ work order
- FR-R-003: แจกงานให้ช่างในผลัด และช่างเห็นงานของตน
- FR-R-004: ช่างอัปเดตสถานะและแนบรูปได้ขณะ offline และระบบ sync เมื่อมีสัญญาณ โดยเก็บเวลาที่กระทำจริง
- FR-R-005: บันทึกเวลารับงาน (acknowledge) และคำนวณ deadline SLA สำหรับ P1
- FR-R-006: ปิดงานได้เฉพาะเมื่อมีรูปหลักฐาน
- FR-R-007: รูปหลักฐานถูกเก็บในระบบกลาง ผูกกับ work order และลบได้ตามคำขอ tenant
- FR-R-008: dashboard แสดงงานค้าง จำนวน P1 และสถานะ SLA
- FR-R-009: ประวัติการซ่อมผูกกับอุปกรณ์ (asset)
- FR-R-010: รวม (merge) work order ที่แจ้งซ้ำ
- FR-R-011: UI สำหรับช่างใช้ปุ่มแบบไอคอน รองรับการใช้งานขณะใส่ถุงมือและในที่มืด

## 6. Non-functional Requirements (Raw)

- Offline tolerance: ต้องทำงานได้ที่ B2–B3 ซึ่งไม่มีสัญญาณ
- Usability ภาคสนาม: หน้าจอเล็ก, ถุงมือ, แสงน้อย
- ภาษา: ไทยเป็นหลัก, ผู้ใช้บางส่วนอ่านไทยได้บ้าง อ่านอังกฤษไม่ได้ (ไอคอนช่วย)
- Privacy: PDPA ของบริษัท รูปเก็บในระบบกลาง ลบได้เมื่อ tenant ขอ
- Auditability: พิสูจน์เวลารับงานและหลักฐานได้ต่อ tenant และประกัน
- Performance / availability: ไม่ได้มีการพูดถึง

## 7. Constraints / Dependencies / Risks

- ขึ้นกับ IT ของลูกค้าเรื่อง AD / login
- ช่าง outsource ไม่มี email บริษัท
- LINE integration ยังไม่กำหนดรูปแบบ
- ความเสี่ยง: offline sync ไม่ทำงานจริง ช่างกลับไปใช้ LINE
- ความเสี่ยง: ไอคอนอย่างเดียวอาจไม่พอสำหรับผู้ใช้ชาวพม่า

## 8. Business Rules (Raw)

- BR-R-001: P1 ต้องมีผู้รับงานภายใน 15 นาที และแก้ไขชั่วคราวภายใน 4 ชั่วโมง
- BR-R-002: work order ปิดไม่ได้ถ้าไม่มีรูปหลักฐาน
- BR-R-003: รูปหลักฐานต้องอยู่ในระบบของบริษัทเท่านั้น

## 9. Edge Cases / Special Scenarios

- ช่างทำงานเสร็จตอน 10:00 ที่ B2 แต่ sync ได้ตอนบ่าย เวลาที่บันทึกต้องเป็น 10:00
- tenant หลายคนแจ้งปัญหาเดียวกัน
- ช่างลาออก รูปต้องยังอยู่ในระบบ
- ถ่ายรูปทั้งที่ใส่ถุงมือ กดพลาด

## 10. Out-of-scope

- จัดซื้ออะไหล่
- Billing tenant
- IoT sensor integration (ปีหน้า)

## 11. Open Questions / Ambiguities

- [AMBIGUOUS] SLA ของ P2 และ P3 ยังไม่มีนิยาม
- [AMBIGUOUS] วิธี login: AD ของบริษัท หรือ local account สำหรับ outsource
- [AMBIGUOUS] รูปแบบ LINE integration (รับแจ้งจาก LINE OA? หรือแค่แจ้งเตือน?)
- [AMBIGUOUS] "แก้ชั่วคราวใน 4 ชั่วโมง" นับจากเวลาแจ้งหรือเวลารับงาน
- [AMBIGUOUS] ใครมีสิทธิ์ merge ใบงานซ้ำ
- [AMBIGUOUS] ระดับภาษา: ต้องมี UI ภาษาพม่าหรือไอคอนพอ
- ยังไม่มีตัวอย่างใบแจ้งซ่อมกระดาษและ Excel ปัจจุบัน
