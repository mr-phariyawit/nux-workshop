# PRD: SiteOps — Work Order Management (PRD-ID: PRD-SOPS-001)

> **Simulated.** Produced by applying the course's `Convert_to_PRD` prompt to
> [02-requirements.md](02-requirements.md). Sections follow the course template
> verbatim. Acceptance criteria not explicit in the source are tagged `[DRAFT]`.
> Nothing here was added beyond the discovery transcript except where marked
> under Assumptions.

- เวอร์ชัน: 1.0
- สถานะ: Draft
- Owner: Aeternix PM
- อัปเดตล่าสุด: 2026-09-19

## 1. Product Context

- ฟีเจอร์/โปรดักต์นี้คืออะไร? ระบบ work-order สำหรับทีม facility ของอาคารสำนักงาน ครอบคลุมรับแจ้ง แจกงาน อัปเดตภาคสนาม หลักฐาน และ dashboard SLA
- ทำไมต้องทำตอนนี้? ลูกค้ามีบทปรับ SLA กับ tenant รายใหญ่ที่พิสูจน์การปฏิบัติตามไม่ได้ และเคยเสียหายจากการหาหลักฐานให้ประกันไม่เจอ กระบวนการปัจจุบัน (LINE + กระดาษ + Excel) ไม่ scale

## 2. Problem Statement

- เรากำลังแก้ปัญหาอะไร? งานซ่อมกระจายอยู่หลายช่องทาง ไม่มีบันทึกกลาง สถานะล่าช้าเพราะภาคสนามไม่มีสัญญาณ หลักฐานอยู่ในเครื่องส่วนตัว รายงานผู้บริหารต้องรวบรวมด้วยมือ
- ใครคือคนที่มีปัญหาเหล่านี้? Facility Manager (บันทึกและติดตาม), Field Technician (อัปเดตและถ่ายรูปในสภาพยาก), Building Ops Director (รายงานและความรับผิด)

## 3. Goals & Non-goals

- Goals
  - พิสูจน์เวลารับงานและครบกำหนด SLA ของ P1 ได้ 100% ของ P1 work order
  - รูปหลักฐานทุกใบงานที่ปิดอยู่ในระบบกลาง
  - รายงานงานค้างและ P1 ดูได้ทันทีโดยไม่ต้องรวบรวมด้วยมือ
  - ช่างอัปเดตสถานะได้ ณ เวลาที่ทำจริง แม้ไม่มีสัญญาณ
- Non-goals
  - จัดซื้ออะไหล่
  - Billing tenant
  - IoT sensor integration

## 4. Target Users / Personas

- Persona 1: **Facility Manager** — รับแจ้ง สร้าง/แจก/ติดตามงาน ทำงานบน desktop ที่ counter; ต้องการภาพรวมและความมั่นใจว่าไม่มีงานหาย
- Persona 2: **Field Technician** — รับและปิดงานบนมือถือ ในพื้นที่ไม่มีสัญญาณ ใส่ถุงมือ แสงน้อย บางส่วนเป็น outsource และชาวพม่า อ่านไทยได้บ้าง; ต้องการทำงานเร็ว กดผิดยาก
- Persona 3: **Building Ops Director** — ดู dashboard และรายงาน; ต้องการตัวเลขที่เชื่อถือได้สำหรับผู้บริหารและประกัน

## 5. Use Cases / Jobs To Be Done

- UC-001: ในฐานะ Facility Manager ฉันต้องการบันทึกการแจ้งซ่อมจากทุกช่องทางไว้ที่เดียว เพื่อให้ไม่มีงานตกหล่น
- UC-002: ในฐานะ Facility Manager ฉันต้องการแจกงานให้ช่างในผลัด เพื่อให้ช่างรู้งานของตนโดยไม่ต้องผ่าน LINE
- UC-003: ในฐานะ Field Technician ฉันต้องการอัปเดตสถานะและถ่ายรูปได้แม้ไม่มีสัญญาณ เพื่อให้สถานะตรงกับเวลาที่ทำจริง
- UC-004: ในฐานะ Field Technician ฉันต้องการปิดงานพร้อมรูปหลักฐานที่ผูกกับงาน เพื่อให้หาหลักฐานได้ภายหลัง
- UC-005: ในฐานะ Facility Manager ฉันต้องการเห็นเวลารับงานและครบกำหนด SLA ของ P1 เพื่อพิสูจน์กับ tenant
- UC-006: ในฐานะ Building Ops Director ฉันต้องการ dashboard งานค้างและ P1 เพื่อรายงานผู้บริหารได้ทันที
- UC-007: ในฐานะ Field Technician ฉันต้องการเห็นประวัติการซ่อมของอุปกรณ์ เพื่อไม่ต้องจำเอง
- UC-008: ในฐานะ Facility Manager ฉันต้องการรวมใบงานที่แจ้งซ้ำ เพื่อไม่ให้ช่างทำงานซ้ำซ้อน

