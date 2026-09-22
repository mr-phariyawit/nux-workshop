# Stitch prompt — Work Order Detail (field surface)

> Filled instance of the course's "โครงสร้าง Prompt ของ Google Stitch". Attach
> `PRD.md`, `DESIGN.md`, `UX.md` (and `A11Y.md`) as files. The confidence-level
> instructions and the precedence rule are copied from the course structure
> unchanged; only the bracketed slots are filled for SiteOps.

ฉันแนบไฟล์ PRD.md (product requirements), DESIGN.md (design system), UX.md (UX context:
ผู้ใช้, บริบทการใช้งาน, research evidence, กติกาพฤติกรรมของระบบ) และ A11Y.md
(accessibility) มาด้วย ให้ใช้ไฟล์เหล่านี้เป็น source of truth หลัก

สำคัญ: ข้อมูลใน UX.md ถูกแบ่งเป็น confidence level ให้ตีความต่างกันดังนี้
- confirmed: ใช้เป็นข้อเท็จจริง นำมาปรับ design ได้ทันที
- inferred: ใช้ได้แต่ต้อง treat เป็นสมมติฐาน ถ้ามีทางเลือกหลายแบบให้เลือกทางที่ปลอดภัยที่สุดสำหรับผู้ใช้
- suggested: เป็นข้อเสนอจาก best practice เท่านั้น ใช้ได้ถ้าไม่ขัดกับ PRD.md/DESIGN.md แต่ไม่ต้อง treat เป็นข้อบังคับ
- unknown: ห้ามเดาเป็นข้อเท็จจริง ถ้าจำเป็นต้องมี ให้เลือก pattern ที่ปลอดภัย/มาตรฐานที่สุด และ flag ไว้ในคำตอบว่าจุดนี้ยังไม่มีข้อมูลยืนยัน

ห้าม deviate จาก:
- colors, fonts, spacing และ component style ที่กำหนดไว้ใน DESIGN.md (ใช้ size tier `lg` เพราะเป็น field surface, dark theme เป็นค่าเริ่มต้น)
- navigation structure, information hierarchy และ interaction rule (RULE-001 ถึง RULE-009) ที่กำหนดไว้ใน UX.md
- context of use ใน UX.md WORLD-001: ไม่มีสัญญาณ ใส่ถุงมือ แสงน้อย ใช้มือเดียว ต้องมี offline banner, pending-sync state, และ primary action อยู่ bottom thumb zone
- accessibility ใน A11Y.md: target ≥ 56 px, icon + label ทุก action, contrast AA, focus visible
- glossary ใน UX.md §6: ใช้ "ใบงาน / รับงาน / เริ่มงาน / แก้ชั่วคราว / ปิดงาน / หลักฐาน / รอส่ง" เท่านั้น

ให้ดึง vibe/brand personality "Calm authority in a noisy building" จาก DESIGN.md §1
มาใช้กำหนดโทนโดยรวมของ design

ออกแบบ screen **Work Order Detail (field)** สำหรับ **SiteOps (PRD-SOPS-001)**
สำหรับ **Field Technician (USER-002)** เพื่อ **ดูรายละเอียดใบงานหนึ่งใบ เปลี่ยนสถานะ
ตาม FLOW-SOPS-001 และแนบรูปหลักฐาน (FR-SOPS-004, FR-SOPS-005, FR-SOPS-006, FR-SOPS-011)**

ยึดตาม DESIGN.md อย่างเคร่งครัดในเรื่อง:
- primary/secondary color, heading font และ body font, border radius, button style, spacing scale
- components: WorkOrderCard (variant field), StatusBadge, SlaCountdown (เฉพาะ P1), PhotoTile, OfflineBanner, Button lg

ยึดตาม PRD.md ในเรื่อง:
- content ที่ต้องมี: ID, ชื่องาน, สถานที่ (ชั้น/โซน), priority, สถานะปัจจุบัน, deadline SLA ถ้าเป็น P1, รูปหลักฐานที่แนบแล้ว
- functional element: ปุ่มสถานะถัดไปหนึ่งปุ่ม (รับงาน → เริ่มงาน → แก้ชั่วคราว/ปิดงาน), ปุ่มถ่ายรูป
- AC-SOPS-004, AC-SOPS-006, AC-SOPS-007, AC-SOPS-012

ยึดตาม UX.md ในเรื่อง:
- interaction pattern: RULE-003 (one primary action), RULE-004 (ปิดงาน ต้อง confirm sheet; รับงาน/เริ่มงาน มี undo toast)
- rule สำหรับแต่ละ state: offline (RULE-001), pending sync, loading จาก cache, empty photos, error upload, success
- ผลกระทบเมื่อผู้ใช้ทำผิด: ถ่ายรูปพลาดต้องลบ/ถ่ายใหม่ได้ก่อน sync; กด ปิดงาน โดยไม่มีรูปต้องถูกบล็อกพร้อมเหตุผล (RULE-005)
- research evidence ที่ confirmed: INS-001, INS-002, INS-003, INS-005

ถ้า PRD.md กับ UX.md ขัดกันเรื่อง flow ให้ยึดตาม UX.md

ถ้าจุดไหนใน UX.md ระบุว่า unknown (GAP-001 SLA ของ P2/P3, GAP-003 ภาษาพม่า)
ให้เลือก pattern ที่เป็นมาตรฐานของ field-service app และระบุในคำตอบว่าจุดนี้ยังต้อง
ตรวจสอบกับทีมภายหลัง

ให้ส่งมอบ 4 state ของหน้าเดียวกัน: (1) online, สถานะ Assigned, ยังไม่มีรูป
(2) offline, สถานะ In Progress, มี 1 รูป รอส่ง (3) ปิดงาน ถูกบล็อกเพราะไม่มีรูป
(4) confirmation sheet ก่อนปิดงาน

ให้คง design system นี้และ UX pattern นี้ให้เหมือนเดิมทุกครั้งที่ฉันขอให้สร้าง screen
อื่นๆ ต่อไปใน project นี้ โดย reference screen นี้เป็น baseline

## Prompt แต่ละหน้าถัดไป

สร้างหน้า **My Work (field list)** ในสไตล์เดียวกัน
สร้างหน้า **Intake (dashboard)** ในสไตล์เดียวกัน โดยใช้ size tier `md` และ light theme
