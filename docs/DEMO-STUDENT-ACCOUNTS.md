# Demo Student Accounts

## Overview

Demo student accounts were created from the "Student Details.jpg" class roll document (Government Bangla College, Department of Physics). All accounts were registered through the Supabase Admin API (server-side) and corresponding profiles + student records were inserted into the database.

## Account Statistics

| Metric | Value |
|--------|-------|
| Total students in source document | 25 |
| Accounts created successfully | 25 |
| Accounts skipped (already existed) | 0 |
| Accounts failed | 0 |
| Default password for all accounts | `Demo1234!` |
| Default status | `pending` (awaiting admin approval) |

## Complete Account Table

| Roll | Registration | Name | Session | Demo Email | Demo Phone | Demo Password | Status |
|------|--------------|------|---------|------------|------------|---------------|--------|
| 270021 | 2020151540 | Bisshojit Kumar Das | 2020-2021 | bisshojit.kumar.das@example.com | +88017000000001 | Demo1234! | pending |
| 270035 | 2020551564 | Md. Mehrab Hossain | 2020-2021 | mehrab.hossain@example.com | +88017000000002 | Demo1234! | pending |
| 270046 | 2020451510 | Rakibul Islam | 2020-2021 | rakibul.islam@example.com | +88017000000003 | Demo1234! | pending |
| 270058 | 2020515141 | Md. Shakil Ahmed | 2020-2021 | shakil.ahmed@example.com | +88017000000004 | Demo1234! | pending |
| 270067 | 2020951515 | Mst. Merina Aktar | 2020-2021 | merina.aktar@example.com | +88017000000005 | Demo1234! | pending |
| 270068 | 2020451538 | Tanvir Ahmed | 2020-2021 | tanvir.ahmed@example.com | +88017000000006 | Demo1234! | pending |
| 270071 | 2021638017 | Sharif Miah | 2020-2021 | sharif.miah@example.com | +88017000000007 | Demo1234! | pending |
| 270080 | 2020151513 | Md. Samiur Rahman M | 2020-2021 | samiur.rahman.m@example.com | +88017000000008 | Demo1234! | pending |
| 270085 | 2020251576 | Md. Sobuj Rana | 2020-2021 | sobuj.rana@example.com | +88017000000009 | Demo1234! | pending |
| 270086 | 2020751517 | Suria Khatun Shanta | 2020-2021 | suria.khatun.shanta@example.com | +880170000000010 | Demo1234! | pending |
| 270093 | 2020351520 | Md. Mahmudul Hasan | 2020-2021 | mahmudul.hasan@example.com | +880170000000011 | Demo1234! | pending |
| 270104 | 2020051587 | Shafia Sultana Bristy | 2020-2021 | shafia.sultana.bristy@example.com | +880170000000012 | Demo1234! | pending |
| 270105 | 2020251594 | Ahamudehulla Rakib | 2020-2021 | ahamudehulla.rakib@example.com | +880170000000013 | Demo1234! | pending |
| 270111 | 2020451592 | Md. Azom Mia | 2020-2021 | azom.mia@example.com | +880170000000014 | Demo1234! | pending |
| 270113 | 2020051596 | Shwapnil S. Nouri | 2020-2021 | shwapnil.s.nouri@example.com | +880170000000015 | Demo1234! | pending |
| 270116 | 2020851589 | Tanvir Ahmed | 2020-2021 | tanvir.ahmed2@example.com | +88017000000026 | Demo1234! | pending |
| 17013 | 19201060299 | Md. Sujon Hossen | 2019-2020 | sujon.hossen@example.com | +880170000000017 | Demo1234! | pending |
| 17029 | 19201060636 | Rashe Dur Rahman Rez | 2019-2020 | rashe.dur.rahman.rez@example.com | +880170000000018 | Demo1234! | pending |
| 17031 | 19201060385 | Tajmaika Taj Monir | 2019-2020 | tajmaika.taj.monir@example.com | +880170000000019 | Demo1234! | pending |
| 17043 | 19201060649 | Md. Burhanuddin | 2019-2020 | burhanuddin@example.com | +880170000000020 | Demo1234! | pending |
| 17044 | 19201060470 | Lima Khatun | 2019-2020 | lima.khatun@example.com | +880170000000021 | Demo1234! | pending |
| 17096 | 19201060185 | Sharmin Sultana Shan | 2019-2020 | sharmin.sultana.shan@example.com | +880170000000022 | Demo1234! | pending |
| 17028 | 19627000028 | Lijen Ahmmed | 2018-2019 | lijen.ahmmed@example.com | +880170000000023 | Demo1234! | pending |
| 17072 | 19627000072 | Tahmina Akter | 2018-2019 | tahmina.akter@example.com | +880170000000024 | Demo1234! | pending |
| 17085 | 19627000085 | Shuborna Parvin | 2018-2019 | shuborna.parvin@example.com | +880170000000025 | Demo1234! | pending |

## How to Use

1. **Login**: Go to `http://localhost:3000/login` and sign in with any student's demo email and password `Demo1234!`
2. **Profile**: After login, visit `/profile` to view account details or `/edit-profile` to update information
3. **Admin Approval**: Log in as admin (`minhazojy@gmail.com`) and visit `/admin/approvals` to approve/reject student registrations
4. **Admin Dashboard**: Visit `/admin/dashboard` to view statistics including pending student count

## Security Notes

- Demo credentials are for development/testing only
- All passwords are `Demo1234!` — change after first login
- The service role key used for account creation was NOT committed to the repository
- Temporary registration scripts were deleted after use
- All accounts have `email_confirmed_at` set (no email verification required)

## Database Tables Affected

- `auth.users` — 25 new authentication records
- `public.profiles` — 25 new profile records (role: student)
- `public.students` — 25 new student records (department_id: 1 = Physics, status: pending)

## Session Distribution

| Session | Count |
|---------|-------|
| 2018-2019 | 3 |
| 2019-2020 | 6 |
| 2020-2021 | 16 |

## Department

All students assigned to Department ID 1 (Physics).
