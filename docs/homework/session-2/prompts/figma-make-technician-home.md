# Figma Make prompt — My Work (technician home)

> Filled instance of the course's "โครงสร้าง Prompt ของ Figma Make". Kept short on
> purpose: Figma Make works best with the five-block structure and a guideline path.

Task:
สร้างหน้า My Work เพื่อให้ช่างภาคสนามเห็นงานของตนวันนี้และเข้าไปทำงานได้ในหนึ่งแตะ

Context:
ผลิตภัณฑ์คือ SiteOps สำหรับทีม facility อาคารสำนักงาน (PRD-SOPS-001)
หน้าจอนี้แก้ปัญหาช่างไม่รู้ว่างานไหนเป็นของตน และงาน P1 จมอยู่ในลิสต์ (UC-002, INS-001)

Elements:
- OfflineBanner ด้านบน (แสดงเมื่อ offline พร้อมจำนวนที่รอส่ง)
- รายการ WorkOrderCard variant field เรียง P1 ก่อน (RULE-009) แต่ละใบมี StatusBadge, priority badge, SlaCountdown ถ้า P1, indicator รอส่ง
- Empty state "ยังไม่มีงานวันนี้" พร้อมไอคอน
- ใช้ component จาก DESIGN.md §6 เท่านั้น

Behavior:
- ผู้ใช้สามารถแตะการ์ดเพื่อเปิด Work Order Detail
- รองรับสถานะ Loading (จาก cache ทันที + บรรทัด "ซิงค์ล่าสุด"), Empty, Error (sync ล้มเหลวรายใบ พร้อม retry), Success
- แสดง Default, Hover, Focus, Disabled states ของการ์ดและปุ่ม
- รองรับ Mobile เป็นหลัก (360×800) และ Tablet

Constraints:
- ใช้ Auto Layout และ Responsive Constraints
- อ่าน DESIGN.md, UX.md, A11Y.md ก่อนเริ่ม
- ใช้ semantic tokens จาก DESIGN.md §2.2 เท่านั้น ห้าม hardcode สีและ spacing
- Dark theme เป็นค่าเริ่มต้นของ field surface และต้องมี Light ด้วย
- รองรับ WCAG 2.2 AA; touch target อย่างน้อย 56px (A11Y-007); icon + label ทุก status (A11Y-003)
- รองรับภาษาไทยและข้อความยาว; ใช้คำจาก UX.md §6 เท่านั้น
- Reuse component ที่มีอยู่ก่อนสร้างใหม่; ถ้าต้องสร้างใหม่ให้ list ไว้ใต้ "Proposed additions"