## 6. Assumptions / Constraints / Dependencies

- Assumptions
  - A-001: เฟสแรกใช้ local account ที่ Facility Manager สร้างให้ เพราะ AD ยังไม่ยืนยันและ outsource ไม่มี email (ต้องยืนยันกับ IT ก่อน sign-off)
  - A-002: "แก้ชั่วคราวใน 4 ชั่วโมง" นับจากเวลาแจ้ง (conservative; ต้องยืนยัน)
  - A-003: SLA ของ P2/P3 จะเป็นค่าที่ตั้งได้ในระบบ โดยไม่กำหนด default ในเฟสแรก
- Constraints
  - PDPA ของบริษัท: รูปอยู่ในระบบกลางเท่านั้น ลบได้เมื่อ tenant ขอ
  - ผู้ใช้ภาคสนามใช้มือถือขณะใส่ถุงมือ แสงน้อย ไม่มีสัญญาณ
- Dependencies
  - IT ของลูกค้า (AD, LINE integration)
  - นโยบาย PDPA ฉบับปัจจุบัน

## 7. Functional Requirements

### FR-SOPS-001: Unified work-order intake
- คำอธิบาย: ระบบต้องให้ Facility Manager สร้าง work order โดยระบุช่องทางที่แจ้ง (โทร / LINE / กระดาษ), สถานที่ (ชั้น/โซน), อุปกรณ์ (ถ้ามี), รายละเอียด, และ priority
- Use cases ที่เกี่ยวข้อง: [UC-001]
- ผู้ใช้งานหลัก / actor หลัก: Facility Manager
- Triggers / inputs: การแจ้งจาก tenant
- ผลลัพธ์ที่คาดหวัง: work order สถานะ `New` พร้อมเวลาแจ้ง

### FR-SOPS-002: Priority and SLA clock
- คำอธิบาย: ระบบต้องกำหนด priority P1/P2/P3 และสำหรับ P1 ต้องเริ่มนับเวลา acknowledge (15 นาที) และ temporary fix (4 ชั่วโมง) โดยแสดงเวลาคงเหลือ
- Use cases ที่เกี่ยวข้อง: [UC-005, UC-006]
- ผู้ใช้งานหลัก: Facility Manager, Building Ops Director
- Triggers / inputs: การสร้าง work order, การ acknowledge
- ผลลัพธ์ที่คาดหวัง: deadline ทั้งสองแสดงบนงานและ dashboard

### FR-SOPS-003: Assignment
- คำอธิบาย: ระบบต้องให้ Facility Manager แจกงานให้ช่างที่อยู่ในผลัด และช่างเห็นเฉพาะงานของตนบนมือถือ
- Use cases ที่เกี่ยวข้อง: [UC-002]
- ผู้ใช้งานหลัก: Facility Manager, Field Technician
- Triggers / inputs: work order สถานะ `New`
- ผลลัพธ์ที่คาดหวัง: work order สถานะ `Assigned` ผูกกับช่าง

### FR-SOPS-004: Offline-first field updates
- คำอธิบาย: ระบบต้องให้ช่างเปลี่ยนสถานะ (Acknowledge, In Progress, Temporary Fix, Done) และแนบรูปได้ขณะไม่มีสัญญาณ โดยบันทึกเวลาที่กระทำจริงบนอุปกรณ์ และ sync เมื่อมีสัญญาณ
- Use cases ที่เกี่ยวข้อง: [UC-003]
- ผู้ใช้งานหลัก: Field Technician
- Triggers / inputs: การกระทำบนมือถือขณะ offline
- ผลลัพธ์ที่คาดหวัง: event ถูก queue และ sync ตามลำดับเวลาจริง

