# GAS Project By Kimhan

GitHub Pages portal สำหรับรวมลิงก์โปรเจกต์ทั้งหมดไว้ในหน้าเดียว

## ติดตั้ง
1. อัปโหลด `index.html`, `style.css`, `script.js`, `projects.js` ไปที่ root ของ repository `gas-project`
2. GitHub > Settings > Pages
3. Source: Deploy from a branch
4. Branch: `main` / Folder: `/ (root)`
5. เปิด `https://itpcmc2024.github.io/gas-project/`

## เพิ่มโปรเจกต์ในอนาคต
- กด `⚙️ จัดการโปรเจกต์`
- กรอกชื่อ / URL / ไอคอน / คำอธิบาย
- ข้อมูลจะบันทึกใน browser ด้วย localStorage

### ต้องการให้การ์ดใหม่แสดงทุกเครื่อง
GitHub Pages เป็น Static Website จึงไม่สามารถบันทึกกลับ GitHub ได้โดยตรงอย่างปลอดภัยโดยไม่ใช้ token/backend

วิธีที่แนะนำ:
1. เพิ่ม/แก้ไขการ์ดจากเมนูจัดการโปรเจกต์
2. กด `📋 คัดลอก projects.js`
3. เปิดไฟล์ `projects.js` ใน GitHub
4. Edit > วางทับทั้งหมด > Commit changes

หลัง GitHub Pages deploy เสร็จ ทุกเครื่องจะเห็นรายการใหม่

## สำรองข้อมูล
- Export JSON เพื่อสำรองรายการ
- Import JSON เพื่อนำกลับมาใช้ใน browser อื่น
