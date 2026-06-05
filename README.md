# Employee Management Test

![Employee Management Preview](docs/EmployeeManagement.png)

![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet&logoColor=white)
![C%23](https://img.shields.io/badge/C%23-Backend-239120?logo=csharp&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-CC2927?logo=microsoftsqlserver&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwindcss&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-API%20Testing-85EA2D?logo=swagger&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)

โปรเจกต์ทดสอบระบบจัดการพนักงานแบบ Full-stack ระบบแยกเป็น Backend API, Frontend Web App และ SQL Server database script

## ภาพรวม

- จัดการข้อมูลแผนกและพนักงานแบบ CRUD
- Login ด้วย JWT ก่อนใช้งานระบบ
- แสดงชื่อแผนกในรายการพนักงาน
- อัปโหลดรูปพนักงาน `.jpg`, `.jpeg`, `.png`, `.webp`
- Pagination ทั้งฝั่ง API และหน้าเว็บ
- Frontend รองรับภาษาไทยและอังกฤษ
- ทดสอบ API ได้ผ่าน Swagger

## เอกสารแยกตามส่วน

- [Backend README](backend/README.md) - วิธีรัน API, ตั้งค่า SQL Server, endpoints, Swagger
- [Frontend README](frontend/README.md) - วิธีรัน Next.js, env config, pages, UI notes
- [Database Script](database/01_create_database.sql) - script สำหรับสร้าง database และ tables

## วิธีรันแบบสั้น

สร้าง database:

```powershell
sqlcmd -S localhost -E -i database\01_create_database.sql
```

รัน backend:

```powershell
cd backend
dotnet restore
dotnet run
```

รัน frontend ใน terminal อีกหน้าต่าง:

```powershell
cd frontend
npm.cmd install
Copy-Item .env.local.example .env.local
npm.cmd run dev
```

เปิดเว็บ:

```text
http://localhost:3000
```

Swagger:

```text
http://localhost:5000/swagger
```

## Login สำหรับทดสอบ

```text
Username: admin
Password: Admin@12345
```

## หมายเหตุ

- ใช้ database script แค่ `01_create_database.sql`
- สามารถเพิ่มข้อมูลทดสอบผ่านหน้าเว็บหรือ Swagger ได้โดยตรง
- รายละเอียดแต่ละฝั่งอยู่ใน README ของ `backend` และ `frontend`