### FR-SOPS-005: Photo evidence bound to work order
- คำอธิบาย: ระบบต้องเก็บรูปที่ถ่ายผ่านแอปไว้ในระบบกลาง ผูกกับ work order และไม่เก็บสำเนาในคลังรูปส่วนตัวของอุปกรณ์
- Use cases ที่เกี่ยวข้อง: [UC-004]
- ผู้ใช้งานหลัก: Field Technician
- Triggers / inputs: ถ่ายรูปในแอป
- ผลลัพธ์ที่คาดหวัง: รูปแสดงบน work order พร้อมเวลาถ่าย

### FR-SOPS-006: Close with evidence
- คำอธิบาย: ระบบต้องไม่อนุญาตให้เปลี่ยนสถานะเป็น `Done` ถ้า work order ไม่มีรูปหลักฐานอย่างน้อย 1 รูป
- Use cases ที่เกี่ยวข้อง: [UC-004]
- ผู้ใช้งานหลัก: Field Technician
- Triggers / inputs: การกด Done
- ผลลัพธ์ที่คาดหวัง: ถูกบล็อกพร้อมคำอธิบายจนกว่าจะแนบรูป

### FR-SOPS-007: Evidence deletion on request
- คำอธิบาย: ระบบต้องให้ Facility Manager ลบรูปที่ tenant ร้องขอ โดยบันทึกว่าลบเมื่อไหร่และเพราะอะไร
- Use cases ที่เกี่ยวข้อง: [UC-004]
- ผู้ใช้งานหลัก: Facility Manager
- Triggers / inputs: คำขอจาก tenant
- ผลลัพธ์ที่คาดหวัง: รูปถูกลบ มี audit record

### FR-SOPS-008: Operations dashboard
- คำอธิบาย: ระบบต้องแสดงจำนวนงานค้างแยกตาม priority, งาน P1 ที่ใกล้/เกิน SLA, และงานที่ปิดในวัน
- Use cases ที่เกี่ยวข้อง: [UC-006]
- ผู้ใช้งานหลัก: Building Ops Director, Facility Manager
- Triggers / inputs: เปิด dashboard
- ผลลัพธ์ที่คาดหวัง: ตัวเลข ณ เวลาปัจจุบัน

### FR-SOPS-009: Asset history
- คำอธิบาย: ระบบต้องให้ผูก work order กับอุปกรณ์ และแสดงประวัติ work order ทั้งหมดของอุปกรณ์นั้น
- Use cases ที่เกี่ยวข้อง: [UC-007]
- ผู้ใช้งานหลัก: Field Technician
- Triggers / inputs: เปิดหน้าอุปกรณ์
- ผลลัพธ์ที่คาดหวัง: รายการ work order เรียงตามเวลา

### FR-SOPS-010: Duplicate merge
- คำอธิบาย: ระบบต้องให้ Facility Manager รวม work order ที่แจ้งซ้ำเข้าเป็นใบเดียว โดยเก็บผู้แจ้งทุกคนไว้
- Use cases ที่เกี่ยวข้อง: [UC-008]
- ผู้ใช้งานหลัก: Facility Manager
- Triggers / inputs: work order ที่คล้ายกัน
- ผลลัพธ์ที่คาดหวัง: ใบงานหลัก 1 ใบ ใบซ้ำสถานะ `Merged`

### FR-SOPS-011: Field-friendly technician UI
- คำอธิบาย: หน้าจอของช่างต้องใช้ปุ่มขนาดใหญ่ มีไอคอนประกอบทุก action หลัก และอ่านได้ในที่มืด
- Use cases ที่เกี่ยวข้อง: [UC-003, UC-004]
- ผู้ใช้งานหลัก: Field Technician
- Triggers / inputs: ทุกหน้าจอฝั่งช่าง
- ผลลัพธ์ที่คาดหวัง: กดได้ขณะใส่ถุงมือ เข้าใจได้โดยไม่พึ่งข้อความอย่างเดียว

## 8. Non-functional Requirements

- Performance: ไม่ได้มีการพูดถึง
- Reliability: offline queue ต้องไม่สูญหายเมื่อแอปถูกปิดหรือแบตหมด [DRAFT]
- Security / privacy: รูปเก็บในระบบกลาง, ลบได้ตามคำขอ, มี audit trail ของการลบและการเปลี่ยนสถานะ
- UX / accessibility: mobile-first สำหรับช่าง, ถุงมือ, แสงน้อย, ไอคอนประกอบข้อความ, ภาษาไทยเป็นหลัก

## 9. Business Rules

- BR-SOPS-001: P1 ต้องถูก acknowledge ภายใน 15 นาทีนับจากเวลาแจ้ง
- BR-SOPS-002: P1 ต้องถึงสถานะ Temporary Fix ภายใน 4 ชั่วโมงนับจากเวลาแจ้ง (ดู A-002)
- BR-SOPS-003: work order ปิดไม่ได้ถ้าไม่มีรูปหลักฐาน
- BR-SOPS-004: รูปหลักฐานอยู่ในระบบกลางเท่านั้น
- BR-SOPS-005: เวลาของ event ภาคสนามคือเวลาที่กระทำบนอุปกรณ์ ไม่ใช่เวลาที่ sync

## 10. User Flows (High-level)

- FLOW-SOPS-001: Intake → Assign → Field update → Close
  1. Facility Manager สร้าง work order (New)
  2. Facility Manager แจกงาน (Assigned)
  3. ช่างกด Acknowledge (Acknowledged, บันทึกเวลา)
  4. ช่างเริ่มงาน (In Progress)
  5. ช่างถ่ายรูป และกด Temporary Fix หรือ Done
  6. ระบบ sync เมื่อมีสัญญาณ; dashboard อัปเดต
- FLOW-SOPS-002: Duplicate merge
  1. Facility Manager เห็นใบงานคล้ายกัน
  2. เลือกใบหลัก รวมใบซ้ำ
  3. ใบซ้ำสถานะ Merged ผู้แจ้งทุกคนอยู่บนใบหลัก
- FLOW-SOPS-003: Evidence deletion
  1. tenant ร้องขอลบรูป
  2. Facility Manager ลบพร้อมระบุเหตุผล
  3. ระบบบันทึก audit

## 11. Edge Cases & Error Scenarios

- ช่างทำงานเสร็จ 10:00 ที่ B2, sync 14:00 → เวลาที่แสดงต้องเป็น 10:00
- แอปถูกปิดหรือแบตหมดขณะมี event ค้าง sync → event ต้องยังอยู่ [DRAFT]
- ถ่ายรูปพลาด (ถุงมือ) → ต้องลบและถ่ายใหม่ได้ก่อน sync
- ช่างลาออก → รูปยังอยู่ในระบบ
- tenant หลายคนแจ้งเรื่องเดียวกัน → merge
- P1 ที่ยังไม่มีคน acknowledge ใกล้ 15 นาที → ต้องแจ้งเตือน Facility Manager [DRAFT]

## 12. Out-of-scope

- จัดซื้ออะไหล่
- Billing tenant
- IoT sensor integration
- LINE integration (รอการตัดสินใจ ดู Open Questions)

## 13. Success Metrics

- 100% ของ P1 มีเวลารับงานที่ตรวจสอบได้
- 100% ของ work order ที่ปิดมีรูปหลักฐานในระบบกลาง
- เวลาที่ใช้ทำรายงานผู้บริหารรายเดือน จาก 2 วัน เหลือ < 1 ชั่วโมง [DRAFT]
- อัตรางาน P1 เกิน SLA ลดลง (baseline ยังไม่ทราบ)

## 14. Acceptance Criteria (แยกตาม FR)

### AC-SOPS-001 (สำหรับ FR-SOPS-001)
GIVEN Facility Manager อยู่หน้า intake
WHEN กรอกช่องทาง สถานที่ รายละเอียด และ priority แล้วบันทึก
THEN work order ถูกสร้างด้วยสถานะ New และมี timestamp เวลาแจ้ง

### AC-SOPS-002 (สำหรับ FR-SOPS-002)
GIVEN work order priority P1 ถูกสร้างเวลา T
WHEN ยังไม่มีผู้ acknowledge
THEN ระบบแสดง deadline acknowledge = T + 15 นาที และ temporary fix = T + 4 ชั่วโมง

### AC-SOPS-003 (สำหรับ FR-SOPS-003)
GIVEN work order สถานะ New
WHEN Facility Manager เลือกช่างในผลัดปัจจุบันและแจกงาน
THEN สถานะเป็น Assigned และงานปรากฏในรายการของช่างคนนั้นเท่านั้น

### AC-SOPS-004 (สำหรับ FR-SOPS-004)
GIVEN ช่างอยู่ในพื้นที่ไม่มีสัญญาณ
WHEN กด In Progress เวลา 10:00 และแนบรูป แล้วมีสัญญาณเวลา 14:00
THEN work order แสดง In Progress เวลา 10:00 และรูปพร้อมเวลาถ่ายจริง

### AC-SOPS-005 (สำหรับ FR-SOPS-004) [DRAFT]
GIVEN มี event ค้าง sync
WHEN แอปถูกปิดและเปิดใหม่
THEN event ยังอยู่ในคิวและ sync เมื่อมีสัญญาณ

### AC-SOPS-006 (สำหรับ FR-SOPS-006)
GIVEN work order ไม่มีรูปหลักฐาน
WHEN ช่างกด Done
THEN ระบบปฏิเสธและแสดงข้อความให้แนบรูป

### AC-SOPS-007 (สำหรับ FR-SOPS-005)
GIVEN ช่างถ่ายรูปในแอป
WHEN บันทึก
THEN รูปปรากฏบน work order ในระบบกลาง และไม่ปรากฏในคลังรูปของอุปกรณ์

### AC-SOPS-008 (สำหรับ FR-SOPS-007)
GIVEN tenant ร้องขอลบรูป
WHEN Facility Manager ลบพร้อมระบุเหตุผล
THEN รูปไม่แสดงอีก และ audit log มีผู้ลบ เวลา เหตุผล

### AC-SOPS-009 (สำหรับ FR-SOPS-008)
GIVEN มี work order ค้าง 12 ใบ เป็น P1 2 ใบ ซึ่ง 1 ใบเกิน SLA
WHEN เปิด dashboard
THEN แสดงค้าง 12, P1 2, เกิน SLA 1

### AC-SOPS-010 (สำหรับ FR-SOPS-009)
GIVEN อุปกรณ์มี work order 3 ใบในอดีต
WHEN เปิดหน้าอุปกรณ์
THEN แสดงทั้ง 3 ใบเรียงจากล่าสุด

### AC-SOPS-011 (สำหรับ FR-SOPS-010)
GIVEN work order A และ B แจ้งปัญหาเดียวกัน
WHEN Facility Manager รวม B เข้า A
THEN B สถานะ Merged และ A แสดงผู้แจ้งของทั้ง A และ B

### AC-SOPS-012 (สำหรับ FR-SOPS-011) [DRAFT]
GIVEN หน้าจอช่างบนมือถือ
WHEN ตรวจสอบปุ่ม action หลัก
THEN ทุกปุ่มมีพื้นที่แตะอย่างน้อย 48×48 px, มีไอคอน, และ contrast ผ่าน WCAG 2.2 AA

## 15. Open Questions

- SLA ของ P2 และ P3 [AMBIGUOUS]
- Login: AD หรือ local account [AMBIGUOUS] (ดู A-001)
- LINE integration รูปแบบใด [AMBIGUOUS]
- 4 ชั่วโมงนับจากเวลาแจ้งหรือเวลารับงาน [AMBIGUOUS] (ดู A-002)
- ใครมีสิทธิ์ merge [AMBIGUOUS] (PRD สมมติว่าเป็น Facility Manager)
- ต้องมี UI ภาษาพม่าหรือไอคอนเพียงพอ [AMBIGUOUS]
- ต้องการตัวอย่างใบแจ้งซ่อมกระดาษและ Excel

## 16. Changelog

- v1.0 - ดราฟต์แรกจาก discovery meeting 2026-09-15
